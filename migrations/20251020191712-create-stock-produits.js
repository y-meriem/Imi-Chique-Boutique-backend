"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("stock_produits", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      id_produit: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "produits",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      id_couleur: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "couleurs_produit",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      taille: {
        type: Sequelize.STRING(10),
        allowNull: true, // NULL si pas de tailles
      },
      quantite: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"),
      },
    });

    // Clé unique (id_produit, id_couleur, taille)
    await queryInterface.addConstraint("stock_produits", {
      fields: ["id_produit", "id_couleur", "taille"],
      type: "unique",
      name: "unique_variant",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("stock_produits");
  },
};
