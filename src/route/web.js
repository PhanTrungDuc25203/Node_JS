import express from "express";
import homeController from "../controllers/homeController";
import userController from "../controllers/userController";
import doctorController from "../controllers/doctorController";

let router = express.Router();

let initWebRoutes = (app) => {
    //nơi định nghĩa các đường dẫn của trang web
    router.get('/', homeController.getHomePage);
    router.get('/about', homeController.getAboutPage);
    router.get('/crud', homeController.getCRUDPage); //thêm dữ liệu User
    router.post('/post-crud', homeController.postCRUD);//thông báo thêm dữ liệu thành công
    router.get('/get-crud', homeController.displayGetCRUD);//hiển thị dữ liệu User
    router.get('/edit-crud', homeController.getEditedCRUD);//chỉnh sửa dữ liệu User
    router.post('/put-crud', homeController.putCRUD);//quay lại trang hiển thị khi chĩnh sửa thành công
    router.get('/delete-crud', homeController.deleteCRUD);//xóa dữ liệu User


    //những gì ở phía React thì phân biệt bằng các thêm tiền tố /api/ vào trước các route
    router.post('/api/login', userController.handleLogin);
    //viết link api lất tất cả người dùng ra cho react
    router.get('/api/get-all-users-for-react', userController.handleGetAllUsersForReact);
    router.post('/api/create-new-user-in-react', userController.handleCreateNewUserInReact);
    router.put('/api/edit-user-in-react', userController.handleEditUserInReact);
    router.delete('/api/delete-user-in-react', userController.handleDeleteUserInReact);


    router.get('/api/getallcodesdata', userController.getAllCodesData);
    //lấy bác sĩ nổi bật cho trang home
    router.get('/api/get-elite-doctor-for-homepage', doctorController.getEliteDoctorForHomePage);
    //lấy ra tất cả bác sĩ để cho vào Select trong trang doctorArticle
    router.get('/api/get-all-doctors-for-doctor-article-page', doctorController.getAllDoctorsForDoctorArticlePage);
    //lưu bài báo của một bacs sĩ
    router.post('/api/save-infor-and-article-of-a-doctor', doctorController.saveInforAndArticleOfADoctor);
    //lấy thông tin map từ 2 bảng user và markdown với key=doctorId để hiển thị thông tin bác sĩ
    router.get('/api/get-a-particular-doctor-infor-for-his-or-her-page', doctorController.getParticularInforForDoctorPage);
    //tạo một schedule cho 1 bac sĩ, một schedule có nhiều timeframe
    router.post('/api/bulk-create-timeframes-for-doctor-appointment-schedule', doctorController.createTimeframesForDoctorSchedule);
    //lấy khung giờ khám cho từng ngày của một bác sĩ
    router.get('/api/get-doctor-schedule-by-date', doctorController.getScheduleByDate);
    //lấy thêm thông tin bác sĩ như địa chỉ phòng khám, giá khám, phương thức thanh toán
    router.get('/api/get-extra-infor-doctor-by-id', doctorController.getExtraInforDoctorByID);

    return app.use("/", router);
}
module.exports = initWebRoutes;