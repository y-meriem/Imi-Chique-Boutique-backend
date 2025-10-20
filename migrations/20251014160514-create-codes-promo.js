"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1️⃣ Création de la table codes_promo
    await queryInterface.createTable("codes_promo", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      code: {
        type: Sequelize.STRING(50),
        unique: true,
        allowNull: false,
      },
      pourcentage_reduction: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
      },
      montant_reduction: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: null,
      },
      date_debut: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      date_fin: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      utilisations_max: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: null,
      },
      utilisations_actuelles: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      actif: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });

    // 2️⃣ Ajout des colonnes dans la table commandes
    await queryInterface.addColumn("commandes", "code_promo_id", {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: null,
      references: {
        model: "codes_promo",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });

    await queryInterface.addColumn("commandes", "montant_reduction", {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    });
  },

  async down(queryInterface, Sequelize) {
    // 3️⃣ Suppression des colonnes et de la table
    await queryInterface.removeColumn("commandes", "montant_reduction");
    await queryInterface.removeColumn("commandes", "code_promo_id");
    await queryInterface.dropTable("codes_promo");
  },
};
