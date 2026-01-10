import rateLimit, { ipKeyGenerator } from "express-rate-limit";

export const ratingLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 phút
    max: 5,

    standardHeaders: true,
    legacyHeaders: false,
});
