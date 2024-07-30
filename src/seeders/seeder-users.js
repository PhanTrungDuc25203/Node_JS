'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.bulkInsert('Users', [
      {

        // email: DataTypes.STRING,
        // password: DataTypes.STRING,
        // firstName: DataTypes.STRING,
        // lastName: DataTypes.STRING,
        // address: DataTypes.STRING,
        // phoneNumber: DataTypes.STRING,
        // gender: DataTypes.BOOLEAN,
        // image: DataTypes.STRING,
        // roleId: DataTypes.STRING,
        // positionId: DataTypes.STRING,

        email: 'phantrungduc2522003@gmail.com',
        password: 'ptd2522003',
        firstName: 'Phan',
        lastName: 'Piscean',
        address: 'phường Bến Gót, TP.Việt Trì, tỉnh Phú Thọ',
        phoneNumber: '0397259556',
        gender: true,
        image: 'C:/Users/84355/Pictures/Screenshots/Screenshot 2023-12-21 132911.png',
        roleId: 'R1',
        positionId: 'Phó khoa tấu hề',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
};
