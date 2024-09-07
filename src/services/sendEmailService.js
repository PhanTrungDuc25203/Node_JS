require('dotenv').config();
import nodemailer from 'nodemailer';

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
        let result = '';
        if (sentData.language === 'vi') {
            result =
                `
                    <h3>Xin chào ${sentData.patientName}</h3>
                    <p>Bạn vừa đặt lịch khám bệnh ở MedicalCare với thông tin như sau:</p>
                    <div><b>Thời gian: </b>${sentData.time}</div>
                    <div><b>Hẹn cùng bác sĩ: </b>${sentData.doctorName}</div>
                    <div><b>Điểm hẹn (phòng khám hoặc bệnh viện): </b>${sentData.clinicName}</div>
                    <div><b>Địa chỉ phòng khám: </b>${sentData.clinicAddress}</div>
                    </br>
                    <p><i>Hãy kiểm tra lại thông tin của mình một lần nữa, và nhấn vào đường link bên dưới để hoàn tất thủ tục khám bệnh:</i></p>
                    <div><a href=${sentData.redirectLink} target="_blank">Lịch khám bệnh</a></div>
                    
                    <div>Cảm ơn bạn đã chọn lựa và tin dùng!</div>
                `;
        }
        if (sentData.language === 'en') {
            result =
                `
                   <h3>Dear ${sentData.patientName}</h3>
                    <p>You have just scheduled a medical appointment at MedicalCare with the following details:</p>
                    <div><b>Time: </b>${sentData.time}</div>
                    <div><b>Appointment with Doctor: </b>${sentData.doctorName}</div>
                    <div><b>Meeting point (clinic or hospital): </b>${sentData.clinicName}</div>
                    <div><b>Clinic address: </b>${sentData.clinicAddress}</div>
                    </br>
                    <p><i>Please double-check your information, and click on the link below to complete your appointment procedure:</i></p>
                    <div><a href=${sentData.redirectLink} target="_blank">Appointment Details</a></div>

                    <div>Thank you for choosing and trusting us!</div>

                `;
        }

        return result;
    }

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
}

module.exports = {
    sendAEmail
}