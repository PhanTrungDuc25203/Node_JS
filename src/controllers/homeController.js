import db from '../models/index'
import CRUDService from '../services/CRUDService'
let getHomePage = async (req, res) => {
    // ở đây không cần ghi đường dẫn tới file homePage.ejs vì trong file
    // viewEngine ở thư mục config, tôi đã định nghĩa tất cả các file view thì tìm
    // trong thư mục .src/views rồi
    try {
        //tìm tất cả dữ liệu trong bảng user
        let data = await db.User.findAll();
        //in ra màn hình console các dữ liệu
        console.log('-------------');
        console.log(data);
        console.log('-------------');
        // lí do trong file config.json ở thư mục config phần development có thêm thuộc tính
        // "logging": false vì mỗi lần chương trình truy vấn thì nó lại ghi ra câu lệnh 
        // truy vấn, câu lệnh trên sẽ làm nó không in ra câu lệnh truy vấn nữa
        return res.render('homePage.ejs', {
            //trả lại thêm đối tượng data ra file view
            data: JSON.stringify(data)
        });
    } catch (e) {
        console.log(e);
    }

}
let getAboutPage = (req, res) => {
    return res.render('test/about.ejs');
}
let getCRUDPage = (req, res) => {
    return res.render('crudPage.ejs');
}
let postCRUD = async (req, res) => {
    let message = await CRUDService.createNewUser(req.body);
    console.log(message);
    // in ra màn hình console nhưng gì đã nhập từ form
    // console.log(req.body);
    return res.send('post CRUD from server');
}
let displayGetCRUD = async (req, res) => {
    let data = await CRUDService.getAllUser();
    console.log('~~~~~~~~~~~~~~~~~~~');
    console.log(data);
    console.log('~~~~~~~~~~~~~~~~~~~');
    //trả về trang web html css
    // return res.render('displayCRUD.ejs');
    //trả về thêm dữ liệu để file html css hiển thị, ta cần thêm đối tượng
    return res.render('displayCRUD.ejs', {
        //giá trị cho dataForTable được khơi tạo bằng với data phía trên truyền xuống
        dataForTable: data
    });
}
let getEditedCRUD = async (req, res) => {
    //in ra màn hình console số thứ tự của trang edit tương ứng với các đối tượng user,
    // bấm vào nút edit cho đối tượng user thứ 3 thì sẽ in ra màn hình console số "3"
    let userId = req.query.id;
    if (userId) {
        let userData = await CRUDService.getUserInformationById(userId);
        console.log('-----------------');
        console.log(userData);
        return res.render('editAnUserCRUD.ejs', {
            formerUserData: userData,
        });
    } else {
        return res.send('User NOT founded!')
    }
}
let putCRUD = async (req, res) => {
    // hàm lấy tất cả các dữ liệu được nhập vào
    let data = req.body;
    let allUsers = await CRUDService.updateUserData(data);
    return res.render('displayCRUD.ejs', {
        dataForTable: allUsers,
    });
}
module.exports = {
    // câu lệnh export ra nhiều đối tượng hàm
    // một đối tượng hàm cần có key:value
    getHomePage: getHomePage,
    getAboutPage: getAboutPage,
    getCRUDPage: getCRUDPage,
    postCRUD: postCRUD,
    displayGetCRUD: displayGetCRUD,
    getEditedCRUD: getEditedCRUD,
    putCRUD: putCRUD,
}