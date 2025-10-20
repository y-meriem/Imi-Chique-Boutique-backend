"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("avis", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      utilisateur_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: "users", key: "id" },
        onDelete: "SET NULL",
      },
      produit_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: "produits", key: "id" },
        onDelete: "CASCADE",
      },
      nom: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING(150),
        allowNull: false,
      },
      note: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: { min: 1, max: 5 },
      },
      commentaire: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      statut: {
        type: Sequelize.ENUM("en_attente", "approuve", "rejete"),
        defaultValue: "en_attente",
      },
      date_creation: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("avis");
  },
};
