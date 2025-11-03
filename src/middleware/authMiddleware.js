// authMiddleware.js
import jwt from "jsonwebtoken";

// Middleware xác thực người dùng (bắt buộc có token hợp lệ)
export const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Access denied. No token provided." });
    }

    const token = authHeader.split(" ")[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "piscean_secret_key");
        req.user = decoded; // gắn thông tin user (id, email, role)
        next();
    } catch (err) {
        return res.status(403).json({ message: "Invalid or expired token." });
    }
};

// Middleware phân quyền — chỉ cho phép role cụ thể
export const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized: No user info found." });
        }

        const userRole = req.user.role; // roleId từ token (vd: R1, R2)
        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({ message: "Forbidden: You do not have permission." });
        }

        next(); // có quyền → đi tiếp
    };
};
