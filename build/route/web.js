"use strict";

var _express = _interopRequireDefault(require("express"));
var _homeController = _interopRequireDefault(require("../controllers/homeController"));
var _userController = _interopRequireDefault(require("../controllers/userController"));
var _doctorController = _interopRequireDefault(require("../controllers/doctorController"));
var _patientController = _interopRequireDefault(require("../controllers/patientController"));
var _specialtyController = _interopRequireDefault(require("../controllers/specialtyController"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
var router = _express["default"].Router();
var initWebRoutes = function initWebRoutes(app) {
  //nơi định nghĩa các đường dẫn của trang web
  router.get('/', _homeController["default"].getHomePage);
  router.get('/about', _homeController["default"].getAboutPage);
  router.get('/crud', _homeController["default"].getCRUDPage); //thêm dữ liệu User
  router.post('/post-crud', _homeController["default"].postCRUD); //thông báo thêm dữ liệu thành công
  router.get('/get-crud', _homeController["default"].displayGetCRUD); //hiển thị dữ liệu User
  router.get('/edit-crud', _homeController["default"].getEditedCRUD); //chỉnh sửa dữ liệu User
  router.post('/put-crud', _homeController["default"].putCRUD); //quay lại trang hiển thị khi chĩnh sửa thành công
  router.get('/delete-crud', _homeController["default"].deleteCRUD); //xóa dữ liệu User
  //những gì ở phía React thì phân biệt bằng các thêm tiền tố /api/ vào trước các route
  router.post('/api/login', _userController["default"].handleLogin);
  //viết link api lất tất cả người dùng ra cho react
  router.get('/api/get-all-users-for-react', _userController["default"].handleGetAllUsersForReact);
  router.post('/api/create-new-user-in-react', _userController["default"].handleCreateNewUserInReact);
  router.put('/api/edit-user-in-react', _userController["default"].handleEditUserInReact);
  router["delete"]('/api/delete-user-in-react', _userController["default"].handleDeleteUserInReact);
  router.get('/api/getallcodesdata', _userController["default"].getAllCodesData);
  //lấy bác sĩ nổi bật cho trang home
  router.get('/api/get-elite-doctor-for-homepage', _doctorController["default"].getEliteDoctorForHomePage);
  //lấy ra tất cả bác sĩ để cho vào Select trong trang doctorArticle
  router.get('/api/get-all-doctors-for-doctor-article-page', _doctorController["default"].getAllDoctorsForDoctorArticlePage);
  //lưu bài báo của một bacs sĩ
  router.post('/api/save-infor-and-article-of-a-doctor', _doctorController["default"].saveInforAndArticleOfADoctor);
  //lấy thông tin map từ 2 bảng user và markdown với key=doctorId để hiển thị thông tin bác sĩ
  router.get('/api/get-a-particular-doctor-infor-for-his-or-her-page', _doctorController["default"].getParticularInforForDoctorPage);
  //tạo một schedule cho 1 bac sĩ, một schedule có nhiều timeframe
  router.post('/api/bulk-create-timeframes-for-doctor-appointment-schedule', _doctorController["default"].createTimeframesForDoctorSchedule);
  //lấy khung giờ khám cho từng ngày của một bác sĩ
  router.get('/api/get-doctor-schedule-by-date', _doctorController["default"].getScheduleByDate);
  //lấy thêm thông tin bác sĩ như địa chỉ phòng khám, giá khám, phương thức thanh toán
  router.get('/api/get-extra-infor-doctor-by-id', _doctorController["default"].getExtraInforDoctorByID);
  //lưu bệnh nhân và thông tin đặt lịch khám với bác sĩ
  router.post('/api/patient-infor-when-booking-time', _patientController["default"].patientInforWhenBookingTime);
  //trang web xác nhận chốt đặt lịch
  router.post('/api/confirm-booking-appointment', _patientController["default"].confirmBookingAppointment);
  //lưu thông tin một chuyên khoa
  router.post('/api/create-new-specialty', _specialtyController["default"].createSpecialty);
  //lấy các specialties cho trang home
  router.get('/api/get-specialty-for-homepage', _specialtyController["default"].getSpecialtyForHomePage);
  //lấy dữ liệu cho trang specialty details, bao gồm thông tin của specialty và bác sĩ
  router.get('/api/get-specialty-by-id', _specialtyController["default"].getSpecialtyById);
  //lấy tất cả dữ liệu liên quan đến người đang sử dụng hệ thống bằng gamil của họ
  router.get('/api/get-all-relative-infors-of-current-system-user', _userController["default"].getAllRelativeInforsOfCurrentSystemUser);
  return app.use("/", router);
};
module.exports = initWebRoutes;