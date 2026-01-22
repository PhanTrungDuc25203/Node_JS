require("dotenv").config();
import nodemailer from "nodemailer";

let sendAEmail = async (sentData) => {
    let transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: Number(process.env.EMAIL_PORT),
        secure: process.env.EMAIL_SECURE === "true",
        auth: {
            user: process.env.SENDER_EMAIL,
            pass: process.env.EMAIL_APP_PASSWORD,
        },
    });

    let getHtmlEmailDependLanguage = (sentData) => {
        let result = "";

        if (sentData.language === "vi") {
            result = `
                <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                    <h3>Xin chào ${sentData.patientName},</h3>
                    <p>Cuộc hẹn của quý khách với bác sĩ của <b>MedicalCare</b> vừa được hoàn thành:</p>
                    <ul>
                        <li><b>Thời gian:</b> ${sentData.time}</li>
                        <li><b>Bác sĩ:</b> ${sentData.doctorName}</li>
                        <li><b>Nơi khám:</b> ${sentData.clinicAddress}</li>
                    </ul>
                    <p><i>Xin mời quý khách tiền hành thanh toán bằng đường link phía dưới:</i></p>
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
        } else if (sentData.language === "en") {
            // 🇺🇸 English
            result = `
                <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                    <h3>Hello ${sentData.patientName},</h3>
                    <p>Your appointment with the doctor at <b>MedicalCare</b> has just been completed:</p>
                    <ul>
                        <li><b>Time:</b> ${sentData.time}</li>
                        <li><b>Doctor:</b> ${sentData.doctorName}</li>
                        <li><b>Clinic:</b> ${sentData.clinicAddress}</li>
                    </ul>
                    <p><i>Please proceed with the payment using the link below:</i></p>
                    <div style="margin-top: 20px;">
                        <a href="${sentData.redirectLink}" target="_blank"
                            style="display: inline-block; background-color: #007bff; color: #fff;
                            padding: 12px 20px; border-radius: 6px; text-decoration: none;
                            font-weight: bold;">
                        💳 Pay Now
                        </a>
                    </div>
                    <p style="margin-top: 30px;">
                        Thank you for trusting <b>MedicalCare</b>!<br/>
                        Wishing you a wonderful day 🌿
                    </p>
                </div>
            `;
        }

        return result;
    };

    // async..await is not allowed in global scope, must use a wrapper
    // send mail with defined transport object
    const removeVietnameseTones = (str) => {
        return str
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/đ/g, "d")
            .replace(/Đ/g, "D");
    };

    let safePatientName = removeVietnameseTones(sentData.patientName);

    let info = await transporter.sendMail({
        from: '"MedicalCare " <phantrungduc2522005@gmail.com>',
        to: sentData.receiverEmail,
        subject: "Thanh toán dịch vụ khám bệnh ✔",
        html: getHtmlEmailDependLanguage(sentData),

        attachments: sentData.medicalReport
            ? [
                  {
                      filename: `Ket_qua_kham_benh_${safePatientName}_MedicalCare.txt`,
                      content: Buffer.from(sentData.medicalReport),
                      contentType: "text/plain",
                  },
              ]
            : [],
    });
};

module.exports = {
    sendAEmail,
};
