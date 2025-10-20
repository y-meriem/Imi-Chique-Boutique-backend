"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("favoris", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      utilisateur_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "users", key: "id" },
        onDelete: "CASCADE",
      },
      produit_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "produits", key: "id" },
        onDelete: "CASCADE",
      },
      date_ajout: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });

    await queryInterface.addConstraint("favoris", {
      fields: ["utilisateur_id", "produit_id"],
      type: "unique",
      name: "unique_favori",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("favoris");
  },
};
