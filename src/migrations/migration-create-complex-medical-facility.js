'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // tên bảng viết hoa hay thường thì mysql tự chuyển thành thường
        await queryInterface.createTable('ComplexMedicalFacilities', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },

            name: {
                type: Sequelize.STRING
            },
            provinceId: {
                type: Sequelize.STRING
            },
            address: {
                type: Sequelize.STRING
            },
            htmlDescription: {
                allowNull: false,
                type: Sequelize.TEXT('long')
            },
            markdownDescription: {
                allowNull: false,
                type: Sequelize.TEXT('long')
            },
            htmlEquipment: {
                allowNull: false,
                type: Sequelize.TEXT('long')
            },
            markdownEquipment: {
                allowNull: false,
                type: Sequelize.TEXT('long')
            },
            image: {
                type: Sequelize.BLOB('long')
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
        await queryInterface.dropTable('ComplexMedicalFacilities');
    }
};