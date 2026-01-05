import axios from "axios";
import db from "../models";
import jwt from "jsonwebtoken";
import { saveRefreshToken } from "../services/jwtService";
require("dotenv").config();

const handleFacebookLogin = async (req, res) => {
    const { accessToken } = req.body;

    if (!accessToken) {
        return res.status(400).json({
            errCode: 1,
            message: "Missing Facebook access token",
        });
    }

    try {
        // ✅ Verify token với Facebook Graph API
        const fbResponse = await axios.get(`https://graph.facebook.com/me`, {
            params: {
                access_token: accessToken,
                fields: "id,name,email",
            },
        });

        const { id, name, email } = fbResponse.data;

        if (!email) {
            return res.status(400).json({
                errCode: 2,
                message: "Facebook account does not provide email",
            });
        }

        // ✅ Kiểm tra user trong DB
        let user = await db.User.findOne({ where: { email } });

        if (!user) {
            const [firstName, ...lastNameParts] = name.split(" ");

            user = await db.User.create({
                email,
                firstName: firstName || "",
                lastName: lastNameParts.join(" ") || "",
                roleId: "R3",
                password: "",
                facebookId: id, // nên lưu
            });
        }

        // ✅ Tạo accessToken (2h)
        const accessTokenJWT = jwt.sign(
            {
                id: user.id,
                email: user.email,
                role: user.roleId,
            },
            process.env.JWT_SECRET || "piscean_secret_key",
            { expiresIn: "2h" }
        );

        // ✅ Tạo refreshToken (7 ngày)
        const refreshToken = jwt.sign({ id: user.id }, process.env.JWT_REFRESH_SECRET || "piscean_refresh_secret_key", { expiresIn: "7d" });

        await saveRefreshToken(user.id, refreshToken);

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return res.status(200).json({
            errCode: 0,
            message: "Facebook login successful",
            user,
            accessToken: accessTokenJWT,
        });
    } catch (error) {
        console.error("Facebook login error:", error);
        return res.status(500).json({
            errCode: 3,
            message: "Invalid Facebook token",
        });
    }
};

module.exports = {
    handleFacebookLogin,
};
