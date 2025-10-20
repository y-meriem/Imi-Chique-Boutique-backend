"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("images_produit", {
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
      id_couleur: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: "couleurs_produit", key: "id" },
        onDelete: "CASCADE",
      },
      url_image: {
        type: Sequelize.STRING(500),
        allowNull: false,
      },
      ordre: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      est_principale: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
    });

    await queryInterface.addIndex("images_produit", ["id_produit"]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("images_produit");
  },
};
