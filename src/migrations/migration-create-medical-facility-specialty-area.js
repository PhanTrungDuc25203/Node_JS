'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // tên bảng viết hoa hay thường thì mysql tự chuyển thành thường
        await queryInterface.createTable('MedicalFacilitySpecialtyAreas', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },

            medicalFacilityId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'ComplexMedicalFacilities',
                    key: 'id'
                },
                onDelete: 'CASCADE'  // Xóa dữ liệu nếu bản ghi ở bảng liên kết bị xóa
            },
            specialtyId: {
                type: Sequelize.INTEGER
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
        await queryInterface.dropTable('MedicalFacilitySpecialtyAreas');
    }
};