import cron from "node-cron";
import { Booking, ExamPackage_booking } from "../models";
import { Op } from "sequelize";

const TIMEFRAME_MAP = {
    T1: "08:00",
    T2: "09:00",
    T3: "10:00",
    T4: "11:00",
    T5: "13:00",
    T6: "14:00",
    T7: "15:00",
    T8: "16:00",
};

function buildAppointmentDateTime(date, timeType) {
    const time = TIMEFRAME_MAP[timeType];
    if (!time) return null;

    const yyyyMMdd = date.toISOString().split("T")[0];
    return new Date(`${yyyyMMdd}T${time}:00`);
}

/**
 * Hủy booking & exam package booking chưa xác nhận đã quá hạn
 */
async function cancelExpiredUnconfirmedBookings() {
    const now = new Date();

    try {
        /* ========= BOOKING ========= */
        const pendingBookings = await Booking.findAll({
            where: { statusId: "S1" },
            attributes: ["id", "date", "timeType"],
        });

        const expiredBookingIds = pendingBookings
            .filter((b) => {
                const appointmentTime = buildAppointmentDateTime(b.date, b.timeType);
                return appointmentTime && appointmentTime < now;
            })
            .map((b) => b.id);

        if (expiredBookingIds.length) {
            await Booking.update({ statusId: "S4" }, { where: { id: { [Op.in]: expiredBookingIds } } });

            console.log(`❌ Đã hủy ${expiredBookingIds.length} booking quá hạn.`);
        }

        /* ========= EXAM PACKAGE BOOKING ========= */
        const pendingPackageBookings = await ExamPackage_booking.findAll({
            where: { statusId: "S1" },
            attributes: ["id", "date", "timeType"],
        });

        const expiredPackageBookingIds = pendingPackageBookings
            .filter((b) => {
                const appointmentTime = buildAppointmentDateTime(b.date, b.timeType);
                return appointmentTime && appointmentTime < now;
            })
            .map((b) => b.id);

        if (expiredPackageBookingIds.length) {
            await ExamPackage_booking.update({ statusId: "S4" }, { where: { id: { [Op.in]: expiredPackageBookingIds } } });

            console.log(`❌ Đã hủy ${expiredPackageBookingIds.length} exam package booking quá hạn.`);
        }

        if (!expiredBookingIds.length && !expiredPackageBookingIds.length) {
            console.log("ℹ️ Không có booking nào quá hạn cần hủy.");
        }
    } catch (err) {
        console.error("❌ Lỗi cron hủy booking quá hạn:", err);
    }
}

/**
 * Start cron
 */
export function startCancelUnconfirmedBookingsCron() {
    console.log("🚀 Cron job hủy booking chưa xác nhận đã được khởi động!");

    // chạy ngay khi start app
    cancelExpiredUnconfirmedBookings();

    // chạy 00:00 mỗi ngày
    cron.schedule("0 0 * * *", async () => {
        console.log("🔄 Cron hủy booking chạy lúc 00:00");
        await cancelExpiredUnconfirmedBookings();
    });
}
