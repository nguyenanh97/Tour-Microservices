'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('Auth');

    if (!table.deletedAt) {
      await queryInterface.addColumn('Auth', 'deletedAt', {
        type: Sequelize.DATE,
        allowNull: true,
      });
    }

    const indexes = await queryInterface.showIndex('Auth');
    const hasIndex =
      Array.isArray(indexes) && indexes.some(i => i.name === 'idx_auth_deletedAt');

    if (!hasIndex) {
      await queryInterface.addIndex('Auth', ['deletedAt'], {
        name: 'idx_auth_deletedAt',
        unique: false,
      });
    }
  },

  async down(queryInterface) {
    try {
      await queryInterface.removeIndex('Auth', 'idx_auth_deletedAt');
    } catch (_) {}

    const table = await queryInterface.describeTable('Auth');
    if (table.deletedAt) {
      await queryInterface.removeColumn('Auth', 'deletedAt');
    }
  },
};
//docker compose exec auth npx sequelize-cli db:migrate
//```docker compose exec auth npx sequelize-cli db:migrate
