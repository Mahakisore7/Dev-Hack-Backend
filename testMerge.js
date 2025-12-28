import fetch from "node-fetch";

const API_URL = "http://localhost:5000/api";

async function runTest() {
    console.log("🚀 STARTING AUTOMATED MERGE TEST...");

    // 1. LOGIN (Get Token)
    console.log("\n🔐 Step 1: Logging in as Admin...");
    const loginRes = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "admin@prometeo.com", password: "admin123" })
    });
    const loginData = await loginRes.json();
    
    if (!loginData.token) {
        console.log("⚠️ SERVER RESPONSE:", JSON.stringify(loginData, null, 2));
        console.error("❌ Login Failed!");
        return;
    }
    const TOKEN = loginData.token;
    console.log("✅ Logged In! Token acquired.");

    // 2. SEED DATA (Create Incidents)
    console.log("\n🌱 Step 2: Seeding Test Incidents...");
    // We hit the seed endpoint to ensure we have data to merge
    await fetch(`${API_URL}/admin/seed`, {
        headers: { "token": TOKEN } 
    });
    
    // 3. GET INCIDENTS (To find IDs)
    const feedRes = await fetch(`${API_URL}/admin/feed`, {
        headers: { "token": TOKEN }
    });
    const feedData = await feedRes.json();
    const incidents = feedData.data;

    // We need at least 2 incidents to merge
    if (!incidents || incidents.length < 2) {
        console.error("❌ Not enough incidents to test merge! (Try running seed again)");
        return;
    }

    // Pick the first two incidents
    const primary = incidents[0];
    const duplicate = incidents[1];

    console.log(`\n🎯 Target Acquired:`);
    console.log(`   Primary ID (Keeping):   ${primary._id} (Votes: ${primary.voteCount || 0})`);
    console.log(`   Duplicate ID (Deleting): ${duplicate._id}`);

    // 4. PERFORM MERGE
    console.log("\n⚡ Step 3: Merging Duplicate into Primary...");
    const mergeRes = await fetch(`${API_URL}/admin/merge`, {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            "token": TOKEN 
        },
        body: JSON.stringify({
            primaryId: primary._id,
            duplicateId: duplicate._id
        })
    });
        const mergeData = await mergeRes.json();
    
        if (mergeData.success) {
            console.log("✅ Merge Successful!");
            console.log(JSON.stringify(mergeData, null, 2));
        } else {
            console.error("❌ Merge Failed!", mergeData.message);
        }
    }
    
    runTest();