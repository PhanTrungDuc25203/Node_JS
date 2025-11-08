require("dotenv").config();
import db from "../models/index";
import { VNPay, ignoreLogger, ProductCode, VnpLocale, dateFormat } from "vnpay";

const vnpay = new VNPay({
    tmnCode: process.env.VNP_TMNCODE,
    secureSecret: process.env.VNP_HASHSECRET,
    vnpayHost: process.env.VNP_URL || "https://sandbox.vnpayment.vn",
    testMode: true,
    hashAlgorithm: "SHA512",
    // enableLog: true,  // nếu muốn log chi tiết
});

let createVnpayPaymentUrlService = (req) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Lấy thông tin cuộc hẹn để cho vào vnp_OrderInfo và amount (chưa xong)
            let { token, doctorId } = req.body;

            let appointmentInfo = await db.Booking.findOne({
                where: {
                    doctorId: doctorId,
                    token: token,
                },
                attributes: {
                    exclude: ["patientBirthday", "patientAddress", "createdAt", "updatedAt", "patientGender"],
                },
                include: [
                    {
                        model: db.User,
                        as: "doctorHasAppointmentWithPatients",
                        attributes: ["id", "firstName", "lastName", "address", "phoneNumber"],
                        include: [
                            {
                                model: db.Doctor_infor,
                                attributes: {
                                    exclude: ["id", "doctorId", "provinceId", "specialtyId", "clinicId", "note", "count"],
                                },
                                include: [
                                    {
                                        model: db.Allcode,
                                        as: "priceTypeData",
                                        attributes: ["value_Eng", "value_Vie"],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        model: db.Allcode,
                        as: "appointmentTimeTypeData",
                        attributes: ["value_Vie", "value_Eng"],
                    },
                ],
                raw: false,
            });

            let amountToBePaid = appointmentInfo?.doctorHasAppointmentWithPatients?.Doctor_infor?.priceTypeData?.value_Vie;

            // Lấy IP
            let ipAddr = req.headers["x-forwarded-for"] || req.connection.remoteAddress || req.socket.remoteAddress || req.ip;
            if (ipAddr === "::1" || ipAddr === "127.0.0.1") {
                ipAddr = "127.0.0.1";
            }

            // "appointmentInfo": {
            //     "id": 8,
            //     "statusId": "S1",
            //     "doctorId": 21,
            //     "patientId": 3,
            //     "date": "2024-10-24T17:00:00.000Z",
            //     "patientPhoneNumber": "01111111113",
            //     "token": "27969668-93e2-4e6d-afba-0a9879caad8c",
            //     "examReason": "Tôi bị đau đầu",
            //     "timeType": "T2",
            //     "paymentMethod": "PM3",
            //     "paymentStatus": "PT1",
            //     "paidAmount": 0,
            //     "doctorHasAppointmentWithPatients.id": 21,
            //     "doctorHasAppointmentWithPatients.firstName": "Phương",
            //     "doctorHasAppointmentWithPatients.lastName": "Phạm Hiểu",
            //     "doctorHasAppointmentWithPatients.address": "16 Phạm Ngũ Lão, phường Đông Sơn, Thanh Hóa, Vietnam",
            //     "doctorHasAppointmentWithPatients.phoneNumber": "03737372626",
            //     "doctorHasAppointmentWithPatients.Doctor_infor.id": 11,
            //     "doctorHasAppointmentWithPatients.Doctor_infor.priceId": "PRI5",
            //     "doctorHasAppointmentWithPatients.Doctor_infor.paymentId": "PAY3",
            //     "doctorHasAppointmentWithPatients.Doctor_infor.clinicAddress": "16 Phạm Ngũ Lão, phường Đông Sơn, Thanh Hóa, Vietnam",
            //     "doctorHasAppointmentWithPatients.Doctor_infor.clinicName": "Phòng khám Đa khoa Phụ Sản Đông Sơn",
            //     "doctorHasAppointmentWithPatients.Doctor_infor.createdAt": "2024-10-06T09:48:08.000Z",
            //     "doctorHasAppointmentWithPatients.Doctor_infor.updatedAt": "2024-10-06T09:48:08.000Z",
            //     "doctorHasAppointmentWithPatients.Doctor_infor.priceTypeData.id": 51,
            //     "doctorHasAppointmentWithPatients.Doctor_infor.priceTypeData.value_Eng": "30",
            //     "doctorHasAppointmentWithPatients.Doctor_infor.priceTypeData.value_Vie": "400000",
            //     "appointmentTimeTypeData.value_Vie": "9:00 - 10:00",
            //     "appointmentTimeTypeData.value_Eng": "9:00 AM - 10:00 AM"
            // }

            // Tạo url thanh toán

            const returnUrl = appointmentInfo.paymentMethod === "PM2" ? `${process.env.VNP_RETURNURL_POST_VISIT_PAYMENT}?token=${req.body.token}&doctorId=${req.body.doctorId}` : `${process.env.VNP_RETURNURL}?token=${req.body.token}&doctorId=${req.body.doctorId}`;
            const paymentUrl = await vnpay.buildPaymentUrl({
                vnp_Amount: amountToBePaid,
                vnp_IpAddr: ipAddr,
                vnp_ReturnUrl: returnUrl,
                vnp_TxnRef: `TXN${Date.now()}`,
                vnp_OrderInfo: "Thanh toán dịch vụ khám bệnh", //hardcode
            });

            console.log("check payment url: ", paymentUrl);

            resolve({
                errCode: 0,
                message: "Create payment url sucessfully!",
                url: paymentUrl,
            });
        } catch (e) {
            reject(e);
        }
    });
};

module.exports = {
    createVnpayPaymentUrlService: createVnpayPaymentUrlService,
};
