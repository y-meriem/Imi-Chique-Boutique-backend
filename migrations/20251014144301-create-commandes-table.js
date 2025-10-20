"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("commandes", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      nom_client: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      prenom_client: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      telephone: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      wilaya: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      commune: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      adresse: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      total: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      statut: {
        type: Sequelize.ENUM(
          "en_attente",
          "confirmee",
          "en_preparation",
          "expediee",
          "livree",
          "annulee"
        ),
        defaultValue: "en_attente",
      },
      date_commande: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      date_modification: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        onUpdate: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });

    // Index
    await queryInterface.addIndex("commandes", ["statut"]);
    await queryInterface.addIndex("commandes", ["date_commande"]);
    await queryInterface.addIndex("commandes", [
      "nom_client",
      "prenom_client",
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("commandes");
  },
};
