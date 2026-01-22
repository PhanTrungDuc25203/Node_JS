import userService from "../services/userService";
const jwt = require("jsonwebtoken");
// api để giao tiếp giưã server và server, nên khi ta gọi api thì
// nó sẽ trả ra dữ liệu dưới dạng json object chứ không render ra màn hình giao diện nào cả
//bình thường khi trả lại thống báo thì sử dụng res.send hoặc res.render nhưng vì đây
//là api nên  sẽ sử dụng res.status để trả lại một đối tượng là trạng thái

//số 200 dưới dâyd là mã lỗi, có nhiều kiểu mã lỗi như sau:
//mã trạng thái 1xx: thông tin: yêu cầu được chấp nhận hoặc tiếp tục quá trính
//mã trạng thái 2xx: thành công
//mã trạng thái 3xx: chuyển hướng
//mã trạng thái 4xx: lỗi từ client chỉ ra rằng yêu cầu không thể hoàn thành
//mã trạng thái 5xx: lỗi từ phía server

let handleLogin = async (req, res) => {
    try {
        let { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                errCode: 1,
                message: "Missing inputs parameter!",
            });
        }

        let result = await userService.handleUserLogin(email, password);

        res.cookie("refreshToken", result.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", // true khi deploy HTTPS
            sameSite: "none",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
        });

        // ✅ Trả về đúng format FE đang dùng
        return res.status(200).json({
            errCode: result.errCode,
            message: result.message,
            user: result.user,
            accessToken: result.accessToken,
        });
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({
            message: "Server error",
        });
    }
};

let handleGetAllUsersForReact = async (req, res) => {
    let id = req.query.id; //all || id
    //nếu truyền vào id là all thì lấy tất cả người dùng còn id thì lấy 1
    if (!id) {
        return res.status(200).json({
            errCode: 1,
            errMessage: "Missing required parameters!",
            users: [],
        });
    }
    let users = await userService.getAllUsersForReact(id);

    return res.status(200).json({
        errCode: 0,
        errMessage: "Get user(s) from Database successfully",
        users,
    });
};

let handleCreateNewUserInReact = async (req, res) => {
    let message = await userService.createNewUserInReact(req.body);
    console.log(message);
    return res.status(200).json(message);
};

let checkEmailWetherAlreadyExist = async (req, res) => {
    let alreadyExist = await userService.checkUserEmail(req.query.email);
    return res.status(200).json(alreadyExist);
};

let handleEditUserInReact = async (req, res) => {
    let data = req.body;
    let message = await userService.editUserInReact(data);
    return res.status(200).json(message);
};

let handleDeleteUserInReact = async (req, res) => {
    if (!req.body.id) {
        return res.status(200).json({
            errCode: 1,
            message: `Mising required parameters! Maybe need deleted user's id is missing`,
        });
    }
    let message = await userService.deleteUserInReact(req.body.id);
    return res.status(200).json(message);
};

let getAllCodesData = async (req, res) => {
    try {
        //đây chỉ là ví dụ cho một trường hợp thực tế chứ cứ code không cần timeout cx đc
        // cần xét timeout tại vì trong thực tế không thể gọi api phát mà dữ liệu được lấy luôn được
        setTimeout(async () => {
            let data = await userService.getAllCodesDataService(req.query.type);
            return res.status(200).json(data);
        }, 500);
        //khi load lại trang thì nó đợi 1.5s nó mới gọi api
    } catch (e) {
        console.log(`Get AllCodes's data error: `, e);
        return res.status(200).json({
            errCode: -1,
            errMessage: `Error of getting AllCodes's data from server`,
        });
    }
};

let getAllRelativeInforsOfCurrentSystemUser = async (req, res) => {
    try {
        setTimeout(async () => {
            let data = await userService.getAllRelativeInforsOfCurrentSystemUserService(req.query.email);
            return res.status(200).json(data);
        }, 500);
    } catch (e) {
        console.log(`Get all relative infors of current system's user error: `, e);
        return res.status(200).json({
            errCode: -1,
            errMessage: `Get all relative infors of current system's user error from server!`,
        });
    }
};

// let getAllRelativeBookingsOfCurrentSystemUser = async (req, res) => {
//     try {
//         setTimeout(async () => {
//             let data = await userService.getAllRelativeBookingsOfCurrentSystemUserService(req.query.email);
//             return res.status(200).json(data);
//         }, 200);
//     } catch (e) {
//         console.log(`Get all relative bookings of current system's user error: `, e);
//         return res.status(200).json({
//             errCode: -1,
//             errMessage: `Get all relative bookings of current system's user error from server!`,
//         });
//     }
// };

