// models/favorisModel.js
const db = require('../config/database');

class Favoris {
  static async add(utilisateur_id, produit_id) {
    const [result] = await db.query(
      'INSERT INTO favoris (utilisateur_id, produit_id) VALUES (?, ?)',
      [utilisateur_id, produit_id]
    );
    return result.insertId;
  }

  static async remove(utilisateur_id, produit_id) {
    await db.query(
      'DELETE FROM favoris WHERE utilisateur_id = ? AND produit_id = ?',
      [utilisateur_id, produit_id]
    );
  }

  static async findByUser(utilisateur_id) {
    try {
      // 1. Récupérer les favoris
      const [favorisRows] = await db.query(
        `SELECT f.id as favori_id, f.produit_id, f.date_ajout, f.utilisateur_id
         FROM favoris f 
         INNER JOIN produits p ON f.produit_id = p.id 
         WHERE f.utilisateur_id = ? AND p.statut = 'actif'
         ORDER BY f.date_ajout DESC`,
        [utilisateur_id]
      );


      // 2. Pour chaque favori, récupérer le produit complet
      const favorisComplets = [];

      for (let favori of favorisRows) {
        const produitId = favori.produit_id;

        // Récupérer le produit
        const [products] = await db.query(
          `SELECT * FROM produits WHERE id = ?`,
          [produitId]
        );

        if (products.length === 0) {
          continue;
        }

        const product = products[0];
        product.favori_id = favori.favori_id;
        product.date_ajout = favori.date_ajout;
        product.utilisateur_id = favori.utilisateur_id;

        // Récupérer les couleurs
        const [couleurs] = await db.query(
          `SELECT id, couleur, code_couleur FROM couleurs_produit WHERE id_produit  = ?`,
          [produitId]
        );
        product.couleurs = couleurs;

        // Récupérer les images
        const [images] = await db.query(
          `SELECT ip.*, cp.couleur 
           FROM images_produit ip
           LEFT JOIN couleurs_produit cp ON ip.id_couleur = cp.id
           WHERE ip.id_produit = ?
           ORDER BY ip.est_principale DESC, ip.ordre ASC`,
          [produitId]
        );
        product.images = images;

        // Récupérer les tailles
        const [tailles] = await db.query(
          `SELECT taille FROM tailles_produit WHERE id_produit = ?`,
          [produitId]
        );
        product.tailles = tailles.map(t => t.taille);

        favorisComplets.push(product);
      }

      return favorisComplets;

    } catch (error) {
      console.error('❌ Erreur dans findByUser:', error);
      throw error;
    }
  }

  static async check(utilisateur_id, produit_id) {
    const [rows] = await db.query(
      'SELECT id FROM favoris WHERE utilisateur_id = ? AND produit_id = ?',
      [utilisateur_id, produit_id]
    );
    return rows.length > 0;
  }
}

module.exports = Favoris;