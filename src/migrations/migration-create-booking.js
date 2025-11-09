"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // tên bảng viết hoa hay thường thì mysql tự chuyển thành thường
        await queryInterface.createTable("Bookings", {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            statusId: {
                type: Sequelize.STRING,
            },
            doctorId: {
                type: Sequelize.INTEGER,
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
            examReason: {
                type: Sequelize.TEXT("long"),
                allowNull: true,
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
            files: {
                type: Sequelize.BLOB("long"),
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
        await queryInterface.dropTable("Bookings");
    },
};
