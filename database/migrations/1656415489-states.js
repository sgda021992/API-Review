'use strict';

module.exports = {
  /**
   * Runs the migration to create the 'states' table.
   * This table stores states/provinces and establishes a foreign key relationship with the 'countries' table.
   *
   * @param {object} queryInterface - Interface to modify the database
   * @param {object} Sequelize - Sequelize library for defining data types
   */
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('states', {
      id: {
        allowNull: false,         // Column cannot be null
        autoIncrement: true,      // Auto-incrementing primary key
        primaryKey: true,         // Primary key for the table
        type: Sequelize.INTEGER,  // Integer data type
      },

      name: Sequelize.STRING,     // Name of the state/province (e.g., "California")

      countryId: {
        type: Sequelize.INTEGER,  // Foreign key to the 'countries' table
        references: {
          model: 'countries',     // Name of the referenced table
          key: 'id',              // Referencing the 'id' field of 'countries'
        },
        onDelete: 'CASCADE',      // If a country is deleted, delete its related states as well
      },

      flag: Sequelize.BOOLEAN,    // Optional boolean flag (e.g., for visibility or status)

      createdAt: {
        type: Sequelize.DATE,     // Timestamp when the row was created
      },

      updatedAt: {
        type: Sequelize.DATE,     // Timestamp when the row was last updated
      },
    });
  },

  /**
   * Reverts the migration by dropping the 'states' table.
   *
   * @param {object} queryInterface - Interface to revert database changes
   * @param {object} Sequelize - Sequelize library
   */
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('states');
  }
};
