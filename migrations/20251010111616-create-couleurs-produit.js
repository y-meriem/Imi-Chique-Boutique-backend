"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("couleurs_produit", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      id_produit: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "produits", key: "id" },
        onDelete: "CASCADE",
      },
      couleur: { type: Sequelize.STRING(50), allowNull: false },
      code_couleur: { type: Sequelize.STRING(7) },
    });

    await queryInterface.addConstraint("couleurs_produit", {
      fields: ["id_produit", "couleur"],
      type: "unique",
      name: "unique_couleur_produit",
    });

    await queryInterface.addIndex("couleurs_produit", ["id_produit"]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("couleurs_produit");
  },
};
