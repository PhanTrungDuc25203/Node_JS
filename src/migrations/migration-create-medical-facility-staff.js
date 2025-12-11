"use strict";
/** @type {import('sequelize-cli').Migration} */

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("MedicalFacility_staffs", {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },

            staffId: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },

            medicalFacilityId: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },

            role: {
                type: Sequelize.STRING,
                allowNull: false,
                defaultValue: "STAFF",
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
        await queryInterface.dropTable("MedicalFacility_staffs");
    },
};
