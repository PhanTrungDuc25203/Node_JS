// src/services/tokenService.js
import jwt from "jsonwebtoken";
import db from "../models/index";

let generateAccessToken = (user) => {
    return jwt.sign(
        {
            id: user.id,
            email: user.email,
            role: user.roleId,
        },
        process.env.JWT_SECRET || "piscean_secret_key",
        { expiresIn: "2h" }
    );
};

let generateRefreshToken = (user) => {
    return jwt.sign({ id: user.id }, process.env.JWT_REFRESH_SECRET || "piscean_refresh_secret_key", { expiresIn: "7d" });
};

let saveRefreshToken = async (userId, refreshToken) => {
    let existing = await db.AuthToken.findOne({ where: { userId } });
    let expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    if (existing) {
        existing.refreshToken = refreshToken;
        existing.expiresAt = expiresAt;
        await existing.save();
    } else {
        await db.AuthToken.create({
            userId,
            refreshToken,
            expiresAt,
        });
    }
};

let verifyRefreshToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_REFRESH_SECRET || "piscean_refresh_secret_key");
    } catch {
        return null;
    }
};

let handleRefreshTokenService = (refreshToken) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!refreshToken) return resolve({ errCode: 1, message: "Missing refresh token" });

            let record = await db.AuthToken.findOne({ where: { refreshToken } });
            if (!record) return resolve({ errCode: 2, message: "Invalid refresh token" });

            let decoded = verifyRefreshToken(refreshToken);
            if (!decoded) return resolve({ errCode: 3, message: "Expired refresh token" });

            let user = await db.User.findByPk(decoded.id);
            if (!user) return resolve({ errCode: 4, message: "User not found" });

            const newAccessToken = generateAccessToken(user);
            const newRefreshToken = generateRefreshToken(user);
            await saveRefreshToken(user.id, newRefreshToken);

            resolve({
                errCode: 0,
                message: "Token refreshed successfully",
                accessToken: newAccessToken,
                refreshToken: newRefreshToken,
            });
        } catch (error) {
            reject(error);
        }
    });
};

module.exports = {
    generateAccessToken,
    generateRefreshToken,
    saveRefreshToken,
    handleRefreshTokenService,
};
