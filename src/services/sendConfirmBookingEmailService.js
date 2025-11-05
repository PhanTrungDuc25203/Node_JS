require("dotenv").config();
import nodemailer from "nodemailer";

let sendAEmail = async (sentData) => {
    let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // true for port 465, false for other ports
        auth: {
            user: process.env.SENDER_EMAIL,
            pass: process.env.EMAIL_APP_PASSWORD,
        },
    });

    let getHtmlEmailDependLanguage = (sentData) => {
        let result = "";

        if (sentData.language === "vi") {
            // 🇻🇳 Tiếng Việt
            if (sentData.isPayment) {
                // --- Trường hợp PM1: Thanh toán trước ---
                result = `
                <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                    <h3>Xin chào ${sentData.patientName},</h3>
                    <p>Bạn vừa đặt lịch khám bệnh tại <b>MedicalCare</b> với thông tin như sau:</p>
                    <ul>
                        <li><b>Thời gian:</b> ${sentData.time}</li>
                        <li><b>Bác sĩ:</b> ${sentData.doctorName}</li>
                        <li><b>Phòng khám:</b> ${sentData.clinicName}</li>
                        <li><b>Địa chỉ:</b> ${sentData.clinicAddress}</li>
                    </ul>
                    <p><i>Để hoàn tất việc đặt lịch, vui lòng thanh toán phí khám trước bằng cách nhấn nút bên dưới:</i></p>
                    <div style="margin-top: 20px;">
                        <a href="${sentData.redirectLink}" target="_blank"
                           style="display: inline-block; background-color: #007bff; color: #fff;
                                  padding: 12px 20px; border-radius: 6px; text-decoration: none;
                                  font-weight: bold;">
                            💳 Thanh toán ngay
                        </a>
                    </div>
                    <p style="margin-top: 30px;">Cảm ơn bạn đã tin tưởng <b>MedicalCare</b>!<br/>
                    Chúc bạn một ngày tốt lành 🌿</p>
                </div>
            `;
            } else {
                // --- Trường hợp xác nhận lịch khám thông thường ---
                result = `
                <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                    <h3>Xin chào ${sentData.patientName},</h3>
                    <p>Bạn vừa đặt lịch khám bệnh tại <b>MedicalCare</b> với thông tin như sau:</p>
                    <ul>
                        <li><b>Thời gian:</b> ${sentData.time}</li>
                        <li><b>Bác sĩ:</b> ${sentData.doctorName}</li>
                        <li><b>Phòng khám:</b> ${sentData.clinicName}</li>
                        <li><b>Địa chỉ:</b> ${sentData.clinicAddress}</li>
                    </ul>
                    <p><i>Hãy kiểm tra lại thông tin và nhấn vào đường link bên dưới để xác nhận lịch khám:</i></p>
                    <div style="margin-top: 20px;">
                        <a href="${sentData.redirectLink}" target="_blank"
                           style="display: inline-block; background-color: #28a745; color: #fff;
                                  padding: 12px 20px; border-radius: 6px; text-decoration: none;
                                  font-weight: bold;">
                            ✅ Xác nhận lịch khám
                        </a>
                    </div>
                    <p style="margin-top: 30px;">Cảm ơn bạn đã sử dụng <b>MedicalCare</b>!<br/>
                    Hẹn gặp bạn tại buổi khám 🩺</p>
                </div>
            `;
            }
        } else if (sentData.language === "en") {
            // 🇺🇸 English
            if (sentData.isPayment) {
                // --- Case PM1: Prepaid online payment ---
                result = `
                <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                    <h3>Dear ${sentData.patientName},</h3>
                    <p>You have booked a medical appointment at <b>MedicalCare</b> with the following details:</p>
                    <ul>
                        <li><b>Time:</b> ${sentData.time}</li>
                        <li><b>Doctor:</b> ${sentData.doctorName}</li>
                        <li><b>Clinic:</b> ${sentData.clinicName}</li>
                        <li><b>Address:</b> ${sentData.clinicAddress}</li>
                    </ul>
                    <p><i>To complete your booking, please pay the consultation fee by clicking the button below:</i></p>
                    <div style="margin-top: 20px;">
                        <a href="${sentData.redirectLink}" target="_blank"
                           style="display: inline-block; background-color: #007bff; color: #fff;
                                  padding: 12px 20px; border-radius: 6px; text-decoration: none;
                                  font-weight: bold;">
                            💳 Pay Now
                        </a>
                    </div>
                    <p style="margin-top: 30px;">Thank you for choosing <b>MedicalCare</b>!<br/>
                    Have a great day 🌿</p>
                </div>
            `;
            } else {
                // --- Case normal confirmation ---
                result = `
                <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                    <h3>Dear ${sentData.patientName},</h3>
                    <p>You have just scheduled a medical appointment at <b>MedicalCare</b> with the following details:</p>
                    <ul>
                        <li><b>Time:</b> ${sentData.time}</li>
                        <li><b>Doctor:</b> ${sentData.doctorName}</li>
                        <li><b>Clinic:</b> ${sentData.clinicName}</li>
                        <li><b>Address:</b> ${sentData.clinicAddress}</li>
                    </ul>
                    <p><i>Please confirm your appointment by clicking the button below:</i></p>
                    <div style="margin-top: 20px;">
                        <a href="${sentData.redirectLink}" target="_blank"
                           style="display: inline-block; background-color: #28a745; color: #fff;
                                  padding: 12px 20px; border-radius: 6px; text-decoration: none;
                                  font-weight: bold;">
                            ✅ Confirm Appointment
                        </a>
                    </div>
                    <p style="margin-top: 30px;">Thank you for trusting <b>MedicalCare</b>!<br/>
                    We look forward to seeing you soon 🩺</p>
                </div>
            `;
            }
        }

        return result;
    };

    // async..await is not allowed in global scope, must use a wrapper
    // send mail with defined transport object
    let info = await transporter.sendMail({
        from: '"Phan Piscean 👻" <phantrungduc2522005@gmail.com>', // sender address
        to: sentData.receiverEmail, // list of receivers
        subject: "Thông tin đặt lịch khám bệnh ✔", // Subject line
        text: "Gửi từ MedicalCare", // plain text body
        html: getHtmlEmailDependLanguage(sentData), // html body
    });

    console.log("Message sent: %s", info.messageId);
    // Message sent: <d786aa62-4e0a-070a-47ed-0b0666549519@ethereal.email>
};

module.exports = {
    sendAEmail,
};
