import { OAuth2Client } from "google-auth-library";
import db from "../models";
import jwt from "jsonwebtoken";
require("dotenv").config();

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

let handleGoogleLogin = async (req, res) => {
    const { token } = req.body;

    if (!token) {
        return res.status(400).json({ errCode: 1, message: "Missing Google token" });
    }

    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const email = payload.email;

        // Kiểm tra user trong DB
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

        // Tạo JWT của hệ thống bạn
        const jwtToken = jwt.sign(
            {
                id: user.id,
                email: user.email,
                role: user.roleId,
            },
            process.env.JWT_SECRET || "piscean_secret_key",
            { expiresIn: "2h" }
        );

        return res.status(200).json({
            errCode: 0,
            message: "Google login successful",
            user,
            token: jwtToken,
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
