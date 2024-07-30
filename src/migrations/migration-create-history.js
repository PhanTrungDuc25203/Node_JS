'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // tên bảng viết hoa hay thường thì mysql tự chuyển thành thường
        await queryInterface.createTable('Histories', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            patientId: {
                type: Sequelize.INTEGER
            },
            doctorId: {
                type: Sequelize.INTEGER
            },
            description: {
                type: Sequelize.TEXT
            },
            files: {
                type: Sequelize.TEXT
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE
            }
        });
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('Histories');
    }
};