import userService from '../services/userService';

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

    console.log(email);

    //check email người dùng gửi tới có tồn tại hay không
    if (!email || !password) {
        //câu lệnh trên giống với email='' || email=null || email ='undefined'
        //tương tự cho password
        //phải nhận được cả 2 trường email và pass thì mới check tiếp
        return res.status(500).json({
            errCode: 1,
            message: 'Missing inputs parameter!'
        })
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
        userData
    });
}

module.exports = {
    handleLogin: handleLogin,
}