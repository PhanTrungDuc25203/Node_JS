require("dotenv").config();
import nodemailer from "nodemailer";

let sendMedicalReportToPatient = async (sentData) => {
    let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
            user: process.env.SENDER_EMAIL,
            pass: process.env.EMAIL_APP_PASSWORD,
        },
    });

    let htmlBody = `
        <h3>Xin chào ${sentData.patientName},</h3>
        <p>Bạn nhận được kết quả khám bệnh từ hệ thống MedicalCare.</p>
        <p><b>Bác sĩ phụ trách:</b> ${sentData.doctorName}</p>
        <p><b>Ngày khám:</b> ${sentData.appointmentDate}</p>
        <p><b>Khung giờ:</b> ${sentData.appointmentTimeFrame}</p>
        <p>Vui lòng xem file bệnh án đính kèm phía dưới.</p>
        <p>Trân trọng,<br/>MedicalCare</p>
    `;

    await transporter.sendMail({
        from: `"MedicalCare" <${process.env.SENDER_EMAIL}>`,
        to: sentData.receiverEmail,
        subject: `Kết quả khám bệnh - MedicalCare`,
        html: htmlBody,

        // File đính kèm
        attachments: sentData.medicalReport
            ? [
                  {
                      filename: `Medical_Report_${sentData.patientName}.txt`,
                      content: Buffer.from(sentData.medicalReport, "base64"),
                      contentType: "text/plain",
                  },
              ]
            : [],
    });
};

module.exports = {
    sendMedicalReportToPatient,
};
