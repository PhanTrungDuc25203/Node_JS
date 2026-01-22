import db from "../models/index";
require("dotenv").config();
import bcrypt from "bcryptjs";
import moment from "moment";
import nodemailer from "nodemailer";
import twilio from "twilio";
import { generateAccessToken, generateRefreshToken, saveRefreshToken } from "./jwtService";

const salt = bcrypt.genSaltSync(10);
const emailOTPStore = {};
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
let phoneOTPStore = {};

let hashUserPassword = (password) => {
    return new Promise(async (resolve, reject) => {
        try {
            let hashPassword = await bcrypt.hashSync(password, salt);
            resolve(hashPassword);
        } catch (e) {
            reject(e);
        }
    });
};

let handleUserLogin = (email, password) => {
    return new Promise(async (resolve, reject) => {
        try {
            let user = await db.User.findOne({
                where: { email: email },
            });

            if (!user) {
                resolve({
                    errCode: 1,
                    message: "User not found",
                });
            } else {
                let checkPassword = bcrypt.compareSync(password, user.password);
                if (!checkPassword) {
                    resolve({
                        errCode: 2,
                        message: "Incorrect password",
                    });
                } else {
                    // ✅ Generate tokens
                    const accessToken = generateAccessToken(user);
                    const refreshToken = generateRefreshToken(user);

                    // ✅ Save refresh token
                    await saveRefreshToken(user.id, refreshToken);

                    // ✅ Trả về format cũ frontend đang dùng
                    resolve({
                        errCode: 0,
                        message: "Login successful",
                        user: {
                            id: user.id,
                            email: user.email,
                            roleId: user.roleId,
                            positionId: user.positionId,
                            firstName: user.firstName,
                            lastName: user.lastName,
                        },
                        accessToken, // access token
                        refreshToken, // có thể ẩn nếu chưa cần FE dùng
                    });
                }
            }
        } catch (error) {
            reject(error);
        }
    });
};

let checkUserEmail = (userEmail) => {
    return new Promise(async (resolve, reject) => {
        try {
            let user = await db.User.findOne({
                where: {
                    email: userEmail,
                    password: { [db.Sequelize.Op.ne]: "" },
                },
            });
            if (user) {
                resolve(true);
            } else {
                resolve(false);
            }
        } catch (e) {
            reject(e);
        }
    });
};

let getAllUsersForReact = (userId) => {
    //tham số truyền vào userId ở đây là id người dùng hoặc all như quy định bên userController.js
    return new Promise(async (resolve, reject) => {
        try {
            let users = "";
            //trả về ít thông tin người dùng thôi không lộ hết:))
            if (userId === "ALL") {
                users = db.User.findAll({
                    attributes: {
                        exclude: ["password"],
                    },
                });
            }
            if (userId && userId !== "ALL") {
                users = await db.User.findOne({
                    where: { id: userId },
                    attributes: {
                        exclude: ["password"],
                    },
                });
            }

            resolve(users);
        } catch (e) {
            reject(e);
        }
    });
};

let createNewUserInReact = (data) => {
    //data cuả hàm này đươcj gửi từ client
    return new Promise(async (resolve, reject) => {
        try {
            //check sự tồn tại của email
            let check = await checkUserEmail(data.email);
            if (check) {
                resolve({
                    errCode: 1,
                    message: "User has already been exist!",
                });
            } else {
                let hashPasswordFromBcrypt = await hashUserPassword(data.password);

                // Tìm người dùng dựa trên email
                let existingUser = await db.User.findOne({
                    where: { email: data.email },
                });

                if (existingUser) {
                    // Nếu người dùng đã tồn tại, cập nhật thông tin
                    await db.User.update(
                        {
                            password: hashPasswordFromBcrypt,
                            firstName: data.firstName,
                            lastName: data.lastName,
                            address: data.address,
                            phoneNumber: data.phoneNumber,
                            gender: data.gender,
                            image: data.image, // Cập nhật image nếu cần
                            roleId: data.roleId,
                            positionId: data.positionId,
                        },
                        {
                            where: { email: data.email },
                        },
                    );

                    resolve({
                        errCode: 0,
                        message: "Update user successfully!",
                    });
                } else {
                    // Nếu người dùng không tồn tại, tạo mới
                    await db.User.create({
                        email: data.email,
                        password: hashPasswordFromBcrypt,
                        firstName: data.firstName,
                        lastName: data.lastName,
                        address: data.address,
                        phoneNumber: data.phoneNumber,
                        gender: data.gender,
                        image: data.image, // Gán giá trị cho image
                        roleId: data.roleId,
                        positionId: data.positionId,
                    });

                    resolve({
                        errCode: 0,
                        message: "Create user successfully!",
                    });
                }
            }
        } catch (e) {
            reject(e);
        }
    });
};

