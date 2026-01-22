// src/controllers/tokenController.js
import jwtService from "../services/jwtService";

let handleRefreshToken = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken; // đọc từ cookie
        if (!refreshToken) return res.status(401).json({ errCode: 1, message: "No refresh token" });

        const result = await jwtService.handleRefreshTokenService(refreshToken);
        if (result.errCode !== 0) return res.status(403).json(result);

        // ✅ Lưu refresh token mới vào cookie
        res.cookie("refreshToken", result.refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return res.status(200).json({
            errCode: 0,
            message: "Token refreshed",
            accessToken: result.accessToken,
        });
    } catch (error) {
        console.error("Refresh token error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

module.exports = {
    handleRefreshToken,
};
