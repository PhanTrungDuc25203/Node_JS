"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // tên bảng viết hoa hay thường thì mysql tự chuyển thành thường
        await queryInterface.createTable("ExamPackage_result_templates", {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },

            examPackageId: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            version: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 1,
            },
            template: {
                type: Sequelize.TEXT("long"),
                allowNull: false,
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
        await queryInterface.dropTable("ExamPackage_result_templates");
    },
};
