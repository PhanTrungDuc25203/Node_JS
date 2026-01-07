import { resolveInclude } from "ejs";
import db from "../models/index";
import bcrypt from "bcryptjs";
require("dotenv").config();
import _ from "lodash";
import moment from "moment";
import { where, Op, fn, col, literal } from "sequelize";
import sendConfirmBookingEmailService from "./sendConfirmBookingEmailService";
import { v4 as uuidv4 } from "uuid";

const calculateTimeDecayScore = (days) => {
    const lambda = 0.05; // hệ số suy giảm
    return Math.exp(-lambda * days);
};

const calculateConfidenceRating = (avgRating, ratingCount) => {
    if (!avgRating) return 0;
    return (avgRating / 5) * Math.log(ratingCount + 1);
};

const calculatePriceScore = (price) => {
    const MIN_PRICE = 200000;
    const MAX_PRICE = 500000;

    if (!price) return 0.5; // fallback trung lập

    return 1 - (price - MIN_PRICE) / (MAX_PRICE - MIN_PRICE);
};

let recommendDoctorsForPatientService = async (patientId) => {
    try {
        // ===== 1. Validate input =====
        if (!patientId) {
            return {
                errCode: 1,
                errMessage: "Missing parameter(s): patientId!",
            };
        }

        // ===== 2. Lấy lần khám gần nhất của bệnh nhân =====
        const lastBooking = await db.Booking.findOne({
            where: { patientId },
            order: [["date", "DESC"]],
            include: [
                {
                    model: db.User,
                    as: "doctorHasAppointmentWithPatients",
                    include: [
                        {
                            model: db.Doctor_infor,
                        },
                    ],
                },
            ],
        });

        const targetSpecialtyId = lastBooking?.doctorHasAppointmentWithPatients?.Doctor_infor?.specialtyId || null;

        // ===== 3. Lấy danh sách bác sĩ =====
        const doctors = await db.User.findAll({
            where: { roleId: "R2" },
            include: [
                { model: db.Allcode, as: "positionData", attributes: ["value_Eng", "value_Vie"] },
                {
                    model: db.Doctor_infor,
                    attributes: { exclude: ["id", "doctorId"] },
                    include: [
                        { model: db.Allcode, as: "priceTypeData", attributes: ["value_Eng", "value_Vie"] },
                        { model: db.Allcode, as: "provinceTypeData", attributes: ["value_Eng", "value_Vie"] },
                        { model: db.Allcode, as: "paymentTypeData", attributes: ["value_Eng", "value_Vie"] },
                        { model: db.Specialty, as: "belongToSpecialty", attributes: ["name"] },
                    ],
                },
                {
                    model: db.Doctor_specialty_medicalFacility,
                    attributes: { exclude: ["id", "createdAt", "updatedAt"] },
                    include: [
                        {
                            model: db.ComplexMedicalFacility,
                            as: "medicalFacilityDoctorAndSpecialty",
                            attributes: ["id", "name", "address"],
                        },
                    ],
                },
                {
                    model: db.DoctorPackageRate,
                    as: "doctorRatings",
                    attributes: [],
                },
            ],
            attributes: {
                include: [[fn("AVG", col("doctorRatings.rating")), "avgRating"]],
            },
            group: ["User.id", "Doctor_infor.id"],
            raw: true,
            nest: true,
        });

        // ===== 4. Lịch sử khám + thời gian gần nhất =====
        const bookingHistory = await db.Booking.findAll({
            where: { patientId },
            attributes: ["doctorId", [fn("COUNT", col("doctorId")), "visitCount"], [fn("MAX", col("date")), "lastVisitDate"]],
            group: ["doctorId"],
            raw: true,
        });

        const historyMap = {};
        bookingHistory.forEach((item) => {
            historyMap[item.doctorId] = {
                visitCount: Number(item.visitCount),
                lastVisitDate: item.lastVisitDate,
            };
        });

        // ===== 5. Tính điểm recommendation (FULL) =====
        const scoredDoctors = doctors.map((doctor) => {
            /** 1. Specialty score */
            const specialtyScore = targetSpecialtyId && doctor.Doctor_infor?.specialtyId === targetSpecialtyId ? 1 : 0;

            /** 2. History score (time decay) */
            const history = historyMap[doctor.id];
            let historyScore = 0;

            if (history?.lastVisitDate) {
                const daysSinceLastVisit = (Date.now() - new Date(history.lastVisitDate)) / (1000 * 60 * 60 * 24);
                historyScore = calculateTimeDecayScore(daysSinceLastVisit);
            }

            /** 3. Rating score */
            const avgRating = doctor.avgRating ? Number(doctor.avgRating) : 0;
            const ratingCount = doctor.doctorRatingsCount || 1;
            const ratingScore = calculateConfidenceRating(avgRating, ratingCount);

            /** 4. Price score */
            const price = Number(doctor.Doctor_infor?.priceTypeData?.value_Vie) || null;
            const priceScore = calculatePriceScore(price);

            /** 5. Diversity bonus */
            const diversityBonus = history ? 0 : 0.1;

            /** 6. Final score */
            const finalScore = specialtyScore * 0.35 + historyScore * 0.2 + ratingScore * 0.2 + priceScore * 0.15 + diversityBonus * 0.1;

            return {
                ...doctor,
                avgRating,
                visitedCount: history?.visitCount || 0,
                price,
                finalScore,
            };
        });

        // ===== 6. Sort & lấy top 3 =====
        const topDoctors = scoredDoctors.sort((a, b) => b.finalScore - a.finalScore).slice(0, 3);

        return {
            errCode: 0,
            errMessage: "Get appropriate doctors for patient successfully!",
            data: topDoctors,
        };
    } catch (e) {
        console.error("Get appropriate doctors for patient failed:", e);
        return {
            errCode: -1,
            errMessage: "Server error!",
        };
    }
};

module.exports = {
    recommendDoctorsForPatientService: recommendDoctorsForPatientService,
};
