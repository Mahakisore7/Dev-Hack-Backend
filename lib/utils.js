import jwt from "jsonwebtoken";

export const generateToken = (userId, role) => {
    const token = jwt.sign({ userId, role }, process.env.JWT_SECRET, {
        expiresIn: '24h'
    });
    return token;
};