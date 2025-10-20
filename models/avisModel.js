const db = require('../config/database');

class Avis {
  static async create(avisData) {
    const { utilisateur_id, produit_id, nom, email, note, commentaire } = avisData;
    
    const [result] = await db.query(
      `INSERT INTO avis (utilisateur_id, produit_id, nom, email, note, commentaire) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [utilisateur_id, produit_id, nom, email, note, commentaire]
    );
    
    return result.insertId;
  }

  static async findByProduct(produit_id) {
    const [rows] = await db.query(
      `SELECT * FROM avis 
       WHERE produit_id = ? AND statut = 'approuve' 
       ORDER BY date_creation DESC`,
      [produit_id]
    );
    return rows;
  }

  static async findAll() {
    const [rows] = await db.query(
      `SELECT a.*, p.titre as produit_titre 
       FROM avis a 
       LEFT JOIN produits p ON a.produit_id = p.id 
       ORDER BY a.date_creation DESC`
    );
    return rows;
  }

  static async updateStatut(id, statut) {
    await db.query(
      'UPDATE avis SET statut = ? WHERE id = ?',
      [statut, id]
    );
  }

  static async findGeneralAvis() {
    const [rows] = await db.query(
      `SELECT * FROM avis 
       WHERE produit_id IS NULL AND statut = 'approuve' 
       ORDER BY date_creation DESC`
    );
    return rows;
  }

  // NOUVELLE MÉTHODE : Trouver les avis de l'utilisateur connecté
  static async findByUserId(utilisateur_id) {
    const [rows] = await db.query(
      `SELECT a.*, p.titre as produit_titre 
       FROM avis a 
       LEFT JOIN produits p ON a.produit_id = p.id 
       WHERE a.utilisateur_id = ? 
       ORDER BY a.date_creation DESC`,
      [utilisateur_id]
    );
    return rows;
  }

  // NOUVELLE MÉTHODE : Trouver un avis par ID
  static async findById(id) {
    const [rows] = await db.query(
      `SELECT * FROM avis WHERE id = ?`,
      [id]
    );
    return rows.length > 0 ? rows[0] : null;
  }

  static async delete(id) {
    await db.query('DELETE FROM avis WHERE id = ?', [id]);
  }
}

module.exports = Avis;