// let getAllRelativeBookingsOfCurrentSystemUser2 = async (req, res) => {
//     try {
//         setTimeout(async () => {
//             let data = await userService.getAllRelativeBookingsOfCurrentSystemUser2Service(req.query.email);
//             return res.status(200).json(data);
//         }, 200);
//     } catch (e) {
//         console.log(`Get all relative bookings of current system's user error: `, e);
//         return res.status(200).json({
//             errCode: -1,
//             errMessage: `Get all relative bookings of current system's user error from server!`,
//         });
//     }
// };

let getAllRelativeBookingsOfCurrentSystemUser = async (req, res) => {
    try {
        setTimeout(async () => {
            let email = req.query.email;
            let appointmentWithUser = req.query.appointmentWithUser === "true";

            let data = await userService.getAllRelativeBookingsOfCurrentSystemUserService(email, appointmentWithUser);
            return res.status(200).json(data);
        }, 200);
    } catch (e) {
        console.log(`Get all relative bookings of current system's user error: `, e);
        return res.status(200).json({
            errCode: -1,
            errMessage: `Get all relative bookings of current system's user error from server!`,
        });
    }
};

let saveRateAndReviewAboutDoctor = async (req, res) => {
    try {
        console.log("check req: ", req.body);
        let response = await userService.saveRateAndReviewAboutDoctorService(req.body);
        return res.status(200).json(response);
    } catch (e) {
        console.log(e);
        return res.status(200).json({
            errCode: -1,
            errMessage: `Save doctor or package rate and review error from server!`,
        });
    }
};

let saveRateAndReviewAboutPackage = async (req, res) => {
    try {
        console.log("check package review req: ", req.body);

        let response = await userService.saveRateAndReviewAboutPackageService(req.body);
        return res.status(200).json(response);
    } catch (e) {
        console.log(e);
        return res.status(200).json({
            errCode: -1,
            errMessage: "Save package rate and review error from server!",
        });
    }
};

let getRateAndReviewAboutDoctor = async (req, res) => {
    try {
        const { appointmentId, doctorId } = req.query;

        let data = await userService.getRateAndReviewAboutDoctorService({
            appointmentId,
            doctorId,
        });

        return res.status(200).json(data);
    } catch (e) {
        return res.status(200).json({
            errCode: -1,
            errMessage: `Get rate and review about doctor error from server!`,
        });
    }
};

let getRateAndReviewAboutExamPackage = async (req, res) => {
    try {
        const { examPackageBookingId, examPackageId } = req.query;

        let data = await userService.getRateAndReviewAboutExamPackageService({
            examPackageBookingId,
            examPackageId,
        });

        return res.status(200).json(data);
    } catch (e) {
        return res.status(200).json({
            errCode: -1,
            errMessage: `Get rate and review about exam package error from server!`,
        });
    }
};

let sendEmailOTP = async (req, res) => {
    let message = await userService.sendEmailOTP(req.body.email);
    return res.status(200).json(message);
};

let verifyEmailOTP = async (req, res) => {
    let message = await userService.verifyEmailOTP(req.body.email, req.body.otp);
    return res.status(200).json(message);
};

let sendPhoneOTP = async (req, res) => {
    let message = await userService.sendPhoneOTP(req.body.phoneNumber);
    return res.status(200).json(message);
};

let verifyPhoneOTP = async (req, res) => {
    let message = await userService.verifyPhoneOTP(req.body.phoneNumber, req.body.otp);
    return res.status(200).json(message);
};

module.exports = {
    handleLogin: handleLogin,
    handleGetAllUsersForReact: handleGetAllUsersForReact,
    handleCreateNewUserInReact: handleCreateNewUserInReact,
    sendEmailOTP: sendEmailOTP,
    verifyEmailOTP: verifyEmailOTP,
    sendPhoneOTP: sendPhoneOTP,
    verifyPhoneOTP: verifyPhoneOTP,
    checkEmailWetherAlreadyExist: checkEmailWetherAlreadyExist,
    handleEditUserInReact: handleEditUserInReact,
    handleDeleteUserInReact: handleDeleteUserInReact,
    getAllCodesData: getAllCodesData,
    getAllRelativeInforsOfCurrentSystemUser: getAllRelativeInforsOfCurrentSystemUser,
    getAllRelativeBookingsOfCurrentSystemUser: getAllRelativeBookingsOfCurrentSystemUser,
    // getAllRelativeBookingsOfCurrentSystemUser2: getAllRelativeBookingsOfCurrentSystemUser2,
    saveRateAndReviewAboutDoctor: saveRateAndReviewAboutDoctor,
    saveRateAndReviewAboutPackage: saveRateAndReviewAboutPackage,
    getRateAndReviewAboutDoctor: getRateAndReviewAboutDoctor,
    getRateAndReviewAboutExamPackage: getRateAndReviewAboutExamPackage,
};
