import rateLimit from "express-rate-limit";

/**
 * Rate limit cho API đăng nhập
 */
export const loginApiRatingLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 phút
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,

    keyGenerator: (req) => {
        const email = req.body?.email || "unknown-email";
        const ip = rateLimit.ipKeyGenerator(req); // ✅ FIX IPv6

        return `${ip}:${email}`;
    },

    handler: (req, res) => {
        return res.status(429).json({
            errCode: 429,
            errMessage: "Bạn đã đăng nhập quá nhiều lần. Vui lòng thử lại sau 1 phút.",
        });
    },
});

/**
 * Rate limit cho API gửi OTP
 */
export const otpApiRateLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 phút
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,

    keyGenerator: (req) => {
        const ip = rateLimit.ipKeyGenerator(req); // ✅ FIX IPv6

        const email = req.body?.email;
        const phoneNumber = req.body?.phoneNumber;

        if (email) {
            return `${ip}:email:${email}`;
        }

        if (phoneNumber) {
            return `${ip}:phone:${phoneNumber}`;
        }

        return `${ip}:unknown-otp`;
    },

    handler: (req, res) => {
        return res.status(429).json({
            errCode: 429,
            errMessage: "Bạn đã yêu cầu OTP quá nhiều lần. Vui lòng thử lại sau vài phút.",
        });
    },
});
