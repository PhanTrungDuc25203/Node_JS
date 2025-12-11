"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("ExamPackage_results", {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },

            bookingId: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },

            templateId: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },

            staffId: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },

            result: {
                type: Sequelize.TEXT("long"),
                allowNull: false,
            },

            status: {
                type: Sequelize.STRING,
                allowNull: false,
                defaultValue: "PENDING",
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
        await queryInterface.dropTable("ExamPackage_results");
    },
};
