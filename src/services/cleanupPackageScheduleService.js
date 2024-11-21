// services/cleanupScheduleService.js
const { ExamPackageSchedule } = require('../models'); // Import model Schedule
const { Op } = require('sequelize');

async function cleanOldSchedules(daysAgo = 1) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysAgo);

    try {
        // Xóa các bản ghi cũ hơn ngày giới hạn
        const deletedCount = await ExamPackageSchedule.destroy({
            where: {
                date: {
                    [Op.lt]: cutoffDate, // Xóa bản ghi với ngày cũ hơn cutoffDate
                },
            },
        });
        console.log(`Đã xóa ${deletedCount} bản ghi cũ hơn ${daysAgo} ngày trong bảng Exam package schedule.`);
    } catch (error) {
        console.error('Lỗi khi xóa bản ghi cũ của bảng Exam package schedule:', error);
    }
}

module.exports = { cleanOldSchedules };
