import express from "express";
import { authMiddleware, authorizeRoles } from "../middleware/authMiddleware";
import homeController from "../controllers/homeController";
import userController from "../controllers/userController";
import doctorController from "../controllers/doctorController";
import patientController from "../controllers/patientController";
import specialtyController from "../controllers/specialtyController";
import medicalFacilityController from "../controllers/medicalFacilityController";
import searchController from "../controllers/searchController";
import staffController from "../controllers/staffController";
import paymentController from "../controllers/paymentController";
import googleController from "../controllers/googleController";
import facebookController from "../controllers/facebookController";
import jwtController from "../controllers/jwtController";
import { ratingLimiter } from "../middleware/ratingLimiter";

let router = express.Router();

let initWebRoutes = (app) => {
    //nơi định nghĩa các đường dẫn của trang web
    router.get("/", homeController.getHomePage);
    router.get("/about", homeController.getAboutPage);
    router.get("/crud", homeController.getCRUDPage); //thêm dữ liệu User
    router.post("/post-crud", homeController.postCRUD); //thông báo thêm dữ liệu thành công
    router.get("/get-crud", homeController.displayGetCRUD); //hiển thị dữ liệu User
    router.get("/edit-crud", homeController.getEditedCRUD); //chỉnh sửa dữ liệu User
    router.post("/put-crud", homeController.putCRUD); //quay lại trang hiển thị khi chĩnh sửa thành công
    router.get("/delete-crud", homeController.deleteCRUD); //xóa dữ liệu User

    //những gì ở phía React thì phân biệt bằng các thêm tiền tố /api/ vào trước các route
    router.post("/api/login", ratingLimiter, userController.handleLogin);
    router.post("/api/auth/google/verify", googleController.handleGoogleLogin);
    router.post("/api/auth/facebook/verify", facebookController.handleFacebookLogin);
    router.post("/api/refresh-token", jwtController.handleRefreshToken);
    //viết link api lất tất cả người dùng ra cho react
    router.get("/api/get-all-users-for-react", userController.handleGetAllUsersForReact);
    router.post("/api/create-new-user-in-react", userController.handleCreateNewUserInReact);
    //xác thực email và số điện thoại người dùng
    router.post("/api/send-email-otp", userController.sendEmailOTP);
    router.post("/api/verify-email-otp", userController.verifyEmailOTP);

    router.post("/api/send-phone-otp", userController.sendPhoneOTP);
    router.post("/api/verify-phone-otp", userController.verifyPhoneOTP);

    router.put("/api/edit-user-in-react", userController.handleEditUserInReact);
    router.delete("/api/delete-user-in-react", userController.handleDeleteUserInReact);
    router.get("/api/check-user-email-already-exist", userController.checkEmailWetherAlreadyExist);

    router.get("/api/getallcodesdata", userController.getAllCodesData);
    //lấy bác sĩ nổi bật cho trang home
    router.get("/api/get-elite-doctor-for-homepage", doctorController.getEliteDoctorForHomePage);
    //lấy ra tất cả bác sĩ để cho vào Select trong trang doctorArticle
    router.get("/api/get-all-doctors-for-doctor-article-page", doctorController.getAllDoctorsForDoctorArticlePage);
    //lưu bài báo của một bacs sĩ
    router.post("/api/save-infor-and-article-of-a-doctor", doctorController.saveInforAndArticleOfADoctor);
    //lấy thông tin map từ 2 bảng user và markdown với key=doctorId để hiển thị thông tin bác sĩ
    router.get("/api/get-a-particular-doctor-infor-for-his-or-her-page", doctorController.getParticularInforForDoctorPage);
    //tạo một schedule cho 1 bac sĩ, một schedule có nhiều timeframe
    router.post("/api/bulk-create-timeframes-for-doctor-appointment-schedule", authMiddleware, authorizeRoles("R1", "R2"), doctorController.createTimeframesForDoctorSchedule);
    //lấy khung giờ khám cho từng ngày của một bác sĩ
    router.get("/api/get-doctor-schedule-by-date", doctorController.getScheduleByDate);
    //lấy thêm thông tin bác sĩ như địa chỉ phòng khám, giá khám, phương thức thanh toán
    router.get("/api/get-extra-infor-doctor-by-id", doctorController.getExtraInforDoctorByID);
    //api tìm kiếm trong trang tìm kiếm
    router.get("/api/all-medical-services-filter-search", searchController.allMedicalServiceFilterSearch);

    //lưu bệnh nhân và thông tin đặt lịch khám với bác sĩ
    router.post("/api/patient-infor-when-booking-time", authMiddleware, authorizeRoles("R3"), patientController.handlePatientBookingAppointment);
    router.post("/api/patient-infor-when-booking-exam-package", authMiddleware, authorizeRoles("R3"), medicalFacilityController.handlePatientBookingExamPackage);
    //trang web xác nhận chốt đặt lịch
    router.post("/api/confirm-booking-appointment", patientController.confirmBookingAppointment);
    //xác nhận chốt đặt gói khám
    router.post("/api/confirm-booking-exam-package", patientController.confirmBookingExamPackage);
    //lưu thông tin một chuyên khoa
    router.post("/api/create-new-specialty", specialtyController.createSpecialty);
    //lấy các specialties cho trang home
    router.get("/api/get-specialty-for-homepage", specialtyController.getSpecialtyForHomePage);
    //lấy các remote specialties cho trang home
    router.get("/api/get-remote-specialty-for-homepage", specialtyController.getRemoteSpecialtyForHomePage);
    //lấy một số trường của các specialties cho trang tạo cơ sở y tế (để đỡ nghẽn mạng)
    router.get("/api/get-specialty-and-province-for-medical-facility-manage-page", specialtyController.getSpecialtyAndProvinceForMedicalFacilityManagePage);

    //lấy dữ liệu cho trang specialty details, bao gồm thông tin của specialty và bác sĩ
    router.get("/api/get-specialty-by-id", specialtyController.getSpecialtyById);
    //lấy tất cả dữ liệu liên quan đến người đang sử dụng hệ thống bằng gamil của họ
    router.get("/api/get-all-relative-infors-of-current-system-user", userController.getAllRelativeInforsOfCurrentSystemUser);
    // router.get("/api/get-all-relative-bookings-of-current-system-user", userController.getAllRelativeBookingsOfCurrentSystemUser);
    // router.get("/api/get-all-relative-bookings-of-current-system-user-2", userController.getAllRelativeBookingsOfCurrentSystemUser2);
    router.get("/api/get-all-relative-bookings-of-current-system-user", userController.getAllRelativeBookingsOfCurrentSystemUser);

    router.post("/api/save-appointment-history", doctorController.saveAppointmentHistory);
    //lấy thông tin trong bảng history
    router.get("/api/get-appointement-histories-by-doctor-email", doctorController.getAppointmentHistoriesByDoctorEmail);

    //lấy thông tin trong bảng history
    router.get("/api/get-appointement-histories-by-patient-email", patientController.getAppointmentHistoriesByPatientEmail);

    //tạo thông tin cho một cơ sở y tế
    router.post("/api/create-medical-facility", medicalFacilityController.createMedicalFacility);
    //lấy thông tin trích dẫn của cơ sở y tế
    router.get("/api/get-info-of-medical-facility", medicalFacilityController.getInfoOfMedicalFacility);
    //tạo mới một gói khám cho một cơ sở y tế
    router.post("/api/create-exam-package", medicalFacilityController.createExamPackage);
    //lấy thông tin tất cả các Gói khám
    router.get("/api/get-all-exam-package", medicalFacilityController.getAllExamPackage);
    //tạo lịch khám cho gói khám
    router.post("/api/bulk-create-timeframes-for-exam-package-schedule", medicalFacilityController.createTimeframesForExamPackageSchedule);
    //lấy các khung giờ khám của một gói khám
    router.get("/api/get-package-schedule-by-date", medicalFacilityController.getPackageScheduleByDate);
    //lưu đánh giá nhận xét của người dùng về thăm khám và bác sĩ
    router.post("/api/save-rate-and-review-about-doctor", userController.saveRateAndReviewAboutDoctor);
    router.post("/api/save-rate-and-review-about-package", userController.saveRateAndReviewAboutPackage);
    //lấy dữ liệu về đánh giá nhận xét của người dùng về thăm khám và bác sĩ
    router.get("/api/get-rate-and-review-about-doctor", userController.getRateAndReviewAboutDoctor);
    router.get("/api/get-rate-and-review-about-exam-package", userController.getRateAndReviewAboutExamPackage);
    //route thanh toán
    router.post("/api/create_payment_url", paymentController.createVnpayPaymentUrl);
    //xử lý trường hợp người dùng thanh toán trực tuyến sau khi khám
    router.post("/api/handle-post-visit-payment-method", doctorController.handlePostVisitPaymentMethod);
    //lưu bệnh án
    router.post("/api/save-clinical-report-content-to-database", doctorController.saveClinicalReportContentToDatabase);
    //lấy con số thống kê tổng quan về lịch khám cho dashboard bệnh nhân
    router.get("/api/patient/appointments/overview-statistics", patientController.getPatientAppointmentsOverviewStatistics);
    //lấy lịch hẹn gần nhất cho dashboard của bệnh nhân
    router.get("/api/patient/appointments/nearest", patientController.getPatientAppointmentsNearest);
    //thống kê lịch khám hàng tháng
    router.get("/api/patient/appointments/monthly-visits", patientController.getPatientAppointmentsMonthlyVisits);
    //thống kê bác sĩ thường gặp và cơ sở y tế thường đến khám
    router.get("/api/patient/:patientId/stats/frequent-visits-medical-facilities-doctors", patientController.getPatientFrequentVisitsMedicalFacilitiesAndDoctors);
    //lấy con số thống kê tổng quan về lịch khám cho dashboard bác sĩ
    router.get("/api/doctor/appointments/today/overview-statistics", doctorController.getDoctorAppointmentsTodayOverviewStatistics);
    //lấy thống kê người khám theo tháng cho trang dashboard bác sĩ
    router.get("/api/doctor/statistics/monthly/patients", doctorController.getDoctorStatisticMonthlyPatients);

    //lưu biểu mẫu kết quả khám của gói khám
    router.post("/api/exam-package/result-template", staffController.createResultTemplate);
    //lấy các gói khám đang có bệnh nhân chờ kết quả
    router.get("/api/exam-package/pending-result", staffController.getResultPendingExamPackage);
    //lưu kết quả của gói khám
    router.post("/api/exam-package/exam-result", staffController.saveExamPackageResult);
    //lấy kết quả khám của một gói khám
    router.get("/api/exam-package/exam-result", staffController.getExamPackageResult);
    //lấy thông tin nhân viên bệnh viện
    router.get("/api/get-a-particular-staff-infor", staffController.getStaffInfo);
    //lấy thông tin lịch khám gói khám cho bệnh nhân
    router.get("/api/patient/exam-package", patientController.getPatientExamPackageTime);
    //cập nhật trạng thái đã hoàn thành cho lịch khám của gói khám
    router.patch("/api/exam-package/booking-done", staffController.updateExamPackageBookingDone);

    return app.use("/", router);
};
module.exports = initWebRoutes;
