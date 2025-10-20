// backend/models/categoryModel.js
const db = require('../config/database');

const Category = {
  // Récupérer toutes les catégories
  getAll: async () => {
    try {
      const [rows] = await db.query('SELECT * FROM categories ORDER BY nom ASC');
      return rows;
    } catch (err) {
      console.error('❌ Erreur SQL getAll:', err);
      throw err;
    }
  },

  // Récupérer une catégorie par ID
  getById: async (id) => {
    try {
      const [rows] = await db.query('SELECT * FROM categories WHERE id = ?', [id]);
      return rows[0];
    } catch (err) {
      console.error('❌ Erreur SQL getById:', err);
      throw err;
    }
  },

  // Créer une nouvelle catégorie
  create: async (nom, image_url = null) => {
    try {
      const [result] = await db.query(
        'INSERT INTO categories (nom, image_url) VALUES (?, ?)', 
        [nom, image_url]
      );
      return { id: result.insertId, nom, image_url };
    } catch (err) {
      console.error('❌ Erreur SQL create:', err);
      throw err;
    }
  },

  // Mettre à jour une catégorie
  update: async (id, nom, image_url = null) => {
    try {
      let query = 'UPDATE categories SET nom = ?';
      const params = [nom];
      
      if (image_url !== null) {
        query += ', image_url = ?';
        params.push(image_url);
      }
      
      query += ' WHERE id = ?';
      params.push(id);
      
      await db.query(query, params);
      return { id, nom, image_url };
    } catch (err) {
      console.error('❌ Erreur SQL update:', err);
      throw err;
    }
  },

  // Supprimer une catégorie
  delete: async (id) => {
    try {
      const [result] = await db.query('DELETE FROM categories WHERE id = ?', [id]);
      return result;
    } catch (err) {
      console.error('❌ Erreur SQL delete:', err);
      throw err;
    }
  },

  // Vérifier si une catégorie existe par nom
  existsByName: async (nom, excludeId = null) => {
    try {
      let query = 'SELECT COUNT(*) as count FROM categories WHERE nom = ?';
      const params = [nom];
      
      if (excludeId) {
        query += ' AND id != ?';
        params.push(excludeId);
      }
      
      const [rows] = await db.query(query, params);
      return rows[0].count > 0;
    } catch (err) {
      console.error('❌ Erreur SQL existsByName:', err);
      throw err;
    }
  }
};

module.exports = Category;