let editUserInReact = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            //ở dự án react có 2 crud là gọi api thuần và api thông qua redux, code ở dưới là
            //gọi api thuần, code đang chạy là api thông qua redux, nếu muốn dùng chức năng
            //thuần thì đổi chỗ 2 đoạn code if này
            // if (!data.id) {
            if (!data.id || !data.roleId || !data.positionId || !data.gender) {
                resolve({
                    errCode: 2,
                    errMessage: "Missing parameters!",
                });
            }
            let user = await db.User.findOne({
                where: { id: data.id },
                //ở file config.json đã chuyển raw:true nên
                //hàm update và delete không thể chạy, khi chạy nhớ chuyển raw: false
                raw: false,
            });
            if (user) {
                user.firstName = data.firstName;
                user.lastName = data.lastName;
                user.address = data.address;
                user.phoneNumber = data.phoneNumber;
                user.gender = data.gender;
                user.roleId = data.roleId;
                user.positionId = data.positionId;
                if (data.image) {
                    user.image = data.image;
                }

                await user.save();
                // await db.User.save({
                //     firstName: data.firstName,
                //     lastName: data.lastName,
                //     address: data.address,
                //     phoneNumber: data.phoneNumber,
                //     gender: data.gender,
                //     roleId: data.roleId,
                // })
                resolve({
                    errCode: 0,
                    message: "User updated!",
                });
            } else {
                resolve({
                    errCode: 1,
                    errMessage: "User is not found!",
                });
            }
        } catch (e) {
            reject(e);
        }
    });
};

let deleteUserInReact = (userIdFromReact) => {
    return new Promise(async (resolve, reject) => {
        //nếu không muốn dài dòng rườm ra thì sử dụng câu lệnh tổ hợp như sau:
        // await db.User.destroy({
        //     where: { id: userIdFromReact }
        // })

        try {
            let user = await db.User.findOne({
                where: { id: userIdFromReact },
                raw: false,
            });
            console.log(user);
            if (!user) {
                resolve({
                    errCode: 2,
                    errMessage: "User is not exist!",
                });
            } else {
                await user.destroy();
                resolve({
                    errCode: 0,
                    message: "User has been deleted successfully",
                });
            }
        } catch (e) {
            reject(e);
        }
    });
};

let getAllCodesDataService = (typeInput) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!typeInput) {
                resolve({
                    errCode: 1,
                    errMessage: "Missing required parameters!",
                });
            } else {
                let res = {};
                //tên db.Allcode không liên quan tới db trong phpmyadmin, nó được định nghĩa bên trong model
                //của project này
                let allCodesData = await db.Allcode.findAll({
                    where: { type: typeInput },
                });
                res.errCode = 0;
                res.data = allCodesData;
                resolve(res);
            }
        } catch (e) {
            reject(e);
        }
    });
};

