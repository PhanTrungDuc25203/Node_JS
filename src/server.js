import express from "express";
// thư viện lấy tham số từ client gửi cho server
import bodyParser from "body-parser";
import viewEngine from "./config/viewEngine";
import initWebRoutes from './route/web';

import connectDB from './config/connectDB'
require('dotenv').config();
// câu lệnh trên có thể gọi tới hàm config của thư viện dotenv và giúp 
// chạy được dòng "let port = process.env.PORT || 6969;"
let app = express();
//config app
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }))

viewEngine(app);
initWebRoutes(app);


connectDB();
// lấy số cổng trong file .env
let port = process.env.PORT || 6969;
// nếu số hiệu cổng chưa được khai trong file .env thì mặc định là 6969
app.listen(port, () => {
    //callback
    console.log("Backend Nodejs is runing on the port : " + port)
})