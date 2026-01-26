"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addConstraint("Bookings", {
            fields: ["doctorId", "date", "timeType"],
            type: "unique",
            name: "unique_doctor_date_time_booking",
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeConstraint("Bookings", "unique_doctor_date_time_booking");
    },
};