let getAllRelativeInforsOfCurrentSystemUserService = (currentUserEmail) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!currentUserEmail) {
                resolve({
                    errCode: 1,
                    errMessage: "Missing input parameter: current user email!",
                });
            } else {
                let res = {};
                let userInUserTable = await db.User.findOne({
                    where: { email: currentUserEmail },
                    attributes: {
                        exclude: ["password", "createdAt", "updatedAt"],
                    },
                    include: [
                        {
                            model: db.Allcode,
                            as: "roleData",
                            attributes: ["value_Eng", "value_Vie"],
                        },
                        {
                            model: db.Allcode,
                            as: "positionData",
                            attributes: ["value_Eng", "value_Vie"],
                        },
                        {
                            model: db.Allcode,
                            as: "genderData",
                            attributes: ["value_Eng", "value_Vie"],
                        },
                        {
                            model: db.Doctor_infor,
                            attributes: {
                                exclude: ["id", "doctorId"],
                            },
                            include: [
                                {
                                    model: db.Specialty,
                                    as: "belongToSpecialty",
                                    attributes: ["name"],
                                },
                            ],
                        },
                    ],
                });

                if (userInUserTable) {
                    // ======== LẤY BIRTHDAY TỪ BẢNG BOOKING ========
                    let bookingRecord = await db.Booking.findOne({
                        where: { patientId: userInUserTable.id },
                        attributes: ["patientBirthday"],
                        order: [["createdAt", "DESC"]],
                    });

                    if (bookingRecord && bookingRecord.patientBirthday) {
                        userInUserTable.dataValues.birthday = moment(bookingRecord.patientBirthday).format("DD/MM/YYYY");
                    } else {
                        userInUserTable.dataValues.birthday = null;
                    }

                    // ======== FORMAT DATE CHO DANH SÁCH LỊCH ========
                    if (userInUserTable.doctorHasAppointmentWithPatients) {
                        userInUserTable.doctorHasAppointmentWithPatients.forEach((appointment) => {
                            appointment.date = moment(appointment.date).format("YYYY-MM-DD");
                            appointment.patientBirthday = moment(appointment.patientBirthday).format("YYYY-MM-DD");
                        });
                    }

                    if (userInUserTable.patientHasAppointmentWithDoctors) {
                        userInUserTable.patientHasAppointmentWithDoctors.forEach((appointment) => {
                            appointment.date = moment(appointment.date).format("YYYY-MM-DD");
                            appointment.patientBirthday = moment(appointment.patientBirthday).format("YYYY-MM-DD");
                        });
                    }
                }

                res.errCode = 0;
                res.errMessage = "Get current user informations successfully!";
                res.data = userInUserTable;

                resolve(res);
            }
        } catch (e) {
            reject(e);
        }
    });
};

let getAllRelativeBookingsOfCurrentSystemUserService = (currentUserEmail, appointmentWithUser = false) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!currentUserEmail) {
                resolve({
                    errCode: 1,
                    errMessage: "Missing input parameter: current user email!",
                });
                return;
            }

            let includeOptions = [];

            // --- Trường hợp 1: chỉ lấy thông tin cơ bản (phiên bản cũ)
            if (!appointmentWithUser) {
                includeOptions = [
                    {
                        model: db.Booking,
                        as: "doctorHasAppointmentWithPatients",
                        attributes: ["id", "statusId", "timeType", "doctorId", "patientId", "date", "patientPhoneNumber", "patientAddress", "patientBirthday", "patientGender", "examReason", "paymentMethod", "paymentStatus", "paidAmount", "files"],
                        include: [
                            {
                                model: db.Allcode,
                                as: "appointmentTimeTypeData",
                                attributes: ["value_Vie", "value_Eng"],
                            },
                        ],
                    },
                    {
                        model: db.Booking,
                        as: "patientHasAppointmentWithDoctors",
                        attributes: ["id", "statusId", "timeType", "doctorId", "patientId", "date", "patientPhoneNumber", "patientAddress", "patientBirthday", "patientGender", "paymentMethod", "paymentStatus", "paidAmount", "files"],
                        include: [
                            {
                                model: db.Allcode,
                                as: "appointmentTimeTypeData",
                                attributes: ["value_Vie", "value_Eng"],
                            },
                        ],
                    },
                ];
            }
            // --- Trường hợp 2: lấy thêm thông tin user liên quan (phiên bản mới)
            else {
                includeOptions = [
                    {
                        model: db.Booking,
                        as: "doctorHasAppointmentWithPatients",
                        attributes: ["id", "statusId", "timeType", "doctorId", "patientId", "date", "patientPhoneNumber", "patientAddress", "patientBirthday", "patientGender", "examReason", "paymentMethod", "paymentStatus", "paidAmount", "files"],
                        include: [
                            {
                                model: db.Allcode,
                                as: "appointmentTimeTypeData",
                                attributes: ["value_Vie", "value_Eng"],
                            },
                            {
                                model: db.User,
                                as: "patientHasAppointmentWithDoctors",
                                attributes: ["id", "firstName", "lastName", "address", "phoneNumber"],
                            },
                        ],
                    },
                    {
                        model: db.Booking,
                        as: "patientHasAppointmentWithDoctors",
                        attributes: ["id", "statusId", "timeType", "doctorId", "patientId", "date", "patientPhoneNumber", "patientAddress", "patientBirthday", "patientGender", "paymentMethod", "paymentStatus", "paidAmount", "files"],
                        include: [
                            {
                                model: db.Allcode,
                                as: "appointmentTimeTypeData",
                                attributes: ["value_Vie", "value_Eng"],
                            },
                            {
                                model: db.User,
                                as: "doctorHasAppointmentWithPatients",
                                attributes: ["id", "firstName", "lastName", "address", "phoneNumber"],
                            },
                        ],
                    },
                ];
            }

            let allBookingsOfCurrentUser = await db.User.findOne({
                where: { email: currentUserEmail },
                attributes: {
                    exclude: ["password", "id", "createdAt", "updatedAt", "firstName", "lastName", "address", "gender", "phoneNumber", "image", "roleId", "positionId"],
                },
                include: includeOptions,
            });

            const resData = {
                errCode: 0,
                errMessage: "Get current user bookings successfully!",
                data: allBookingsOfCurrentUser,
            };

            resolve(resData);
        } catch (e) {
            reject(e);
        }
    });
};

