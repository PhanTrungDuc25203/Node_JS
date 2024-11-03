'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // tên bảng viết hoa hay thường thì mysql tự chuyển thành thường
        await queryInterface.createTable('Exampackage_specialty_medicalfacilities', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },

            name: {
                type: Sequelize.STRING
            },
            specialtyId: {
                type: Sequelize.INTEGER
            },
            medicalFacilityId: {
                type: Sequelize.INTEGER
            },
            htmlDescription: {
                allowNull: false,
                type: Sequelize.TEXT('long')
            },
            markdownDescription: {
                allowNull: false,
                type: Sequelize.TEXT('long')
            },
            htmlCategory: {
                allowNull: false,
                type: Sequelize.TEXT('long')
            },
            markdownCategory: {
                allowNull: false,
                type: Sequelize.TEXT('long')
            },
            priceId: {
                type: Sequelize.STRING
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
        await queryInterface.dropTable('Exampackage_specialty_medicalfacilities');
    }
};