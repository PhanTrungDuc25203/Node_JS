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

    // async..await is not allowed in global scope, must use a wrapper
    // send mail with defined transport object
    let info = await transporter.sendMail({
        from: '"Phan Piscean 👻" <phantrungduc2522005@gmail.com>', // sender address
        to: sentData.receiverEmail, // list of receivers
        subject: "Thông tin đặt lịch khám bệnh ✔", // Subject line
        text: "Hello world?", // plain text body
        html: `
        <h3>Xin chào ${sentData.patientName}</h3>
        <p>Bạn vừa đặt lịch khám bênhj ở trang web MedicalCare với thông tin như sau:</p>
        <div><b>Thời gian: </b>${sentData.time}</div>
        <div><b>Hẹn cùng bác sĩ: </b>${sentData.doctorName}</div>
        <div><b>Điểm hẹn (phòng khám hoặc bệnh viện): </b>${sentData.clinicName}</div>
        </br>
        <p>Hãy kiểm tra lại thông tin của mình một lần nữa, và nhấn vào đường link bên dưới để hoàn tất thủ tục khám bệnh:</p>
        <div><a href=${sentData.redirectLink} target="_blank">Lịch khám bện</a></div>
        
        <div>Cảm ơn bạn đã chọn lựa và tin dùng!</div>
        `, // html body
    });



    console.log("Message sent: %s", info.messageId);
    // Message sent: <d786aa62-4e0a-070a-47ed-0b0666549519@ethereal.email>
}

module.exports = {
    sendAEmail
}