let saveRateAndReviewAboutDoctorService = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.userEmail || !data.doctorEmail || !data.appointmentId || !data.rating) {
                return resolve({
                    errCode: 1,
                    errMessage: "Missing input parameter: userEmail; doctorEmail; appointmentId; rating!",
                });
            }

            let bookedAppointment = await db.Booking.findOne({
                where: { id: data.appointmentId },
                attributes: {
                    exclude: ["timeType", "date", "patientPhoneNumber", "patientBirthday", "patientAddress", "patientGender", "token", "createdAt", "updatedAt"],
                },
            });

            // console.log("Check: ", bookedAppointment);

            if (!bookedAppointment || bookedAppointment.statusId !== "S3") {
                return resolve({
                    errCode: 2,
                    errMessage: "Appointment not found or not valid to review!",
                });
            }

            const rateAndReviewData = {
                userId: bookedAppointment.patientId,
                userEmail: data.userEmail,
                doctorId: bookedAppointment.doctorId,
                doctorEmail: data.doctorEmail,
                packageId: "",
                packageName: "",
                appointmentId: bookedAppointment.id,
                paidPackageId: "",
                rating: data.rating,
                content: data.content && data.content.trim() !== "" ? data.content : null,
                images: data.images ? (data.images.length > 0 ? JSON.stringify(data.images) : null) : null,
            };

            let existingReview = await db.DoctorPackageRate.findOne({
                where: { appointmentId: bookedAppointment.id },
            });

            if (!existingReview) {
                await db.DoctorPackageRate.create(rateAndReviewData);
                return resolve({
                    errCode: 0,
                    message: "Save rate and review about doctor successfully!",
                });
            } else {
                let createdTime = new Date(existingReview.createdAt);
                let now = new Date();
                let diffHours = (now - createdTime) / (1000 * 60 * 60);

                if (diffHours <= 24) {
                    await existingReview.update(rateAndReviewData);
                    return resolve({
                        errCode: 0,
                        message: "Update rate and review about doctor successfully!",
                    });
                } else {
                    return resolve({
                        errCode: 3,
                        errMessage: "You can only update your review within 1 day after posting!",
                    });
                }
            }
        } catch (e) {
            reject(e);
        }
    });
};

