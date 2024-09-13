// services/cleanupScheduleService.js
const { Schedule } = require('../models'); // Import model Schedule
const { Op } = require('sequelize');

async function cleanOldRecords(daysAgo = 1) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysAgo);

  try {
    // Xóa các bản ghi cũ hơn ngày giới hạn
    const deletedCount = await Schedule.destroy({
      where: {
        date: {
          [Op.lt]: cutoffDate, // Xóa bản ghi với ngày cũ hơn cutoffDate
        },
      },
    });
    console.log(`Đã xóa ${deletedCount} bản ghi cũ hơn ${daysAgo} ngày.`);
  } catch (error) {
    console.error('Lỗi khi xóa bản ghi cũ:', error);
  }
}

module.exports = { cleanOldRecords };
