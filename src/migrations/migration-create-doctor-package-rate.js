"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        //tên bảng viết hoa hay thường thì mysql tự chuyển thành thường
        await queryInterface.createTable("DoctorPackageRates", {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            userId: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            userEmail: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            doctorId: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            doctorEmail: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            packageId: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            packageName: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            appointmentId: {
                allowNull: false,
                type: Sequelize.INTEGER,
            },
            paidPackageId: {
                allowNull: false,
                type: Sequelize.INTEGER,
            },
            rating: {
                type: Sequelize.TINYINT,
                allowNull: false,
            },
            content: {
                type: Sequelize.TEXT("long"),
                allowNull: true,
            },
            images: {
                type: Sequelize.TEXT("long"),
                allowNull: true,
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
        await queryInterface.dropTable("DoctorPackageRates");
    },
};
