"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("articles_commande", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      commande_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "commandes",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      produit_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "produits",
          key: "id",
        },
      },
      quantite: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      prix_unitaire: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      couleur_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "couleurs_produit",
          key: "id",
        },
      },
      taille: {
        type: Sequelize.STRING(10),
        allowNull: true,
      },
    });

    await queryInterface.addIndex("articles_commande", ["commande_id"]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("articles_commande");
  },
};
