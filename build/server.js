"use strict";

var _express = _interopRequireDefault(require("express"));
var _bodyParser = _interopRequireDefault(require("body-parser"));
var _viewEngine = _interopRequireDefault(require("./config/viewEngine"));
var _web = _interopRequireDefault(require("./route/web"));
var _connectDB = _interopRequireDefault(require("./config/connectDB"));
var _cors = _interopRequireDefault(require("cors"));
var _cleanupScheduleService = require("./services/cleanupScheduleService");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
// thư viện lấy tham số từ client gửi cho server

require('dotenv').config();
// câu lệnh trên có thể gọi tới hàm config của thư viện dotenv và giúp 
// chạy được dòng "let port = process.env.PORT || 6969;"
var app = (0, _express["default"])();
// app.use(cors({ origin: true }));
app.use((0, _cors["default"])({
  credentials: true,
  origin: true
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
app.use(_bodyParser["default"].json({
  limit: '50mb'
}));
app.use(_bodyParser["default"].urlencoded({
  limit: '50mb',
  extended: true
}));
(0, _viewEngine["default"])(app);
(0, _web["default"])(app);
(0, _connectDB["default"])();
(0, _cleanupScheduleService.cleanOldRecords)(1); // dọn mấy bản ghi quá hạn

// Thiết lập cron job để dọn dẹp định kỳ
setInterval(function () {
  (0, _cleanupScheduleService.cleanOldRecords)(1); // Chạy lại mỗi ngày (tùy theo nhu cầu)
}, 24 * 60 * 60 * 1000); // Mỗi 24 giờ
// lấy số cổng trong file .env
var port = process.env.PORT || 6969;
// nếu số hiệu cổng chưa được khai trong file .env thì mặc định là 6969
app.listen(port, function () {
  //callback
  console.log("Backend Nodejs is runing on the port : " + port);
});