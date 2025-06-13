"use strict";
const { options } = require("../constant");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const set = options.productCategories.map((category) => {
      return {
        name: category,
        groupName: "product-categories",
      };
    });
    return queryInterface.bulkInsert("options", set);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete(
      "options",
      { groupName: "product-categories" },
      null
    );
  },
};
