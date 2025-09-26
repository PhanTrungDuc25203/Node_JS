import { resolveInclude } from "ejs";
import db from "../models/index";
import bcrypt from "bcryptjs";
require("dotenv").config();
import _ from "lodash";
import moment from "moment";
import { where } from "sequelize";
import sendEmailService from "./sendEmailService";
import { v4 as uuidv4 } from "uuid";

let buildUrlConfirmMedicalRecord = (doctorId, token) => {
    let result = `${process.env.URL_REACT_SERVER}/confirm-booking?token=${token}&doctorId=${doctorId}`;
    return result;
};

let patientInforWhenBookingTimeService = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.email || !data.doctorId || !data.timeType || !data.date || !data.fullname || !data.appointmentMoment || !data.phoneNumber) {
                resolve({
                    errCode: 1,
                    errMessage: `Missing parameter(s)!`,
                });
            } else {
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

                let token = uuidv4(); // ⇨ '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d'

                await sendEmailService.sendAEmail({
                    receiverEmail: data.email,
                    patientName: data.fullname,
                    time: data.appointmentMoment,
                    doctorName: doctorInfor.lastName + " " + doctorInfor.firstName,
                    clinicName: doctorInfor.Doctor_infor.clinicName,
                    clinicAddress: doctorInfor.Doctor_infor.clinicAddress,
                    language: data.language,
                    redirectLink: buildUrlConfirmMedicalRecord(data.doctorId, token),
                });

                //upsert data
                let fullName = data.fullname.trim(); // loại bỏ khoảng trắng thừa nếu có
                let lastSpaceIndex = fullName.lastIndexOf(" ");

                let firstName = lastSpaceIndex === -1 ? fullName : fullName.slice(lastSpaceIndex + 1);
                let lastName = lastSpaceIndex === -1 ? "" : fullName.slice(0, lastSpaceIndex);

                let patient = await db.User.findOrCreate({
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

                // let patient = await db.User.findOrCreate({
                //     where: { email: data.email },
                //     defaults: {
                //         email: data.email,
                //         lastName: data.fullname,
                //         phoneNumber: data.phoneNumber,
                //         address: data.address,
                //         gender: data.selectedGender,
                //         roleId: 'R3',
                //     }
                // });

                //create a booking records
                if (patient && patient[0]) {
                    await db.Booking.findOrCreate({
                        where: {
                            //khi khác S3 thì không lưu bản ghi mới: db.Sequelize.Op.ne là not equal = ne
                            patientId: patient[0].id,
                            doctorId: data.doctorId,
                            statusId: { [db.Sequelize.Op.ne]: "S3" },
                        },
                        defaults: {
                            statusId: "S1", //hardcode
                            doctorId: data.doctorId,
                            patientId: patient[0].id,
                            date: data.date,
                            timeType: data.timeType,
                            patientPhoneNumber: data.phoneNumber,
                            patientBirthday: data.birthday,
                            patientAddress: data.address,
                            patientGender: data.selectedGender,
                            token: token,
                        },
                    });
                }

                resolve({
                    errCode: 0,
                    errMessage: `Save patient's information successfully!`,
                    // data: patient,
                });
            }
        } catch (e) {
            reject(e);
        }
    });
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
                    raw: false,
                });

                if (appointment) {
                    appointment.statusId = "S2";
                    await appointment.save();
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
                let data = await db.History.findAll({
                    where: { patientEmail: inputPatientEmail },
                    attributes: {
                        exclude: ["createdAt", "updatedAt"],
                    },
                    include: [{ model: db.Allcode, as: "appointmentTimeFrameData", attributes: ["value_Eng", "value_Vie"] }],
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
