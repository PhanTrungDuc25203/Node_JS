"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        //tên bảng viết hoa hay thường thì mysql tự chuyển thành thường
        await queryInterface.createTable("DoctorPackageRate", {
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
            doctorId: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            packageId: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            appointmentId: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            rating: {
                type: Sequelize.TINYINT,
                allowNull: false,
            },
            content: {
                type: Sequelize.TEXT("long"),
                allowNull: true,
            },
            image: {
                type: Sequelize.BLOB("long"),
                allowNull: true,
            },
            mimeType: {
                type: Sequelize.STRING(50),
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
        await queryInterface.dropTable("Users");
    },
};
