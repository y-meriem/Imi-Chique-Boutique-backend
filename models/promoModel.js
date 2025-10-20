const db = require('../config/database');

class PromoModel {
  // Créer un code promo
  static async createPromo(promoData) {
    try {
      const [result] = await db.query(
        `INSERT INTO codes_promo (
          code, pourcentage_reduction, montant_reduction, 
          date_debut, date_fin, utilisations_max, actif
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          promoData.code.toUpperCase(),
          promoData.pourcentage_reduction || null,
          promoData.montant_reduction || null,
          promoData.date_debut,
          promoData.date_fin,
          promoData.utilisations_max || null,
          promoData.actif !== undefined ? promoData.actif : 1
        ]
      );
      return { success: true, id: result.insertId };
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new Error('Ce code promo existe déjà');
      }
      throw error;
    }
  }

  // Récupérer tous les codes promo
  static async getAllPromos() {
    try {
      const [promos] = await db.query(
        `SELECT *, 
         (utilisations_max - utilisations_actuelles) as utilisations_restantes,
         CASE 
           WHEN actif = 0 THEN 'Inactif'
           WHEN date_fin < CURDATE() THEN 'Expiré'
           WHEN date_debut > CURDATE() THEN 'À venir'
           WHEN utilisations_max IS NOT NULL AND utilisations_actuelles >= utilisations_max THEN 'Épuisé'
           ELSE 'Actif'
         END as status
         FROM codes_promo 
         ORDER BY created_at DESC`
      );
      return promos;
    } catch (error) {
      throw error;
    }
  }

  // Récupérer un code promo par ID
  static async getPromoById(id) {
    try {
      const [promos] = await db.query(
        `SELECT * FROM codes_promo WHERE id = ?`,
        [id]
      );
      
      if (promos.length === 0) {
        throw new Error('Code promo non trouvé');
      }
      
      return promos[0];
    } catch (error) {
      throw error;
    }
  }

  // Mettre à jour un code promo
  static async updatePromo(id, promoData) {
    try {
      await db.query(
        `UPDATE codes_promo SET 
          code = ?,
          pourcentage_reduction = ?,
          montant_reduction = ?,
          date_debut = ?,
          date_fin = ?,
          utilisations_max = ?,
          actif = ?
        WHERE id = ?`,
        [
          promoData.code.toUpperCase(),
          promoData.pourcentage_reduction || null,
          promoData.montant_reduction || null,
          promoData.date_debut,
          promoData.date_fin,
          promoData.utilisations_max || null,
          promoData.actif,
          id
        ]
      );
      return { success: true };
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new Error('Ce code promo existe déjà');
      }
      throw error;
    }
  }

  // Supprimer un code promo
  static async deletePromo(id) {
    try {
      // Vérifier si le code promo est utilisé dans des commandes
      const [orders] = await db.query(
        `SELECT COUNT(*) as count FROM commandes WHERE code_promo_id = ?`,
        [id]
      );

      if (orders[0].count > 0) {
        throw new Error('Ce code promo ne peut pas être supprimé car il est utilisé dans des commandes');
      }

      await db.query(`DELETE FROM codes_promo WHERE id = ?`, [id]);
      return { success: true };
    } catch (error) {
      throw error;
    }
  }

  // Activer/Désactiver un code promo
  static async toggleStatus(id) {
    try {
      await db.query(
        `UPDATE codes_promo SET actif = NOT actif WHERE id = ?`,
        [id]
      );
      return { success: true };
    } catch (error) {
      throw error;
    }
  }

  // Statistiques d'un code promo
  static async getPromoStats(id) {
    try {
      const [stats] = await db.query(`
        SELECT 
          cp.*,
          COUNT(c.id) as total_commandes,
          COALESCE(SUM(c.montant_reduction), 0) as total_reduction,
          COALESCE(SUM(c.total), 0) as total_ventes
        FROM codes_promo cp
        LEFT JOIN commandes c ON cp.id = c.code_promo_id
        WHERE cp.id = ?
        GROUP BY cp.id
      `, [id]);

      if (stats.length === 0) {
        throw new Error('Code promo non trouvé');
      }

      return stats[0];
    } catch (error) {
      throw error;
    }
  }
}

module.exports = PromoModel;