let saveRateAndReviewAboutPackageService = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.userEmail || !data.packageId || !data.paidPackageId || !data.rating) {
                return resolve({
                    errCode: 1,
                    errMessage: "Missing input parameter: userEmail; packageId; paidPackageId; rating!",
                });
            }

            // 1️⃣ Kiểm tra gói đã mua
            let bookedPackage = await db.ExamPackage_booking.findOne({
                where: { id: data.paidPackageId },
                attributes: {
                    exclude: ["createdAt", "updatedAt"],
                },
            });

            if (!bookedPackage || bookedPackage.statusId !== "S3") {
                return resolve({
                    errCode: 2,
                    errMessage: "Package not found or not valid to review!",
                });
            }

            // 2️⃣ Chuẩn hóa dữ liệu lưu
            const rateAndReviewData = {
                userId: bookedPackage.patientId,
                userEmail: data.userEmail,

                doctorId: "",
                doctorEmail: "",

                packageId: data.packageId,
                packageName: data.packageName || "",

                appointmentId: "",
                paidPackageId: bookedPackage.id,

                rating: data.rating,
                content: data.content && data.content.trim() !== "" ? data.content : null,
                images: data.images ? (data.images.length > 0 ? JSON.stringify(data.images) : null) : null,
            };

            // 3️⃣ Check đã review chưa
            let existingReview = await db.DoctorPackageRate.findOne({
                where: { paidPackageId: bookedPackage.id },
            });

            if (!existingReview) {
                await db.DoctorPackageRate.create(rateAndReviewData);
                return resolve({
                    errCode: 0,
                    message: "Save rate and review about package successfully!",
                });
            } else {
                let createdTime = new Date(existingReview.createdAt);
                let now = new Date();
                let diffHours = (now - createdTime) / (1000 * 60 * 60);

                if (diffHours <= 24) {
                    await existingReview.update(rateAndReviewData);
                    return resolve({
                        errCode: 0,
                        message: "Update rate and review about package successfully!",
                    });
                } else {
                    return resolve({
                        errCode: 3,
                        errMessage: "You can only update your review within 1 day after posting!",
                    });
                }
            }
        } catch (e) {
            reject(e);
        }
    });
};

let getRateAndReviewAboutDoctorService = ({ appointmentId, doctorId }) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!appointmentId && !doctorId) {
                return resolve({
                    errCode: 1,
                    errMessage: "Missing input parameter: appointmentId or doctorId!",
                });
            }

            if (appointmentId) {
                let data = await db.DoctorPackageRate.findOne({
                    where: { appointmentId },
                });

                return resolve({
                    errCode: 0,
                    data,
                });
            }

            if (doctorId) {
                let data = await db.DoctorPackageRate.findAll({
                    where: { doctorId },
                    order: [["createdAt", "DESC"]],
                    include: [
                        {
                            model: db.User,
                            as: "patientData",
                            attributes: ["id", "firstName", "lastName", "email", "image"], // các trường bạn muốn lấy
                        },
                        {
                            model: db.Booking,
                            as: "appointmentData",
                            attributes: ["date"],
                        },
                    ],
                });

                if (!data || data.length === 0) {
                    return resolve({
                        errCode: 0,
                        data: [],
                        averageRating: 0,
                    });
                }

                let sum = data.reduce((total, item) => total + (item.rating || 0), 0);
                let average = sum / data.length;

                return resolve({
                    errCode: 0,
                    data,
                    averageRating: Number(average.toFixed(1)), // làm tròn 1 số thập phân
                });
            }
        } catch (e) {
            reject(e);
        }
    });
};

let getRateAndReviewAboutExamPackageService = ({ examPackageBookingId, examPackageId }) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!examPackageBookingId && !examPackageId) {
                return resolve({
                    errCode: 1,
                    errMessage: "Missing input parameter: examPackageBookingId or examPackageId!",
                });
            }

            if (examPackageBookingId) {
                let data = await db.DoctorPackageRate.findOne({
                    where: {
                        paidPackageId: examPackageBookingId,
                    },
                });

                return resolve({
                    errCode: 0,
                    data,
                });
            }

            if (examPackageId) {
                let data = await db.DoctorPackageRate.findAll({
                    where: { packageId: examPackageId },
                    order: [["createdAt", "DESC"]],
                    include: [
                        {
                            model: db.User,
                            as: "patientData",
                            attributes: ["id", "firstName", "lastName", "email", "image"], // các trường bạn muốn lấy
                        },
                        {
                            model: db.ExamPackage_booking,
                            as: "paidPackageData",
                            attributes: ["date"],
                        },
                    ],
                });

                if (!data || data.length === 0) {
                    return resolve({
                        errCode: 0,
                        data: [],
                        averageRating: 0,
                    });
                }

                let sum = data.reduce((total, item) => total + (item.rating || 0), 0);
                let average = sum / data.length;

                return resolve({
                    errCode: 0,
                    data,
                    averageRating: Number(average.toFixed(1)), // làm tròn 1 số thập phân
                });
            }
        } catch (e) {
            reject(e);
        }
    });
};

