require("dotenv").config();
import db from "../models/index";
import { VNPay, ignoreLogger, ProductCode, VnpLocale, dateFormat } from "vnpay";
const moment = require("moment");

const TIMEFRAME_MAP = {
    T1: "08:00",
    T2: "09:00",
    T3: "10:00",
    T4: "11:00",
    T5: "13:00",
    T6: "14:00",
    T7: "15:00",
    T8: "16:00",
};

const vnpay = new VNPay({
    tmnCode: process.env.VNP_TMNCODE,
    secureSecret: process.env.VNP_HASHSECRET,
    vnpayHost: process.env.VNP_URL || "https://sandbox.vnpayment.vn",
    testMode: true,
    hashAlgorithm: "SHA512",
    // enableLog: true,  // nếu muốn log chi tiết
});

const isBookingExpired = (booking) => {
    if (!booking || !booking.createdAt || !booking.date || !booking.timeType) {
        return true; // fail-safe
    }

    const now = moment();

    // Thời điểm bắt đầu khám
    const timeStr = TIMEFRAME_MAP[booking.timeType];
    if (!timeStr) return true;

    const appointmentTime = moment(`${moment(booking.date).format("YYYY-MM-DD")} ${timeStr}`, "YYYY-MM-DD HH:mm");

    // Nếu khám trong cùng ngày
    if (appointmentTime.isSame(now, "day")) {
        return now.isAfter(appointmentTime.subtract(0, "hour"));
    }

    // Nếu khác ngày → quá 24h kể từ lúc tạo
    const expireByCreatedAt = moment(booking.createdAt).add(24, "hours");
    return now.isAfter(expireByCreatedAt);
};

let createVnpayPaymentUrlService = (req) => {
    return new Promise(async (resolve, reject) => {
        try {
            let { token, doctorId } = req.body;

            if (!token || !doctorId) {
                resolve({
                    errCode: 1,
                    errMessage: "Missing token or doctorId",
                });
                return;
            }

            // ===== 1. Lấy booking =====
            let appointmentInfo = await db.Booking.findOne({
                where: {
                    doctorId: doctorId,
                    token: token,
                    statusId: "S1", // CHỈ cho phép khi chưa confirm
                },
                include: [
                    {
                        model: db.User,
                        as: "doctorHasAppointmentWithPatients",
                        include: [
                            {
                                model: db.Doctor_infor,
                                include: [
                                    {
                                        model: db.Allcode,
                                        as: "priceTypeData",
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        model: db.Allcode,
                        as: "appointmentTimeTypeData",
                    },
                ],
                raw: false,
            });

            if (!appointmentInfo) {
                resolve({
                    errCode: 2,
                    errMessage: "Booking not found or already confirmed",
                });
                return;
            }

            // ===== 2. CHECK HẾT HẠN NGAY TẠI ĐÂY =====
            if (isBookingExpired(appointmentInfo)) {
                resolve({
                    errCode: 4,
                    errMessage: "Booking confirmation/payment link expired",
                });
                return;
            }

            // ===== 3. Lấy số tiền =====
            let amountToBePaid = appointmentInfo?.doctorHasAppointmentWithPatients?.Doctor_infor?.priceTypeData?.value_Vie;

            if (!amountToBePaid) {
                resolve({
                    errCode: 5,
                    errMessage: "Invalid payment amount",
                });
                return;
            }

            // ===== 4. Lấy IP =====
            let ipAddr = req.headers["x-forwarded-for"] || req.connection.remoteAddress || req.socket.remoteAddress || req.ip;

            if (ipAddr === "::1" || ipAddr === "127.0.0.1") {
                ipAddr = "127.0.0.1";
            }

            // ===== 5. Tạo payment URL =====
            const returnUrl = appointmentInfo.paymentMethod === "PM2" ? `${process.env.VNP_RETURNURL_POST_VISIT_PAYMENT}?token=${token}&doctorId=${doctorId}` : `${process.env.VNP_RETURNURL}?token=${token}&doctorId=${doctorId}`;

            const paymentUrl = await vnpay.buildPaymentUrl({
                vnp_Amount: amountToBePaid,
                vnp_IpAddr: ipAddr,
                vnp_ReturnUrl: returnUrl,
                vnp_TxnRef: `TXN${Date.now()}`,
                vnp_OrderInfo: "Thanh toán dịch vụ khám bệnh",
            });

            resolve({
                errCode: 0,
                message: "Create payment url successfully!",
                url: paymentUrl,
            });
        } catch (e) {
            console.error("createVnpayPaymentUrlService error:", e);
            reject(e);
        }
    });
};

module.exports = {
    createVnpayPaymentUrlService: createVnpayPaymentUrlService,
};
