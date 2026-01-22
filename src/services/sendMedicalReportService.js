require("dotenv").config();
import nodemailer from "nodemailer";

const thStyle = `
    border-top:1px solid #cccccc;
    border-bottom:1px solid #cccccc;
    padding:10px;
    text-align:left;
    background-color:#fafafa;
    font-weight:600;
`;

const thStyleCenter = `
    border-top:1px solid #cccccc;
    border-bottom:1px solid #cccccc;
    padding:10px;
    text-align:center;
    background-color:#fafafa;
    font-weight:600;
`;

const tdStyleLeft = `
    border-top:1px solid #e0e0e0;
    padding:10px;
    text-align:left;
`;

const tdStyleCenter = `
    border-top:1px solid #e0e0e0;
    padding:10px;
    text-align:center;
`;

const tdStyleCenterBold = `
    border-top:1px solid #e0e0e0;
    padding:10px;
    text-align:center;
    font-weight:600;
`;

const buildExamPackageResultHtml = (template, result) => {
    if (typeof template === "string") template = JSON.parse(template);
    if (typeof result === "string") result = JSON.parse(result);

    if (!template?.sections?.length) return "";

    let html = "";

    template.sections.forEach((section, sectionIndex) => {
        html += `
            <!-- Section title -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;">
                <tr>
                    <td style="
                        background-color:#f5f5f5;
                        padding:10px 12px;
                        font-weight:600;
                        font-size:15px;
                        border:1px solid #cccccc;
                    ">
                        ${section.title}
                    </td>
                </tr>
            </table>

            <!-- Result table -->
            <table width="100%" cellpadding="0" cellspacing="0" style="
                border-collapse:collapse;
                border-left:1px solid #cccccc;
                border-right:1px solid #cccccc;
                border-bottom:1px solid #cccccc;
                font-size:14px;
            ">
                <thead>
                    <tr>
                        <th style="${thStyle}">Chỉ số</th>
                        <th style="${thStyleCenter}">Kết quả</th>
                        <th style="${thStyleCenter}">Đơn vị</th>
                        <th style="${thStyleCenter}">Khoảng bình thường</th>
                    </tr>
                </thead>
                <tbody>
        `;

        section.fields.forEach((field, fieldIndex) => {
            const key = `${sectionIndex}-${fieldIndex}`;
            const value = result[key] ?? "—";

            html += `
                <tr>
                    <td style="${tdStyleLeft}">${field.label}</td>
                    <td style="${tdStyleCenterBold}">${value}</td>
                    <td style="${tdStyleCenter}">${field.unit || ""}</td>
                    <td style="${tdStyleCenter}">${field.normal_range || ""}</td>
                </tr>
            `;
        });

        html += `
                </tbody>
            </table>
        `;
    });

    return html;
};

let sendMedicalReportToPatient = async (sentData) => {
    let transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: Number(process.env.EMAIL_PORT),
        secure: process.env.EMAIL_SECURE === "true",
        auth: {
            user: process.env.SENDER_EMAIL,
            pass: process.env.EMAIL_APP_PASSWORD,
        },
    });

    if (sentData.examType === "doctorAppointment") {
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
    }

    if (sentData.examType === "examPackage") {
        const template = typeof sentData.examPackageResult.template === "string" ? JSON.parse(sentData.examPackageResult.template) : sentData.examPackageResult.template;

        const result = typeof sentData.examPackageResult.result === "string" ? JSON.parse(sentData.examPackageResult.result) : sentData.examPackageResult.result;

        const resultTableHtml = buildExamPackageResultHtml(template, result);

        let htmlBody = `
            <h3>Xin chào ${sentData.patientName},</h3>
            <p>Bạn nhận được kết quả <b>khám theo gói</b> từ hệ thống MedicalCare.</p>

            <p><b>Tên gói khám:</b> ${sentData.packageName}</p>
            <p><b>Cơ sở y tế:</b> ${sentData.medicalFacilityName}</p>
            <p><b>Ngày khám:</b> ${sentData.appointmentDate}</p>

            ${resultTableHtml}

            <p style="margin-top:20px;">
                Lưu ý: Kết quả trên chỉ mang tính chất tham khảo.
                Vui lòng liên hệ cơ sở y tế để được tư vấn chi tiết.
            </p>

            <p>Trân trọng,<br/>MedicalCare</p>
        `;

        await transporter.sendMail({
            from: `"MedicalCare" <${process.env.SENDER_EMAIL}>`,
            to: sentData.receiverEmail,
            subject: "Kết quả khám gói dịch vụ - MedicalCare",
            html: htmlBody,
        });
    }
};

module.exports = {
    sendMedicalReportToPatient,
};
