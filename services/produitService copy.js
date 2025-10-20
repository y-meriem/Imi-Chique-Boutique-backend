const { Produit, CouleurProduit, TailleProduit, ImageProduit } = require("../models");

class ProduitService {
  async getAll() {
    return await Produit.findAll({
      include: [CouleurProduit, TailleProduit, ImageProduit],
    });
  }

  async getById(id) {
    return await Produit.findByPk(id, {
      include: [CouleurProduit, TailleProduit, ImageProduit],
    });
  }

  async create(data) {
    return await Produit.create(data, {
      include: [CouleurProduit, TailleProduit, ImageProduit],
    });
  }

  async update(id, data) {
    const produit = await Produit.findByPk(id);
    if (!produit) throw new Error("Produit introuvable");
    return await produit.update(data);
  }

  async delete(id) {
    return await Produit.destroy({ where: { id } });
  }
}

module.exports = new ProduitService();
