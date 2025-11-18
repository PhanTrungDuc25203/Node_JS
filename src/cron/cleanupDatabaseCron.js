import cron from "node-cron";
import { Schedule, ExamPackageSchedule } from "../models";
import { Op } from "sequelize";

async function cleanOldDoctorSchedules(daysAgo = 1) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - daysAgo);

    try {
        const deletedCount = await Schedule.destroy({
            where: {
                date: {
                    [Op.lt]: cutoff,
                },
            },
        });
        console.log(`🧹 Đã xóa ${deletedCount} bản ghi Schedule cũ hơn ${daysAgo} ngày.`);
    } catch (err) {
        console.error("Lỗi dọn Schedule:", err);
    }
}

async function cleanOldPackagesSchedules(daysAgo = 1) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - daysAgo);

    try {
        const deletedCount = await ExamPackageSchedule.destroy({
            where: {
                date: {
                    [Op.lt]: cutoff,
                },
            },
        });
        console.log(`🧹 Đã xóa ${deletedCount} bản ghi ExamPackageSchedule cũ hơn ${daysAgo} ngày.`);
    } catch (err) {
        console.error("Lỗi dọn ExamPackageSchedule:", err);
    }
}

export function startCleanupCronJobs() {
    console.log("🚀 Cron job dọn dẹp đã được khởi động!");

    // Chạy mỗi ngày lúc 00:00
    cron.schedule("0 0 * * *", async () => {
        console.log("🔄 Cron cleanup chạy lúc 00:00");
        await cleanOldDoctorSchedules(1);
        await cleanOldPackagesSchedules(1);
    });
}
