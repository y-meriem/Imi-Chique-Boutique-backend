const db = require('../config/database');

class LivraisonModel {
  // Récupérer toutes les livraisons actives
  static async getAllLivraisons() {
    try {
      const [rows] = await db.query(
        `SELECT * FROM livraisons WHERE actif = 1 ORDER BY wilaya ASC`
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Récupérer une livraison par wilaya
  static async getLivraisonByWilaya(wilaya) {
    try {
      const [rows] = await db.query(
        `SELECT * FROM livraisons WHERE wilaya = ? AND actif = 1`,
        [wilaya]
      );
      
      if (rows.length === 0) {
        return null;
      }
      
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Créer une nouvelle livraison (Admin)
  static async createLivraison(data) {
    try {
      const [result] = await db.query(
        `INSERT INTO livraisons (wilaya, prix_bureau, prix_domicile, delai_livraison) 
         VALUES (?, ?, ?, ?)`,
        [data.wilaya, data.prix_bureau, data.prix_domicile, data.delai_livraison || '2-5 jours']
      );
      
      return { success: true, id: result.insertId };
    } catch (error) {
      throw error;
    }
  }

  // Mettre à jour une livraison (Admin)
  static async updateLivraison(id, data) {
    try {
      await db.query(
        `UPDATE livraisons 
         SET prix_bureau = ?, prix_domicile = ?, delai_livraison = ?, actif = ?
         WHERE id = ?`,
        [data.prix_bureau, data.prix_domicile, data.delai_livraison, data.actif, id]
      );
      
      return { success: true };
    } catch (error) {
      throw error;
    }
  }

  // Supprimer une livraison (Admin)
  static async deleteLivraison(id) {
    try {
      await db.query(`DELETE FROM livraisons WHERE id = ?`, [id]);
      return { success: true };
    } catch (error) {
      throw error;
    }
  }

  // Désactiver une livraison au lieu de supprimer
  static async deactivateLivraison(id) {
    try {
      await db.query(`UPDATE livraisons SET actif = 0 WHERE id = ?`, [id]);
      return { success: true };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = LivraisonModel;