let sendEmailOTP = (email) => {
    return new Promise(async (resolve, reject) => {
        try {
            const otp = Math.floor(100000 + Math.random() * 900000).toString();

            emailOTPStore[email] = otp;

            let transporter = nodemailer.createTransport({
                host: process.env.EMAIL_HOST,
                port: Number(process.env.EMAIL_PORT),
                secure: process.env.EMAIL_SECURE === "true",
                service: "gmail",
                auth: {
                    user: process.env.SENDER_EMAIL,
                    pass: process.env.EMAIL_APP_PASSWORD,
                },
            });

            await transporter.sendMail({
                from: `"Xác thực email" <${process.env.SENDER_EMAIL}>`,
                to: email,
                subject: "Mã OTP xác thực của bạn",
                html: `
                <h2>Mã OTP xác thực của bạn là: <b>${otp}</b></h2>
                <span>Vui lòng không chia sẻ mã OTP này cho bất cứ ai!</span>
                `,
            });

            resolve({ errCode: 0, message: "OTP sent" });
        } catch (e) {
            reject(e);
        }
    });
};

let verifyEmailOTP = (email, otp) => {
    return new Promise((resolve) => {
        if (emailOTPStore[email] === otp) {
            delete emailOTPStore[email];
            resolve({ errCode: 0, message: "OTP correct" });
        } else {
            resolve({ errCode: 1, message: "OTP incorrect" });
        }
    });
};

let sendPhoneOTP = (phoneNumber) => {
    return new Promise(async (resolve, reject) => {
        try {
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            phoneOTPStore[phoneNumber] = otp;

            let res = await client.verify.v2.services(process.env.TWILIO_VERIFY_SERVICE_SID).verifications.create({
                body: `
                    Mã OTP xác thực của bạn là: ${otp}
                    Vui lòng không chia sẽ mã này cho bất kỳ ai!
                `,
                to: phoneNumber,
                channel: "sms",
            });

            // console.log("Check SMS phonenumber response: ", res);

            resolve({ errCode: 0, message: "OTP sent" });
        } catch (e) {
            reject(e);
        }
    });
};

let verifyPhoneOTP = (phoneNumber, otp) => {
    return new Promise(async (resolve, reject) => {
        const res = await client.verify.v2.services(process.env.TWILIO_VERIFY_SERVICE_SID).verificationChecks.create({
            to: phoneNumber,
            code: otp,
        });
        resolve({ res });
        console.log("Check SMS res: ", res);
    });
};

module.exports = {
    handleUserLogin: handleUserLogin,
    checkUserEmail: checkUserEmail,
    getAllUsersForReact: getAllUsersForReact,
    createNewUserInReact: createNewUserInReact,
    sendEmailOTP: sendEmailOTP,
    sendPhoneOTP: sendPhoneOTP,
    verifyPhoneOTP: verifyPhoneOTP,
    verifyEmailOTP: verifyEmailOTP,
    deleteUserInReact: deleteUserInReact,
    editUserInReact: editUserInReact,
    getAllCodesDataService: getAllCodesDataService,
    getAllRelativeInforsOfCurrentSystemUserService: getAllRelativeInforsOfCurrentSystemUserService,
    getAllRelativeBookingsOfCurrentSystemUserService: getAllRelativeBookingsOfCurrentSystemUserService,
    // getAllRelativeBookingsOfCurrentSystemUser2Service: getAllRelativeBookingsOfCurrentSystemUser2Service,
    saveRateAndReviewAboutDoctorService: saveRateAndReviewAboutDoctorService,
    saveRateAndReviewAboutPackageService: saveRateAndReviewAboutPackageService,
    getRateAndReviewAboutDoctorService: getRateAndReviewAboutDoctorService,
    getRateAndReviewAboutExamPackageService: getRateAndReviewAboutExamPackageService,
};
