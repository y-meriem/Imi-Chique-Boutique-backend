const db = require('../config/database');
const bcrypt = require('bcryptjs');

class UserModel {
  // Créer un utilisateur
  static async createUser(data) {
    try {
      const hashedPassword = await bcrypt.hash(data.password, 10);
      
      const [result] = await db.query(
        `INSERT INTO users (nom, prenom, email, telephone, password, type) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [data.nom, data.prenom, data.email, data.telephone, hashedPassword, data.type || 'user']
      );
      
      return { success: true, id: result.insertId };
    } catch (error) {
      throw error;
    }
  }

  // Trouver un utilisateur par email
  static async findByEmail(email) {
    try {
      const [rows] = await db.query(
        `SELECT * FROM users WHERE email = ?`,
        [email]
      );
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      throw error;
    }
  }
// Trouver un utilisateur par téléphone
static async findByTelephone(telephone) {
  try {
    const [rows] = await db.query(
      `SELECT * FROM users WHERE telephone = ?`,
      [telephone]
    );
    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    throw error;
  }
}
  // Trouver un utilisateur 
  static async findBynom(nom) {
    try {
      const [rows] = await db.query(
        `SELECT * FROM users WHERE nom = ?`,
        [nom]
      );
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      throw error;
    }
  }
  static async findByprenom(prenom) {
    try {
      const [rows] = await db.query(
        `SELECT * FROM users WHERE prenom = ?`,
        [prenom]
      );
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      throw error;
    }
  }

  // Trouver un utilisateur par ID
  static async findById(id) {
    try {
      const [rows] = await db.query(
        `SELECT id, nom, prenom, email, telephone, type, created_at FROM users WHERE id = ?`,
        [id]
      );
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      throw error;
    }
  }

  // Récupérer tous les utilisateurs
  static async getAllUsers() {
    try {
      const [rows] = await db.query(
        `SELECT id, nom, prenom, email, telephone, type, created_at FROM users ORDER BY created_at DESC`      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Mettre à jour le mot de passe
  static async updatePassword(email, newPassword) {
    try {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      await db.query(
        `UPDATE users SET password = ? WHERE email = ?`,
        [hashedPassword, email]
      );
      
      return { success: true };
    } catch (error) {
      throw error;
    }
  }

  // Mettre à jour un utilisateur
  static async updateUser(id, data) {
    try {
      const updates = [];
      const values = [];

      if (data.nom) {
        updates.push('nom = ?');
        values.push(data.nom);
      }
      if (data.prenom) {
        updates.push('prenom = ?');
        values.push(data.prenom);
      }
      if (data.email) {
        updates.push('email = ?');
        values.push(data.email);
      }
      if (data.telephone) {
        updates.push('telephone = ?');
        values.push(data.telephone);
      }
      if (data.type) {
        updates.push('type = ?');
        values.push(data.type);
      }

      values.push(id);

      await db.query(
        `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
        values
      );
      
      return { success: true };
    } catch (error) {
      throw error;
    }
  }

  // Supprimer un utilisateur
  static async deleteUser(id) {
    try {
      await db.query(`DELETE FROM users WHERE id = ?`, [id]);
      return { success: true };
    } catch (error) {
      throw error;
    }
  }

  // Vérifier le mot de passe
  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  // Sauvegarder le token de réinitialisation
  static async saveResetToken(email, token, expiry) {
    try {
      await db.query(
        `UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE email = ?`,
        [token, expiry, email]
      );
      return { success: true };
    } catch (error) {
      throw error;
    }
  }

  // Trouver par token de réinitialisation
  static async findByResetToken(token) {
    try {
      const [rows] = await db.query(
        `SELECT * FROM users WHERE reset_token = ? AND reset_token_expiry > NOW()`,
        [token]
      );
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      throw error;
    }
  }

  // Effacer le token de réinitialisation
  static async clearResetToken(email) {
    try {
      await db.query(
        `UPDATE users SET reset_token = NULL, reset_token_expiry = NULL WHERE email = ?`,
        [email]
      );
      return { success: true };
    } catch (error) {
      throw error;
    }
  }
  // À ajouter dans la classe UserModel, avant le module.exports

static async getUserOrders(userId) {
  try {
    const [orders] = await db.query(`
      SELECT * FROM commandes 
      WHERE user_id = ?
      ORDER BY date_commande DESC
    `, [userId]);

    // Récupérer les articles pour chaque commande
    for (let order of orders) {
      const [articles] = await db.query(`
        SELECT ac.*, p.titre, cp.couleur, cp.code_couleur,
               (SELECT url_image FROM images_produit 
                WHERE id_produit = p.id 
                ${order.couleur_id ? 'AND id_couleur = ac.couleur_id' : ''}
                LIMIT 1) as image
        FROM articles_commande ac
        JOIN produits p ON ac.produit_id = p.id
        LEFT JOIN couleurs_produit cp ON ac.couleur_id = cp.id
        WHERE ac.commande_id = ?
      `, [order.id]);
      
      order.articles = articles;
    }

    return orders;
  } catch (error) {
    throw error;
  }
}

static async getUserOrders(userId) {
  try {
    const [orders] = await db.query(`
      SELECT * FROM commandes 
      WHERE user_id = ?
      ORDER BY date_commande DESC
    `, [userId]);

    // Récupérer les articles pour chaque commande
    for (let order of orders) {
      const [articles] = await db.query(`
        SELECT 
          ac.*, 
          p.titre, 
          cp.couleur, 
          cp.code_couleur,
          COALESCE(
            (SELECT url_image FROM images_produit 
             WHERE id_produit = p.id AND id_couleur = ac.couleur_id 
             LIMIT 1),
            (SELECT url_image FROM images_produit 
             WHERE id_produit = p.id 
             LIMIT 1)
          ) as image
        FROM articles_commande ac
        JOIN produits p ON ac.produit_id = p.id
        LEFT JOIN couleurs_produit cp ON ac.couleur_id = cp.id
        WHERE ac.commande_id = ?
      `, [order.id]);
      
      order.articles = articles;
    }

    return orders;
  } catch (error) {
    throw error;
  }
}
}

module.exports = UserModel;