'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('Auth');
    // add emailOriginal
    if (!table.emailOriginal) {
      await queryInterface.addColumn('Auth', 'emailOriginal', {
        type: Sequelize.STRING(255),
        allowNull: true,
      });
    }
    await queryInterface.sequelize.query(
      `UPDATE Auth
      SET emailOriginal = LOWER( email) WHERE (emailOriginal IS NULL OR emailOriginal = '')
      AND email NOT LIKE '%#deleted#%'`,
    );
    await queryInterface.sequelize.query(
      `UPDATE Auth
       SET emailOriginal =LOWER(SUBSTRING_INDEX(email, '#deleted#', 1))
       WHERE (emailOriginal IS NULL OR emailOriginal = '')
       AND email LIKE '%#deleted#%'`,
    );

    // set NOT NULL
    await queryInterface.changeColumn('Auth', 'emailOriginal', {
      type: Sequelize.STRING(255),
      allowNull: false,
    });
    // index phục vụ truy vết
    const indexes = await queryInterface.showIndex('Auth');
    const hasIndex =
      Array.isArray(indexes) &&
      indexes.some(i => i.name === 'idx_auth_emailOriginal');
    if (!hasIndex) {
      await queryInterface.addIndex('Auth', ['emailOriginal'], {
        name: 'idx_auth_emailOriginal',
      });
    }
  },
  async down(queryInterface) {
    try {
      await queryInterface.removeIndex('Auth', 'idx_auth_emailOriginal');
    } catch (_) {}
    const table = await queryInterface.describeTable('Auth');
    if (table.emailOriginal) {
      await queryInterface.removeColumn('Auth', 'emailOriginal');
    }
  },
};
