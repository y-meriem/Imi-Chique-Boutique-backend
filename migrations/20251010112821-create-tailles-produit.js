"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("tailles_produit", {
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
      taille: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
    });

    await queryInterface.addConstraint("tailles_produit", {
      fields: ["id_produit", "taille"],
      type: "unique",
      name: "unique_taille_produit",
    });

    await queryInterface.addIndex("tailles_produit", ["id_produit"]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("tailles_produit");
  },
};
