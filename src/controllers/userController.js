import userService from "../services/userService";

let handleLogin = async (req, res) => {
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

    let email = req.body.email;
    let password = req.body.password;

    // console.log(email);

    //check email người dùng gửi tới có tồn tại hay không
    if (!email || !password) {
        //câu lệnh trên giống với email='' || email=null || email ='undefined'
        //tương tự cho password
        //phải nhận được cả 2 trường email và pass thì mới check tiếp
        return res.status(500).json({
            errCode: 1,
            message: "Missing inputs parameter!",
        });
    }

    let userData = await userService.handleUserLogin(email, password);
    //nếu tồn tại thì so sánh giá trij băm của password
    //nếu đúng cả email lẫn mật khẩu thì return thông tin người dùng userInfo
    //access token: JWT json web token
    return res.status(200).json({
        // errCode: 0,
        // message: 'found that client in server',
        // yourEmail: email,
        // yourPassword: password,
        errCode: userData.errCode,
        message: userData.errMessage,
        //nếu file userService trả lại biến user thì lấy biến user còn không thì lấy biến rỗng
        user: userData.user ? userData.user : {},
    });
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

let getAllRelativeBookingsOfCurrentSystemUser = async (req, res) => {
    try {
        setTimeout(async () => {
            let data = await userService.getAllRelativeBookingsOfCurrentSystemUserService(req.query.email);
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

module.exports = {
    handleLogin: handleLogin,
    handleGetAllUsersForReact: handleGetAllUsersForReact,
    handleCreateNewUserInReact: handleCreateNewUserInReact,
    checkEmailWetherAlreadyExist: checkEmailWetherAlreadyExist,
    handleEditUserInReact: handleEditUserInReact,
    handleDeleteUserInReact: handleDeleteUserInReact,
    getAllCodesData: getAllCodesData,
    getAllRelativeInforsOfCurrentSystemUser: getAllRelativeInforsOfCurrentSystemUser,
    getAllRelativeBookingsOfCurrentSystemUser: getAllRelativeBookingsOfCurrentSystemUser,
};
