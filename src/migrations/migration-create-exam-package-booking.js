"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // tên bảng viết hoa hay thường thì mysql tự chuyển thành thường
        await queryInterface.createTable("ExamPackage_bookings", {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            statusId: {
                type: Sequelize.STRING,
            },
            examPackageId: {
                type: Sequelize.STRING,
            },
            patientId: {
                type: Sequelize.INTEGER,
            },
            date: {
                type: Sequelize.DATE,
            },
            timeType: {
                type: Sequelize.STRING,
            },
            //
            patientPhoneNumber: {
                type: Sequelize.STRING,
            },
            patientBirthday: {
                type: Sequelize.DATE,
            },
            patientAddress: {
                type: Sequelize.STRING,
            },
            patientGender: {
                type: Sequelize.STRING,
            },
            token: {
                type: Sequelize.STRING,
            },
            paymentMethod: {
                type: Sequelize.STRING,
            },
            paymentStatus: {
                type: Sequelize.STRING,
            },
            paidAmount: {
                type: Sequelize.INTEGER,
            },

            createdAt: {
                allowNull: false,
                type: Sequelize.DATE,
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE,
            },
        });
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable("ExamPackage_bookings");
    },
};
