import express from "express";
import homeController from "../controllers/homeController";
import userController from "../controllers/userController";
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
    return app.use("/", router);
}
module.exports = initWebRoutes;