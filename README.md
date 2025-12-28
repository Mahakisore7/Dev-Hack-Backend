# 🚒 ResQ-AI Backend (Server)

Agentic Incident Response & Real-Time Coordination System

---

## 📌 Overview

ResQ-AI Backend is a **high-performance Node.js server** powering the ResQ-AI platform.  
It enables **real-time emergency incident reporting, AI-assisted severity triage, duplicate consolidation, and live command-center updates** using WebSockets.

The system is designed for **smart cities, emergency services, and disaster-response coordination**, ensuring fast, credible, and scalable incident handling.

---

## ✨ Key Features

### 🛡️ Dual-Role Authentication
- Secure **JWT-based authentication**
- Two user roles:
  - **Citizen** – Mobile app users who report incidents
  - **Admin** – Command Center operators who validate and manage incidents

---

### 🧠 AI Severity Triage
- Lightweight **heuristic NLP engine**
- Automatically assigns severity during incident creation:
  - **High** – Fire, Blood, Explosion, Accident
  - **Medium** – Smoke, Traffic, Crowd
  - **Low** – Pothole, Noise, Garbage

---

### 🔗 Consolidation Engine (Merge Logic)
- Detects **duplicate incident reports** using geospatial proximity
- Uses **atomic MongoDB transactions**
- Merges duplicates into a single verified incident
- Converts duplicate reports into **verification votes (+1 credibility)**

---

### 👍 Consensus & Credibility System
- Citizens can:
  - **Upvote (Verify)** → +1
  - **Downvote (Reject)** → -1
- Automatic rejection when vote score ≤ **-5**
- Net score determines whether an incident is valid or rejected

---

### 📡 Real-Time Event Loop
- **Socket.io integration**
- Live push updates to Admin Dashboard:
  - New incidents
  - Incident merges
  - Status updates
  - Vote changes

---

### 🌍 Geospatial Core
- MongoDB **2dsphere indexing**
- Enables:
  - Radius-based searches
  - Location clustering
  - Duplicate detection using proximity

---

## 🛠️ Tech Stack

| Layer | Technology |
|------|-----------|
| Runtime | Node.js |
| Framework | Express.js |
| Database | MongoDB |
| ODM | Mongoose |
| Real-Time | Socket.io |
| Security | JWT, BCrypt, CORS |
| Architecture | MVC with Service Layer |

---

## 🚀 Getting Started

### 1️⃣ Prerequisites
- Node.js **v18+**
- MongoDB (Local installation or Atlas URI)

---

### 2️⃣ Installation

```bash
git clone <repository_url>
cd Dev-Hack-Backend
npm install
```

---

### 3️⃣ Environment Configuration

Create a `.env` file in the root directory:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/resq_ai_db
JWT_SECRET=your_super_secret_key_change_this
NODE_ENV=development
```

---

### 4️⃣ Seed Admin User

The public API only allows **Citizen registration**.  
To create the first **Admin**, run:

```bash
node createAdmin.js
```

---

### 5️⃣ Run the Server

```bash
# Development mode (with nodemon)
npm run dev

# Production mode
npm start
```

---

## 🔌 API Documentation

### 🟢 Authentication (`/api/auth`)

| Method | Endpoint | Description | Access |
|------|--------|------------|--------|
| POST | /signup | Register a new Citizen | Public |
| POST | /login | Login (Returns JWT + Role) | Public |

---

### 🚨 Incidents (`/api/incidents`)

| Method | Endpoint | Description | Access |
|------|--------|------------|--------|
| POST | / | Report a new incident (Auto severity) | Citizen |
| GET | / | Get local incident feed (Newest first) | Citizen |
| POST | /:id/upvote | Verify an incident (+1) | Citizen |
| POST | /:id/downvote | Reject an incident (-1) | Citizen |

---

### 👮 Admin Command Center (`/api/admin`)

| Method | Endpoint | Description | Access |
|------|--------|------------|--------|
| GET | /feed | Priority feed (Severity → Votes) | Admin |
| PATCH | /:id | Update status or add notes | Admin |
| POST | /merge | Merge duplicate incidents | Admin |
| GET | /seed | Generate demo test data | Admin |

---

## 📡 Socket.io Events (Real-Time)

| Event Name | Payload | Trigger |
|----------|--------|--------|
| new-incident | { incidentObject } | Citizen submits a report |
| incident-updated | { incidentObject } | Status, notes, or votes updated |
| incident-merged | { primaryId, duplicateId } | Admin merges incidents |

---

## 📂 Project Structure

```
Dev-Hack-Backend/
├── controllers/
├── middleware/
├── models/
├── routes/
├── lib/
├── server.js
└── createAdmin.js
```

---

## 🧪 Testing the Merge Logic (Demo)

1. Create Incident A – Fire at Lab (10.0, 10.0)
2. Create Incident B – Smoke at Lab (10.0001, 10.0001)
3. Login as Admin
4. Merge using POST /api/admin/merge

```json
{
  "primaryId": "ID_OF_A",
  "duplicateId": "ID_OF_B"
}
```

---

## 📌 Summary

ResQ-AI Backend provides:
- Low-latency emergency coordination
- High incident credibility through consensus
- Scalable real-time architecture
- Production-grade geospatial intelligence
