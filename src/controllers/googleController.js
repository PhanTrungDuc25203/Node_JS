import { OAuth2Client } from "google-auth-library";
import db from "../models";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { saveRefreshToken } from "../services/jwtService";
require("dotenv").config();

const client = new OAuth2Client(process.env.OAUTH_CLIENT_ID);

const handleGoogleLogin = async (req, res) => {
    const { token } = req.body;

    if (!token) {
        return res.status(400).json({ errCode: 1, message: "Missing Google token" });
    }

    try {
        // ✅ Xác thực token Google
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.OAUTH_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const email = payload.email;

        // ✅ Kiểm tra user trong DB
        let user = await db.User.findOne({ where: { email } });
        if (!user) {
            user = await db.User.create({
                email,
                firstName: payload.given_name || "",
                lastName: payload.family_name || "",
                roleId: "R3",
                password: "", // Google login không có password
            });
        }

        // ✅ Tạo accessToken (2h)
        const accessToken = jwt.sign(
            {
                id: user.id,
                email: user.email,
                role: user.roleId,
            },
            process.env.JWT_SECRET || "piscean_secret_key",
            { expiresIn: "2h" }
        );

        // ✅ Tạo refreshToken (7 ngày)
        const refreshToken = jwt.sign(
            {
                id: user.id,
            },
            process.env.JWT_REFRESH_SECRET || "piscean_refresh_secret_key",
            { expiresIn: "7d" }
        );

        // ✅ Lưu refreshToken vào DB (nếu có bảng Token)
        await saveRefreshToken(user.id, refreshToken);

        // ✅ Gửi refreshToken qua cookie (bảo mật)
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", // bật Secure khi deploy
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
        });

        // ✅ Trả về accessToken và thông tin user
        return res.status(200).json({
            errCode: 0,
            message: "Google login successful",
            user,
            accessToken,
        });
    } catch (error) {
        console.error("Google login error:", error);
        return res.status(500).json({
            errCode: 2,
            message: "Invalid Google token",
        });
    }
};

module.exports = {
    handleGoogleLogin,
};
