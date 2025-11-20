// controllers/aydController.js
import fetch from "node-fetch";
require("dotenv").config();

const createSession = async (req, res) => {
    try {
        const response = await fetch("https://www.askyourdatabase.com/api/chatbot/v2/session", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.AYD_API_KEY}`,
            },
            body: JSON.stringify({
                chatbotid: process.env.AYD_CHATBOT_ID,
                name: req.body.name || "Guest",
                email: req.body.email || "guest@example.com",
            }),
        });
        const data = await response.json();
        return res.json({ url: data.url });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Lỗi khi tạo session AYD" });
    }
};

export default { createSession };
