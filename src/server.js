import express from "express";
import bodyParser from "body-parser";
import viewEngine from "./config/viewEngine";
import initWebRoutes from "./route/web";
import connectDB from "./config/connectDB";
import cors from "cors";
import { startCleanupCronJobs } from "./cron/cleanupDatabaseCron";
import { startCancelUnconfirmedBookingsCron } from "./cron/cancelUnconfirmedBookingsCron";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import initChatRoutes from "./route/chatRoute";
import initRecommendationRoutes from "./route/recommendationRoute";
import cookieParser from "cookie-parser";
import http from "http";
import { Server } from "socket.io";

require("dotenv").config();

const allowedOrigins = process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(",").map((o) => o.trim().replace(/\/+$/, "")) : [];

console.log("✅ Allowed Origins:", allowedOrigins);

let app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        credentials: true,
    },
});

app.set("io", io);

io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);
    socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
    });
});

// Security & Performance
app.use(helmet());
app.use(morgan("combined"));
app.use(compression());

// ✅ CORS - CHỈ DÙNG MỘT MIDDLEWARE DUY NHẤT
app.use(
    cors({
        origin: function (origin, callback) {
            // Cho phép server-to-server, Postman
            if (!origin) return callback(null, true);

            const normalizedOrigin = origin.trim().replace(/\/+$/, "");

            console.log("📥 Incoming origin:", normalizedOrigin);
            console.log("✓ Is allowed?", allowedOrigins.includes(normalizedOrigin));

            if (allowedOrigins.includes(normalizedOrigin)) {
                // ✅ Trả về origin đã normalize (không có /)
                return callback(null, normalizedOrigin);
            }

            return callback(new Error(`CORS blocked origin: ${origin}`));
        },
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept", "Authorization"],
    }),
);

// ❌ XÓA HOÀN TOÀN MIDDLEWARE NÀY - NÓ ĐANG GHI ĐÈ CORS
// app.use(function (req, res, next) {
//     res.setHeader("Access-Control-Allow-Origin", process.env.URL_REACT_SERVER);
//     res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
//     res.setHeader("Access-Control-Allow-Headers", "X-Requested-With,content-type");
//     res.setHeader("Access-Control-Allow-Credentials", true);
//     next();
// });

// Body parser
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());

// Routes
viewEngine(app);
initWebRoutes(app);
initChatRoutes(app);
initRecommendationRoutes(app);

// Database & Cron
connectDB();
startCleanupCronJobs();
startCancelUnconfirmedBookingsCron();

let port = process.env.PORT || 6969;

server.listen(port, () => {
    console.log("🚀 Backend Nodejs is running on port:", port);
});
