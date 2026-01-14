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

        // ===== 3. Lấy danh sách bác sĩ - FIXED: Tách riêng rating query =====
        const doctors = await db.User.findAll({
            where: { roleId: "R2" },
            include: [
                {
                    model: db.Allcode,
                    as: "positionData",
                    attributes: ["value_Eng", "value_Vie"],
                },
                {
                    model: db.Doctor_infor,
                    attributes: { exclude: ["id"] },
                    include: [
                        {
                            model: db.Allcode,
                            as: "priceTypeData",
                            attributes: ["value_Eng", "value_Vie"],
                        },
                        {
                            model: db.Allcode,
                            as: "provinceTypeData",
                            attributes: ["value_Eng", "value_Vie"],
                        },
                        {
                            model: db.Allcode,
                            as: "paymentTypeData",
                            attributes: ["value_Eng", "value_Vie"],
                        },
                        {
                            model: db.Specialty,
                            as: "belongToSpecialty",
                            attributes: ["name"],
                        },
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
            ],
        });

        // ===== Lấy rating riêng cho từng doctor =====
        const doctorIds = doctors.map((d) => d.id);
        const ratings = await db.DoctorPackageRate.findAll({
            where: { doctorId: doctorIds },
            attributes: ["doctorId", [fn("AVG", col("rating")), "avgRating"], [fn("COUNT", col("id")), "ratingCount"]],
            group: ["doctorId"],
            raw: true,
        });

        const ratingMap = {};
        ratings.forEach((r) => {
            ratingMap[r.doctorId] = {
                avgRating: Number(r.avgRating) || 0,
                ratingCount: Number(r.ratingCount) || 0,
            };
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
            const doctorData = doctor.get({ plain: true });

            /** 1. Specialty score */
            const specialtyScore = targetSpecialtyId && doctorData.Doctor_infor?.specialtyId === targetSpecialtyId ? 1 : 0;

            /** 2. History score (time decay) */
            const history = historyMap[doctorData.id];
            let historyScore = 0;

            if (history?.lastVisitDate) {
                const daysSinceLastVisit = (Date.now() - new Date(history.lastVisitDate)) / (1000 * 60 * 60 * 24);
                historyScore = calculateTimeDecayScore(daysSinceLastVisit);
            }

            /** 3. Rating score */
            const ratingData = ratingMap[doctorData.id] || { avgRating: 0, ratingCount: 0 };
            const avgRating = ratingData.avgRating;
            const ratingCount = ratingData.ratingCount;
            const ratingScore = calculateConfidenceRating(avgRating, ratingCount);

            /** 4. Price score */
            const price = Number(doctorData.Doctor_infor?.priceTypeData?.value_Vie) || null;
            const priceScore = calculatePriceScore(price);

            /** 5. Diversity bonus */
            const diversityBonus = history ? 0 : 0.1;

            /** 6. Final score */
            const finalScore = specialtyScore * 0.35 + historyScore * 0.2 + ratingScore * 0.2 + priceScore * 0.15 + diversityBonus * 0.1;

            return {
                ...doctorData,
                avgRating,
                ratingCount,
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

let recommendPackagesForPatientService = async (patientId) => {
    try {
        // ===== 1. Validate input =====
        if (!patientId) {
            return {
                errCode: 1,
                errMessage: "Missing parameter(s): patientId!",
            };
        }

        // ===== 2. Lấy lần khám gói gần nhất (đã DONE) =====
        const lastPackageBooking = await db.ExamPackage_booking.findOne({
            where: {
                patientId,
                statusId: "S3",
            },
            include: [
                {
                    model: db.ExamPackage_result,
                    as: "examPackageResult",
                    where: { status: "DONE" },
                    required: true,
                },
                {
                    model: db.ExamPackage_specialty_medicalFacility,
                    as: "examPackage",
                },
            ],
            order: [["date", "DESC"]],
        });

        const targetSpecialtyId = lastPackageBooking?.examPackage?.specialtyId || null;

        // ===== 3. Lấy danh sách tất cả gói khám - FIXED =====
        const packages = await db.ExamPackage_specialty_medicalFacility.findAll({
            include: [
                {
                    model: db.Allcode,
                    as: "priceDataForPackage",
                    attributes: ["value_Vie", "value_Eng"],
                },
                {
                    model: db.Specialty,
                    as: "examPackageHaveSpecialty",
                    attributes: ["id", "name"],
                },
                {
                    model: db.ComplexMedicalFacility,
                    as: "medicalFacilityPackage",
                    attributes: ["id", "name", "address"],
                },
            ],
            attributes: {
                exclude: ["htmlDescription", "markdownDescription", "htmlCategory", "markdownCategory"],
            },
        });

        // ===== Lấy rating riêng =====
        const packageIds = packages.map((p) => p.id);
        const ratings = await db.DoctorPackageRate.findAll({
            where: { packageId: packageIds },
            attributes: ["packageId", [fn("AVG", col("rating")), "avgRating"], [fn("COUNT", col("id")), "ratingCount"]],
            group: ["packageId"],
            raw: true,
        });

        const ratingMap = {};
        ratings.forEach((r) => {
            ratingMap[r.packageId] = {
                avgRating: Number(r.avgRating) || 0,
                ratingCount: Number(r.ratingCount) || 0,
            };
        });

        // ===== 4. Lịch sử khám gói của bệnh nhân (DONE) - FIXED =====
        // Lấy danh sách examPackageId có kết quả DONE
        const doneResults = await db.ExamPackage_result.findAll({
            where: { status: "DONE" },
            attributes: ["bookingId"],
            raw: true,
        });

        const doneBookingIds = doneResults.map((r) => r.bookingId);

        // Query packageHistory với điều kiện booking đã DONE
        const packageHistory = await db.ExamPackage_booking.findAll({
            where: {
                patientId,
                statusId: "S3",
                id: doneBookingIds, // Chỉ lấy booking có kết quả DONE
            },
            attributes: ["examPackageId", [fn("COUNT", col("examPackageId")), "visitCount"], [fn("MAX", col("date")), "lastVisitDate"]],
            group: ["examPackageId"],
            raw: true,
        });

        const historyMap = {};
        packageHistory.forEach((item) => {
            historyMap[item.examPackageId] = {
                visitCount: Number(item.visitCount),
                lastVisitDate: item.lastVisitDate,
            };
        });

        // ===== 5. Tính điểm recommendation =====
        const scoredPackages = packages.map((pkg) => {
            const pkgData = pkg.get({ plain: true });

            /** 1. Specialty score */
            const specialtyScore = targetSpecialtyId && pkgData.specialtyId === targetSpecialtyId ? 1 : 0;

            /** 2. History score */
            const history = historyMap[pkgData.id];
            let historyScore = 0;

            if (history?.lastVisitDate) {
                const daysSinceLastVisit = (Date.now() - new Date(history.lastVisitDate)) / (1000 * 60 * 60 * 24);
                historyScore = calculateTimeDecayScore(daysSinceLastVisit);
            }

            /** 3. Rating score */
            const ratingData = ratingMap[pkgData.id] || { avgRating: 0, ratingCount: 0 };
            const avgRating = ratingData.avgRating;
            const ratingCount = ratingData.ratingCount;
            const ratingScore = calculateConfidenceRating(avgRating, ratingCount);

            /** 4. Price score */
            const price = Number(pkgData.priceDataForPackage?.value_Vie) || null;
            const priceScore = calculatePriceScore(price);

            /** 5. Diversity bonus */
            const diversityBonus = history ? 0 : 0.1;

            /** 6. Final score */
            const finalScore = specialtyScore * 0.35 + historyScore * 0.2 + ratingScore * 0.2 + priceScore * 0.15 + diversityBonus * 0.1;

            return {
                ...pkgData,
                avgRating,
                ratingCount,
                visitedCount: history?.visitCount || 0,
                price,
                finalScore,
            };
        });

        // ===== 6. Sort & top 3 =====
        const topPackages = scoredPackages.sort((a, b) => b.finalScore - a.finalScore).slice(0, 2);

        return {
            errCode: 0,
            errMessage: "Get appropriate packages for patient successfully!",
            data: topPackages,
        };
    } catch (e) {
        console.error("Get appropriate packages for patient failed:", e);
        return {
            errCode: -1,
            errMessage: "Server error!",
        };
    }
};

module.exports = {
    recommendDoctorsForPatientService: recommendDoctorsForPatientService,
    recommendPackagesForPatientService: recommendPackagesForPatientService,
};
