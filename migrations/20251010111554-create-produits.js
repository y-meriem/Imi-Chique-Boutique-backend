"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("produits", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      titre: { type: Sequelize.STRING, allowNull: false },
      description: { type: Sequelize.TEXT },
      revenu: { type: Sequelize.DECIMAL(10, 2), defaultValue: 0 },
      prix: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      promo: { type: Sequelize.DECIMAL(10, 2) },
      categorie_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "categories",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      statut: {
        type: Sequelize.ENUM("actif", "inactif"),
        defaultValue: "actif",
      },
      date_creation: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      date_modification: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        onUpdate: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });

    await queryInterface.addIndex("produits", ["statut"]);
    await queryInterface.addIndex("produits", ["categorie_id"]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("produits");
  },
};
