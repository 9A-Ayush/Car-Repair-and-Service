import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const SECRET_KEY = process.env.JWT_SECRET || 'your-default-secret-key';

const generateToken = (userId) => { 
    const token = jwt.sign({ userId: userId }, SECRET_KEY, { expiresIn: "15d" });
    return token; 
};

const verifyToken = (token) => {
    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        return { valid: true, userId: decoded.userId };
    } catch (error) {
        return { valid: false, error: error.message };
    }
};

export { generateToken, verifyToken };
