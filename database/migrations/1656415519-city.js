'use strict';

module.exports = {
  /**
   * Run the migration to create the 'cities' table.
   * This table stores city records and links each city to a specific state and country using foreign keys.
   *
   * @param {object} queryInterface - The interface for running DB operations
   * @param {object} Sequelize - The Sequelize library for data types
   */
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('cities', {
      id: {
        allowNull: false,         // Column must have a value
        autoIncrement: true,      // Auto-incrementing primary key
        primaryKey: true,         // Sets this column as the primary key
        type: Sequelize.INTEGER,  // Data type: integer
      },

      name: Sequelize.STRING,     // Name of the city (e.g., "Los Angeles")

      stateId: {
        type: Sequelize.INTEGER,  // Foreign key referencing the 'states' table
        references: {
          model: 'states',        // Name of the referenced table
          key: 'id',              // Referenced column in the 'states' table
        },
        onDelete: 'CASCADE',      // Delete city if the associated state is deleted
      },

      countryId: {
        type: Sequelize.INTEGER,  // Foreign key referencing the 'countries' table
        references: {
          model: 'countries',     // Name of the referenced table
          key: 'id',              // Referenced column in the 'countries' table
        },
        onDelete: 'CASCADE',      // Delete city if the associated country is deleted
      },

      flag: Sequelize.BOOLEAN,    // Optional boolean flag (e.g., for status or visibility)

      createdAt: {
        type: Sequelize.DATE,     // Timestamp for when the record was created
      },

      updatedAt: {
        type: Sequelize.DATE,     // Timestamp for when the record was last updated
      }
    });
  },

  /**
   * Revert the migration by dropping the 'cities' table.
   *
   * @param {object} queryInterface - Interface for reversing DB operations
   * @param {object} Sequelize - Sequelize library reference
   */
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('cities');
  }
};
