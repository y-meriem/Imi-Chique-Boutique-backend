// backend/models/categoryModel.js
const db = require('../config/database');

const Category = {
  getAll: async () => {
    try {
      const [rows] = await db.query('SELECT * FROM categories ORDER BY nom ASC');
      return rows;
    } catch (err) {
      console.error('❌ Erreur SQL getAll:', err);
      throw err;
    }
  },

  getById: async (id) => {
    try {
      const [rows] = await db.query('SELECT * FROM categories WHERE id = ?', [id]);
      return rows[0];
    } catch (err) {
      console.error('❌ Erreur SQL getById:', err);
      throw err;
    }
  },

  create: async (nom, image_url = null, cloudinary_id = null) => {
    try {
      const [result] = await db.query(
        'INSERT INTO categories (nom, image_url, cloudinary_id) VALUES (?, ?, ?)', 
        [nom, image_url, cloudinary_id]
      );
      return { id: result.insertId, nom, image_url, cloudinary_id };
    } catch (err) {
      console.error('❌ Erreur SQL create:', err);
      throw err;
    }
  },

  update: async (id, nom, image_url = null, cloudinary_id = null) => {
    try {
      let query = 'UPDATE categories SET nom = ?';
      const params = [nom];
      
      if (image_url !== null) {
        query += ', image_url = ?, cloudinary_id = ?';
        params.push(image_url, cloudinary_id);
      }
      
      query += ' WHERE id = ?';
      params.push(id);
      
      await db.query(query, params);
      return { id, nom, image_url, cloudinary_id };
    } catch (err) {
      console.error('❌ Erreur SQL update:', err);
      throw err;
    }
  },

  delete: async (id) => {
    try {
      const [result] = await db.query('DELETE FROM categories WHERE id = ?', [id]);
      return result;
    } catch (err) {
      console.error('❌ Erreur SQL delete:', err);
      throw err;
    }
  },

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
