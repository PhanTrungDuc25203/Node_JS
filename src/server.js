import express from "express";
// thư viện lấy tham số từ client gửi cho server
import bodyParser from "body-parser";
import viewEngine from "./config/viewEngine";
import initWebRoutes from './route/web';
import connectDB from './config/connectDB';
import cors from 'cors';
import { cleanOldRecords } from './services/cleanupScheduleService';

require('dotenv').config();
// câu lệnh trên có thể gọi tới hàm config của thư viện dotenv và giúp 
// chạy được dòng "let port = process.env.PORT || 6969;"
let app = express();
// app.use(cors({ origin: true }));
app.use(cors({
    credentials: true,
    origin: true,
}));

app.use(function (req, res, next) {
    //chỉ cho server hoạt động ở cổng 3000 có thể gọi api từ server Node
    res.setHeader('Access-Control-Allow-Origin', process.env.URL_REACT_SERVER);

    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);
    //cho phép đi qua middle ware khi server khác gọi api tới server dữ liệu node này
    next();
});

// app.use(cors());

//config app
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

viewEngine(app);
initWebRoutes(app);


connectDB();
cleanOldRecords(1); // dọn mấy bản ghi quá hạn

// Thiết lập cron job để dọn dẹp định kỳ
setInterval(() => {
    cleanOldRecords(1); // Chạy lại mỗi ngày (tùy theo nhu cầu)
}, 24 * 60 * 60 * 1000); // Mỗi 24 giờ
// lấy số cổng trong file .env
let port = process.env.PORT || 6969;
// nếu số hiệu cổng chưa được khai trong file .env thì mặc định là 6969
app.listen(port, () => {
    //callback
    console.log("Backend Nodejs is runing on the port : " + port)
})