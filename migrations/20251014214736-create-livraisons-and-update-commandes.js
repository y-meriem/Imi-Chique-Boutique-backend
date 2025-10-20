"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1️⃣ Création de la table livraisons
    await queryInterface.createTable("livraisons", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      wilaya: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,
      },
      prix_bureau: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
        comment: "Prix livraison au bureau (stop desk)",
      },
      prix_domicile: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
        comment: "Prix livraison à domicile",
      },
      actif: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        comment: "Wilaya active pour livraison",
      },
      delai_livraison: {
        type: Sequelize.STRING(50),
        defaultValue: "2-5 jours",
        comment: "Délai estimé de livraison",
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal(
          "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
        ),
      },
    });

    // 2️⃣ Modification de la table commandes
    await queryInterface.addColumn("commandes", "type_livraison", {
      type: Sequelize.ENUM("bureau", "domicile"),
      allowNull: false,
      defaultValue: "domicile",
      comment: "Type de livraison choisi",
    });

    await queryInterface.addColumn("commandes", "frais_livraison", {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      comment: "Frais de livraison appliqués",
    });

    await queryInterface.changeColumn("commandes", "adresse", {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: "Adresse de livraison (obligatoire pour domicile, optionnel pour bureau)",
    });
  },

  async down(queryInterface, Sequelize) {
    // 3️⃣ Rollback : suppression des ajouts
    await queryInterface.removeColumn("commandes", "type_livraison");
    await queryInterface.removeColumn("commandes", "frais_livraison");

    // Rétablir la colonne adresse comme NOT NULL si besoin
    await queryInterface.changeColumn("commandes", "adresse", {
      type: Sequelize.TEXT,
      allowNull: false,
    });

    // Supprimer la table livraisons
    await queryInterface.dropTable("livraisons");
  },
};
