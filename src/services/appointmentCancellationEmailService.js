require("dotenv").config();
import nodemailer from "nodemailer";

let sendAppointmentCancellationEmail = async (sentData) => {
    let transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: Number(process.env.EMAIL_PORT),
        secure: process.env.EMAIL_SECURE === "true",
        auth: {
            user: process.env.SENDER_EMAIL,
            pass: process.env.EMAIL_APP_PASSWORD,
        },
        tls: {
            rejectUnauthorized: process.env.EMAIL_TLS_REJECT_UNAUTHORIZED === "true",
        },
    });

    let getHtmlEmailDependLanguage = (sentData) => {
        let result = "";

        if (sentData.language === "vi") {
            // 🇻🇳 Tiếng Việt
            result = `
            <!DOCTYPE html>
            <html lang="vi">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        line-height: 1.6;
                        color: #333;
                        max-width: 600px;
                        margin: 0 auto;
                        padding: 20px;
                        background-color: #f5f5f5;
                    }
                    .email-container {
                        background-color: #ffffff;
                        border-radius: 10px;
                        overflow: hidden;
                        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                    }
                    .header {
                        background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%);
                        color: white;
                        padding: 30px;
                        text-align: center;
                    }
                    .header h1 {
                        margin: 0;
                        font-size: 24px;
                        font-weight: bold;
                    }
                    .content {
                        padding: 30px;
                    }
                    .greeting {
                        font-size: 18px;
                        font-weight: bold;
                        margin-bottom: 20px;
                        color: #333;
                    }
                    .message {
                        margin-bottom: 25px;
                        color: #555;
                    }
                    .appointment-info {
                        background: #fff9c4;
                        border-left: 4px solid #ffc107;
                        padding: 20px;
                        margin: 20px 0;
                        border-radius: 4px;
                    }
                    .appointment-info h3 {
                        margin-top: 0;
                        color: #f57c00;
                        font-size: 16px;
                    }
                    .info-row {
                        display: flex;
                        padding: 8px 0;
                        border-bottom: 1px solid #ffe082;
                    }
                    .info-row:last-child {
                        border-bottom: none;
                    }
                    .info-label {
                        font-weight: bold;
                        width: 140px;
                        color: #555;
                    }
                    .info-value {
                        color: #333;
                        flex: 1;
                    }
                    .warning-box {
                        background: #ffebee;
                        border: 2px solid #f44336;
                        border-radius: 8px;
                        padding: 20px;
                        margin: 25px 0;
                        text-align: center;
                    }
                    .warning-box .icon {
                        font-size: 48px;
                        margin-bottom: 10px;
                    }
                    .warning-box h3 {
                        margin: 10px 0;
                        color: #c62828;
                        font-size: 18px;
                    }
                    .warning-box p {
                        margin: 5px 0;
                        color: #d32f2f;
                        font-weight: 500;
                    }
                    .next-steps {
                        background: #e3f2fd;
                        border-left: 4px solid #2196F3;
                        padding: 20px;
                        margin: 25px 0;
                        border-radius: 4px;
                    }
                    .next-steps h3 {
                        margin-top: 0;
                        color: #1976d2;
                        font-size: 16px;
                    }
                    .next-steps ul {
                        margin: 10px 0;
                        padding-left: 20px;
                        color: #555;
                    }
                    .next-steps li {
                        margin: 8px 0;
                    }
                    .contact-info {
                        background: #f5f5f5;
                        padding: 15px;
                        margin: 20px 0;
                        border-radius: 4px;
                        text-align: center;
                    }
                    .contact-info p {
                        margin: 5px 0;
                        color: #666;
                    }
                    .contact-info strong {
                        color: #333;
                    }
                    .apology {
                        text-align: center;
                        margin: 30px 0;
                        padding: 20px;
                        background: #fafafa;
                        border-radius: 8px;
                    }
                    .apology p {
                        margin: 10px 0;
                        color: #666;
                        font-style: italic;
                    }
                    .signature {
                        margin-top: 30px;
                        padding-top: 20px;
                        border-top: 1px solid #e0e0e0;
                        color: #666;
                    }
                    .footer {
                        text-align: center;
                        padding: 20px;
                        background-color: #f5f5f5;
                        color: #999;
                        font-size: 12px;
                    }
                    .footer p {
                        margin: 5px 0;
                    }
                </style>
            </head>
            <body>
                <div class="email-container">
                    <div class="header">
                        <div style="font-size: 48px; margin-bottom: 10px;">⚠️</div>
                        <h1>THÔNG BÁO HỦY LỊCH HẸN</h1>
                    </div>
                    
                    <div class="content">
                        <div class="greeting">Kính gửi ${sentData.patientName},</div>
                        
                        <div class="message">
                            <p>Chúng tôi rất tiếc phải thông báo rằng lịch hẹn khám bệnh của quý khách tại <strong>MedicalCare</strong> đã bị <strong style="color: #f44336;">HỦY BỎ</strong> bởi bác sĩ phụ trách.</p>
                        </div>

                        <div class="appointment-info">
                            <h3>📋 Thông tin lịch hẹn đã hủy:</h3>
                            <div class="info-row">
                                <div class="info-label">👨‍⚕️ Bác sĩ:</div>
                                <div class="info-value">${sentData.doctorName}</div>
                            </div>
                            <div class="info-row">
                                <div class="info-label">📅 Ngày khám:</div>
                                <div class="info-value">${sentData.date}</div>
                            </div>
                            <div class="info-row">
                                <div class="info-label">🕐 Giờ khám:</div>
                                <div class="info-value">${sentData.time}</div>
                            </div>
                        </div>

                        <div class="warning-box">
                            <div class="icon">🚫</div>
                            <h3>Lịch hẹn không còn hiệu lực</h3>
                            <p>Vui lòng KHÔNG đến khám vào thời gian đã đặt</p>
                        </div>

                        <div class="next-steps">
                            <h3>📞 Các bước tiếp theo:</h3>
                            <ul>
                                <li><strong>Đặt lịch mới:</strong> Đăng nhập vào hệ thống để chọn khung giờ khám khác phù hợp với bạn</li>
                                <li><strong>Liên hệ hỗ trợ:</strong> Gọi hotline <strong>0355828343</strong> để được tư vấn và hỗ trợ đặt lịch</li>
                                <li><strong>Email:</strong> Gửi thắc mắc đến <strong>phantrungduc2522005@gmail.com</strong></li>
                            </ul>
                        </div>

                        <div class="apology">
                            <p>💐 Chúng tôi chân thành xin lỗi vì sự bất tiện này</p>
                            <p>Mong quý khách thông cảm và tiếp tục tin tưởng sử dụng dịch vụ của <strong>MedicalCare</strong></p>
                        </div>

                        <div class="signature">
                            <p><strong>Trân trọng,</strong></p>
                            <p><strong>Ban quản lý MedicalCare</strong> 🏥</p>
                        </div>
                    </div>

                    <div class="footer">
                        <p>Email này được gửi tự động, vui lòng không trả lời trực tiếp.</p>
                        <p>© 2024 MedicalCare. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
            `;
        } else if (sentData.language === "en") {
            // 🇺🇸 English
            result = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        line-height: 1.6;
                        color: #333;
                        max-width: 600px;
                        margin: 0 auto;
                        padding: 20px;
                        background-color: #f5f5f5;
                    }
                    .email-container {
                        background-color: #ffffff;
                        border-radius: 10px;
                        overflow: hidden;
                        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                    }
                    .header {
                        background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%);
                        color: white;
                        padding: 30px;
                        text-align: center;
                    }
                    .header h1 {
                        margin: 0;
                        font-size: 24px;
                        font-weight: bold;
                    }
                    .content {
                        padding: 30px;
                    }
                    .greeting {
                        font-size: 18px;
                        font-weight: bold;
                        margin-bottom: 20px;
                        color: #333;
                    }
                    .message {
                        margin-bottom: 25px;
                        color: #555;
                    }
                    .appointment-info {
                        background: #fff9c4;
                        border-left: 4px solid #ffc107;
                        padding: 20px;
                        margin: 20px 0;
                        border-radius: 4px;
                    }
                    .appointment-info h3 {
                        margin-top: 0;
                        color: #f57c00;
                        font-size: 16px;
                    }
                    .info-row {
                        display: flex;
                        padding: 8px 0;
                        border-bottom: 1px solid #ffe082;
                    }
                    .info-row:last-child {
                        border-bottom: none;
                    }
                    .info-label {
                        font-weight: bold;
                        width: 140px;
                        color: #555;
                    }
                    .info-value {
                        color: #333;
                        flex: 1;
                    }
                    .warning-box {
                        background: #ffebee;
                        border: 2px solid #f44336;
                        border-radius: 8px;
                        padding: 20px;
                        margin: 25px 0;
                        text-align: center;
                    }
                    .warning-box .icon {
                        font-size: 48px;
                        margin-bottom: 10px;
                    }
                    .warning-box h3 {
                        margin: 10px 0;
                        color: #c62828;
                        font-size: 18px;
                    }
                    .warning-box p {
                        margin: 5px 0;
                        color: #d32f2f;
                        font-weight: 500;
                    }
                    .next-steps {
                        background: #e3f2fd;
                        border-left: 4px solid #2196F3;
                        padding: 20px;
                        margin: 25px 0;
                        border-radius: 4px;
                    }
                    .next-steps h3 {
                        margin-top: 0;
                        color: #1976d2;
                        font-size: 16px;
                    }
                    .next-steps ul {
                        margin: 10px 0;
                        padding-left: 20px;
                        color: #555;
                    }
                    .next-steps li {
                        margin: 8px 0;
                    }
                    .contact-info {
                        background: #f5f5f5;
                        padding: 15px;
                        margin: 20px 0;
                        border-radius: 4px;
                        text-align: center;
                    }
                    .contact-info p {
                        margin: 5px 0;
                        color: #666;
                    }
                    .contact-info strong {
                        color: #333;
                    }
                    .apology {
                        text-align: center;
                        margin: 30px 0;
                        padding: 20px;
                        background: #fafafa;
                        border-radius: 8px;
                    }
                    .apology p {
                        margin: 10px 0;
                        color: #666;
                        font-style: italic;
                    }
                    .signature {
                        margin-top: 30px;
                        padding-top: 20px;
                        border-top: 1px solid #e0e0e0;
                        color: #666;
                    }
                    .footer {
                        text-align: center;
                        padding: 20px;
                        background-color: #f5f5f5;
                        color: #999;
                        font-size: 12px;
                    }
                    .footer p {
                        margin: 5px 0;
                    }
                </style>
            </head>
            <body>
                <div class="email-container">
                    <div class="header">
                        <div style="font-size: 48px; margin-bottom: 10px;">⚠️</div>
                        <h1>APPOINTMENT CANCELLATION NOTICE</h1>
                    </div>
                    
                    <div class="content">
                        <div class="greeting">Dear ${sentData.patientName},</div>
                        
                        <div class="message">
                            <p>We regret to inform you that your medical appointment at <strong>MedicalCare</strong> has been <strong style="color: #f44336;">CANCELLED</strong> by the attending physician.</p>
                        </div>

                        <div class="appointment-info">
                            <h3>📋 Cancelled Appointment Details:</h3>
                            <div class="info-row">
                                <div class="info-label">👨‍⚕️ Doctor:</div>
                                <div class="info-value">${sentData.doctorName}</div>
                            </div>
                            <div class="info-row">
                                <div class="info-label">📅 Date:</div>
                                <div class="info-value">${sentData.date}</div>
                            </div>
                            <div class="info-row">
                                <div class="info-label">🕐 Time:</div>
                                <div class="info-value">${sentData.time}</div>
                            </div>
                        </div>

                        <div class="warning-box">
                            <div class="icon">🚫</div>
                            <h3>This appointment is no longer valid</h3>
                            <p>Please DO NOT come for examination at the scheduled time</p>
                        </div>

                        <div class="next-steps">
                            <h3>📞 Next Steps:</h3>
                            <ul>
                                <li><strong>Book a New Appointment:</strong> Log in to the system to select another suitable time slot</li>
                                <li><strong>Contact Support:</strong> Call hotline <strong>0355828343</strong> for consultation and booking assistance</li>
                                <li><strong>Email:</strong> Send inquiries to <strong>phantrungduc2522005@gmail.com</strong></li>
                            </ul>
                        </div>

                        <div class="apology">
                            <p>💐 We sincerely apologize for this inconvenience</p>
                            <p>We hope you will continue to trust and use <strong>MedicalCare</strong> services</p>
                        </div>

                        <div class="signature">
                            <p><strong>Best regards,</strong></p>
                            <p><strong>MedicalCare Management</strong> 🏥</p>
                        </div>
                    </div>

                    <div class="footer">
                        <p>This is an automated email, please do not reply directly.</p>
                        <p>© 2024 MedicalCare. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
            `;
        }

        return result;
    };

    // Xác định subject dựa theo ngôn ngữ
    let emailSubject = sentData.language === "vi" ? "⚠️ Thông báo hủy lịch hẹn khám bệnh - MedicalCare" : "⚠️ Appointment Cancellation Notice - MedicalCare";

    // Gửi email
    let info = await transporter.sendMail({
        from: '"MedicalCare" <phantrungduc2522005@gmail.com>',
        to: sentData.receiverEmail,
        subject: emailSubject,
        text: sentData.language === "vi" ? "Thông báo hủy lịch khám từ MedicalCare" : "Appointment cancellation notice from MedicalCare",
        html: getHtmlEmailDependLanguage(sentData),
    });

    console.log("Cancellation email sent: %s", info.messageId);
    return info;
};

module.exports = {
    sendAppointmentCancellationEmail,
};
