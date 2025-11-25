import { resolveInclude } from "ejs";
import db from "../models/index";
import bcrypt from "bcryptjs";
require("dotenv").config();
import _ from "lodash";
import moment from "moment";
import { where } from "sequelize";
import sendConfirmBookingEmailService from "./sendConfirmBookingEmailService";
import { v4 as uuidv4 } from "uuid";

let buildUrlConfirmMedicalRecord = (doctorId, token) => {
    let result = `${process.env.URL_REACT_SERVER}/confirm-booking?token=${token}&doctorId=${doctorId}`;
    return result;
};

let buildUrlPaymentPage = (doctorId, token) => {
    let result = `${process.env.URL_REACT_SERVER}/booking-payment?token=${token}&doctorId=${doctorId}`;
    return result;
};

let patientInforWhenBookingTimeService = async (data) => {
    try {
        // ===== 1. Check missing parameters =====
        if (!data.email || !data.doctorId || !data.timeType || !data.date || !data.fullname || !data.appointmentMoment) {
            return {
                errCode: 1,
                errMessage: `Missing parameter(s)!`,
            };
        }

        // ===== 2. Kiểm tra xung đột lịch hẹn =====

        // Check ❶: Người dùng đã có lịch với chính bác sĩ này cùng ngày
        let conflictSameDoctor = await db.Booking.findOne({
            where: {
                patientId: db.Sequelize.literal(`
                    (SELECT id FROM Users WHERE email = '${data.email}')
                `),
                doctorId: data.doctorId,
                date: data.date, // ngày giống nhau
                statusId: { [db.Sequelize.Op.ne]: "S3" }, // không tính lịch đã xong
            },
        });

        if (conflictSameDoctor) {
            return {
                errCode: 2,
                errMessage: `Bạn đã có lịch hẹn với bác sĩ này trong ngày này rồi!`,
            };
        }

        // Check ❷: Người dùng đã đặt lịch cùng timeType + cùng ngày nhưng với bác sĩ khác
        let conflictSameTime = await db.Booking.findOne({
            where: {
                patientId: db.Sequelize.literal(`
                    (SELECT id FROM Users WHERE email = '${data.email}')
                `),
                doctorId: { [db.Sequelize.Op.ne]: data.doctorId },
                date: data.date,
                timeType: data.timeType,
                statusId: { [db.Sequelize.Op.ne]: "S3" },
            },
        });

        if (conflictSameTime) {
            return {
                errCode: 3,
                errMessage: `Bạn đã có lịch hẹn khác trong cùng thời điểm này rồi!`,
            };
        }

        // ===== 3. Lấy thông tin bác sĩ =====
        let doctorInfor = await db.User.findOne({
            where: { id: data.doctorId },
            attributes: {
                exclude: ["id", "email", "password", "address", "phoneNumber", "roleId", "positionId"],
            },
            include: [
                {
                    model: db.Doctor_infor,
                    attributes: ["clinicName", "clinicAddress"],
                },
            ],
            raw: false,
        });

        let token = uuidv4();

        // ===== 4. Build redirect link =====
        let redirectLink = data.selectedPaymentMethod === "PM1" ? buildUrlPaymentPage(data.doctorId, token) : buildUrlConfirmMedicalRecord(data.doctorId, token);

        // ===== 5. Send email =====
        await sendConfirmBookingEmailService.sendAEmail({
            receiverEmail: data.email,
            patientName: data.fullname,
            time: data.appointmentMoment,
            doctorName: doctorInfor.lastName + " " + doctorInfor.firstName,
            clinicName: doctorInfor.Doctor_infor.clinicName,
            clinicAddress: doctorInfor.Doctor_infor.clinicAddress,
            language: data.language,
            redirectLink: redirectLink,
            isPayment: data.selectedPaymentMethod === "PM1",
        });

        // ===== 6. Tách họ tên =====
        let fullName = data.fullname.trim();
        let lastSpaceIndex = fullName.lastIndexOf(" ");
        let firstName = lastSpaceIndex === -1 ? fullName : fullName.slice(lastSpaceIndex + 1);
        let lastName = lastSpaceIndex === -1 ? "" : fullName.slice(0, lastSpaceIndex);

        // ===== 7. Tạo bệnh nhân nếu chưa có =====
        let [patient] = await db.User.findOrCreate({
            where: { email: data.email },
            defaults: {
                email: data.email,
                lastName: lastName,
                firstName: firstName,
                phoneNumber: data.phoneNumber,
                address: data.address,
                gender: data.selectedGender,
                roleId: "R3",
            },
        });
        if (data.needUpdateProfileInfo === true) {
            // ===== 7a. Cập nhật các trường còn thiếu =====
            let updateData = {};
            if (!patient.gender && data.selectedGender) updateData.gender = data.selectedGender;
            if (!patient.phoneNumber && data.phoneNumber) updateData.phoneNumber = data.phoneNumber;
            if (!patient.address && data.address) updateData.address = data.address;

            if (Object.keys(updateData).length > 0) {
                await patient.update(updateData);
            }
        }

        // ===== 8. Lưu booking =====
        await db.Booking.create({
            statusId: "S1",
            doctorId: data.doctorId,
            patientId: patient.id,
            date: data.date,
            timeType: data.timeType,
            patientPhoneNumber: data.phoneNumber,
            patientBirthday: data.birthday,
            patientAddress: data.address,
            patientGender: data.selectedGender,
            examReason: data.reason,
            paymentMethod: data.selectedPaymentMethod || "PM3",
            paymentStatus: "PT1",
            paidAmount: 0,
            token: token,
        });

        return {
            errCode: 0,
            errMessage: `Booking created successfully!`,
        };
    } catch (e) {
        return {
            errCode: -1,
            errMessage: "Server error!",
        };
    }
};

