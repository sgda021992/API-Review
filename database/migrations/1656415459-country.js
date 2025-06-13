'use strict';

module.exports = {
  /**
   * Runs the migration to create the 'countries' table.
   * This table stores country-related metadata such as name, capital, phone code, etc.
   *
   * @param {object} queryInterface - The interface to modify the database
   * @param {object} Sequelize - The Sequelize library for data types
   */
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('countries', {
      id: {
        allowNull: false,         // Column cannot be null
        autoIncrement: true,      // Auto-increment primary key
        primaryKey: true,         // Marks as primary key
        type: Sequelize.INTEGER,  // Integer data type
      },
      name: Sequelize.STRING,     // Country name (e.g., "India")
      phonecode: Sequelize.STRING, // Country calling code (e.g., "+91")
      capital: Sequelize.STRING,  // Capital city (e.g., "New Delhi")
      emoji: Sequelize.STRING,    // Country emoji (e.g., "🇮🇳")
      flag: Sequelize.BOOLEAN,    // Optional boolean flag (could represent visibility or status)

      createdAt: {
        type: Sequelize.DATE,     // Timestamp for when the row was created
      },
      updatedAt: {
        type: Sequelize.DATE,     // Timestamp for when the row was last updated
      },
    });
  },

  /**
   * Reverts the migration by dropping the 'countries' table.
   *
   * @param {object} queryInterface - The interface to modify the database
   * @param {object} Sequelize - The Sequelize library for data types
   */
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('countries');
  }
};