let confirmBookingAppointmentService = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.token || !data.doctorId) {
                resolve({
                    errCode: 1,
                    errMessage: `Missing parameter(s): token or doctorId!`,
                });
            } else {
                let appointment = await db.Booking.findOne({
                    where: {
                        doctorId: data.doctorId,
                        token: data.token,
                        statusId: "S1",
                    },
                    include: [
                        {
                            model: db.User,
                            as: "doctorHasAppointmentWithPatients",
                            attributes: ["id", "firstName", "lastName", "address", "phoneNumber"],
                            include: [
                                {
                                    model: db.Doctor_infor,
                                    attributes: {
                                        exclude: ["id", "doctorId", "provinceId", "specialtyId", "clinicId", "note", "count"],
                                    },
                                    include: [
                                        {
                                            model: db.Allcode,
                                            as: "priceTypeData",
                                            attributes: ["value_Eng", "value_Vie"],
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                    raw: false,
                });

                if (appointment) {
                    switch (appointment.paymentMethod) {
                        case "PM1":
                            appointment.statusId = "S2";
                            appointment.paidAmount = data.paidAmount / 100;
                            let amountToBePaid = +appointment?.doctorHasAppointmentWithPatients?.Doctor_infor?.priceTypeData?.value_Vie;
                            let differential = amountToBePaid - data.paidAmount / 100;
                            if (differential === 0) {
                                appointment.paymentStatus = "PT3";
                            } else if (differential > 0) {
                                appointment.paymentStatus = "PT2";
                            }
                            await appointment.save();
                            break;
                        case "PM2":
                            appointment.statusId = "S2";
                            await appointment.save();
                            break;
                        case "PM3":
                            appointment.statusId = "S2";
                            await appointment.save();
                            break;
                    }
                    resolve({
                        errCode: 0,
                        errMessage: "The patient has confirmed!",
                    });
                } else {
                    resolve({
                        errCode: 2,
                        errMessage: "Appointment has been actived or does not exist!",
                    });
                }
            }
        } catch (e) {
            reject(e);
        }
    });
};

let getAppointmentHistoriesByPatientEmailService = (inputPatientEmail) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!inputPatientEmail) {
                resolve({
                    errCode: 1,
                    errMessage: `Missing required parameters: patient's email!`,
                });
            } else {
                let user = await db.User.findOne({
                    where: {
                        email: inputPatientEmail,
                    },
                    attributes: {
                        exclude: ["createdAt", "updatedAt", "image"],
                    },
                });
                if (user) {
                    let data = await db.Booking.findAll({
                        where: {
                            patientId: user.id,
                            statusId: "S3",
                            paymentStatus: "PT3",
                        },
                        include: [
                            {
                                model: db.Allcode,
                                as: "appointmentTimeTypeData",
                                attributes: ["value_Vie", "value_Eng"],
                            },
                            {
                                model: db.User,
                                as: "doctorHasAppointmentWithPatients",
                                attributes: ["id", "firstName", "lastName", "address", "phoneNumber", "email"],
                            },
                        ],
                        attributes: {
                            exclude: ["createdAt", "updatedAt"],
                        },
                        raw: false,
                    });
                    if (!data) {
                        data = {};
                    }

                    resolve({
                        data: data,
                        errCode: 0,
                        errMessage: "Get appointment histories successfully!",
                    });
                } else {
                    resolve({
                        errCode: 1,
                        errMessage: "User not found!",
                    });
                }
            }
        } catch (e) {
            reject(e);
        }
    });
};

module.exports = {
    patientInforWhenBookingTimeService: patientInforWhenBookingTimeService,
    confirmBookingAppointmentService: confirmBookingAppointmentService,
    getAppointmentHistoriesByPatientEmailService: getAppointmentHistoriesByPatientEmailService,
};
