// models/productModel.js
const db = require('../config/database');
const fs = require('fs').promises;
const path = require('path');

class ProductModel {
  // Créer un produit avec toutes ses relations
 static async createProduct(productData) {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    // 1. Insérer le produit
    const [productResult] = await connection.query(
      `INSERT INTO produits (titre, description, revenu, prix, promo, categorie_id, statut) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        productData.titre,
        productData.description,
        productData.revenu,
        productData.prix,
        productData.promo || null,
        productData.categorie_id || null,
        productData.statut || 'actif'
      ]
    );

    const productId = productResult.insertId;

    // 2. Insérer les couleurs
    if (productData.couleurs && productData.couleurs.length > 0) {
      const couleurValues = productData.couleurs.map(c => [
        productId,
        c.couleur,
        c.code_couleur || null
      ]);
      
      await connection.query(
        `INSERT INTO couleurs_produit (id_produit, couleur, code_couleur) VALUES ?`,
        [couleurValues]
      );
    }

    // 3. Récupérer les IDs des couleurs pour les images
    const [couleurs] = await connection.query(
      `SELECT id, couleur FROM couleurs_produit WHERE id_produit = ?`,
      [productId]
    );

    // Créer une map normalisée (lowercase + trim)
    const couleurMap = {};
    couleurs.forEach(c => {
      couleurMap[c.couleur.toLowerCase().trim()] = c.id;
    });

    // 4. Insérer les images
    if (productData.images && productData.images.length > 0) {
      const imageValues = productData.images.map(img => [
        productId,
        img.couleur ? couleurMap[img.couleur.toLowerCase().trim()] : null,
        img.url_image,
        img.ordre || 0,
        img.est_principale || false
      ]);

      await connection.query(
        `INSERT INTO images_produit (id_produit, id_couleur, url_image, ordre, est_principale) 
         VALUES ?`,
        [imageValues]
      );
    }

    // 5. Insérer les tailles
    if (productData.tailles && productData.tailles.length > 0) {
      const tailleValues = productData.tailles.map(t => [productId, t]);
      
      await connection.query(
        `INSERT INTO tailles_produit (id_produit, taille) VALUES ?`,
        [tailleValues]
      );
    }
    // 6. Insérer le stock (hybride: par couleur OU par couleur+taille)
if (productData.couleurs && productData.couleurs.length > 0) {
  const stockValues = [];
  
  // Récupérer les IDs des couleurs fraîchement insérées
  const [couleursInserted] = await connection.query(
    `SELECT id, couleur FROM couleurs_produit WHERE id_produit = ?`,
    [productId]
  );
  
  const couleurIdMap = {};
  couleursInserted.forEach(c => {
    couleurIdMap[c.couleur.toLowerCase().trim()] = c.id;
  });

  // CAS 1: Produit SANS tailles → Stock par couleur uniquement
  if (!productData.tailles || productData.tailles.length === 0) {
    productData.couleurs.forEach(couleur => {
      const couleurId = couleurIdMap[couleur.couleur.toLowerCase().trim()];
      const quantite = couleur.quantite || 0; // Quantité vient du frontend
      
      if (couleurId) {
        stockValues.push([productId, couleurId, null, quantite]);
      }
    });
  } 
  // CAS 2: Produit AVEC tailles → Stock par combinaison (couleur + taille)
  else {
    productData.couleurs.forEach(couleur => {
      const couleurId = couleurIdMap[couleur.couleur.toLowerCase().trim()];
      
      if (couleurId) {
        productData.tailles.forEach(taille => {
          // Clé: "rouge_m", "bleu_l", etc.
          const stockKey = `${couleur.couleur.toLowerCase().trim()}_${taille.toLowerCase()}`;
          const quantite = productData.stock?.[stockKey] || 0;
          
          stockValues.push([productId, couleurId, taille, quantite]);
        });
      }
    });
  }

  // Insérer tout le stock
  if (stockValues.length > 0) {
    await connection.query(
      `INSERT INTO stock_produits (id_produit, id_couleur, taille, quantite) 
       VALUES ?`,
      [stockValues]
    );
  }
}
    await connection.commit();
    return { success: true, productId };

  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

  // Récupérer tous les produits avec leurs relations
  static async getAllProducts() {
    try {
      const [products] = await db.query(`
        SELECT p.*
        FROM produits p
        ORDER BY p.date_creation DESC
      `);

      // Récupérer les relations pour chaque produit
      for (let product of products) {
        // Couleurs
        const [couleurs] = await db.query(
          `SELECT id, couleur, code_couleur FROM couleurs_produit WHERE id_produit = ?`,
          [product.id]
        );
        product.couleurs = couleurs;

        // Images
        const [images] = await db.query(
          `SELECT ip.*, cp.couleur 
           FROM images_produit ip
           LEFT JOIN couleurs_produit cp ON ip.id_couleur = cp.id
           WHERE ip.id_produit = ?
           ORDER BY ip.est_principale DESC, ip.ordre ASC`,
          [product.id]
        );
        product.images = images;

        // Tailles
        const [tailles] = await db.query(
          `SELECT taille FROM tailles_produit WHERE id_produit = ?`,
          [product.id]
        );
        product.tailles = tailles.map(t => t.taille);
        const [stock] = await db.query(
  `SELECT id_couleur, taille, quantite FROM stock_produits WHERE id_produit = ?`,
  [product.id]
);
product.stock = stock;
      }

      return products;
    } catch (error) {
      throw error;
    }
  }

  // Récupérer un produit par ID avec toutes ses relations
  static async getProductById(id) {
    try {
      const [products] = await db.query(
        `SELECT * FROM produits WHERE id = ?`,
        [id]
      );

      if (products.length === 0) {
        throw new Error('Produit non trouvé');
      }

      const product = products[0];

      // Couleurs
      const [couleurs] = await db.query(
        `SELECT id, couleur, code_couleur FROM couleurs_produit WHERE id_produit = ?`,
        [id]
      );
      product.couleurs = couleurs;

      // Images
      const [images] = await db.query(
        `SELECT ip.*, cp.couleur 
         FROM images_produit ip
         LEFT JOIN couleurs_produit cp ON ip.id_couleur = cp.id
         WHERE ip.id_produit = ?
         ORDER BY ip.est_principale DESC, ip.ordre ASC`,
        [id]
      );
      product.images = images;

      // Tailles
      const [tailles] = await db.query(
        `SELECT taille FROM tailles_produit WHERE id_produit = ?`,
        [id]
      );
      product.tailles = tailles.map(t => t.taille);
      const [stock] = await db.query(
  `SELECT id_couleur, taille, quantite FROM stock_produits WHERE id_produit = ?`,
  [id]
);
product.stock = stock;

      return product;
    } catch (error) {
      throw error;
    }
  }

  // Mettre à jour un produit
static async updateProduct(id, productData) {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();
    // 1. Mettre à jour le produit
    await connection.query(
      `UPDATE produits 
       SET titre = ?, description = ?, revenu = ?, prix = ?, promo = ?, 
           categorie_id = ?, statut = ?, date_modification = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        productData.titre,
        productData.description,
        productData.revenu,
        productData.prix,
        productData.promo || null,
         productData.categorie_id || null,
        productData.statut,
        id
      ]
    );

    // 2. GESTION INTELLIGENTE DES COULEURS AVEC IDS
    const [couleursExistantes] = await connection.query(
      `SELECT id, couleur, code_couleur FROM couleurs_produit WHERE id_produit = ?`,
      [id]
    );


    // Map: ID couleur -> objet couleur
    const couleursExistantesById = {};
    couleursExistantes.forEach(c => {
      couleursExistantesById[c.id] = c;
    });

    // IDs reçus du frontend
    const idsRecus = productData.couleurs
      .filter(c => c.id)
      .map(c => c.id);


    // Couleurs à supprimer = celles en DB qui ne sont PAS dans idsRecus
    const idsToDelete = couleursExistantes
      .filter(c => !idsRecus.includes(c.id))
      .map(c => c.id);

    if (idsToDelete.length > 0) {
      await connection.query(
        `DELETE FROM couleurs_produit WHERE id IN (?)`,
        [idsToDelete]
      );
    }

    // Map finale: nom_couleur -> id_couleur
    const couleurMap = {};

    // Traiter chaque couleur reçue
    for (let couleur of productData.couleurs) {
      const key = couleur.couleur.toLowerCase().trim();
      
      if (couleur.id && couleursExistantesById[couleur.id]) {
        // UPDATE: La couleur existe avec cet ID
        
        await connection.query(
          `UPDATE couleurs_produit 
           SET couleur = ?, code_couleur = ?
           WHERE id = ?`,
          [
            couleur.couleur,
            couleur.code_couleur || null,
            couleur.id
          ]
        );
        
        couleurMap[key] = couleur.id;
        
      } else {
        // INSERT: Nouvelle couleur (pas d'ID ou ID inconnu)
        
        const [result] = await connection.query(
          `INSERT INTO couleurs_produit (id_produit, couleur, code_couleur) 
           VALUES (?, ?, ?)`,
          [id, couleur.couleur, couleur.code_couleur || null]
        );
        
        couleurMap[key] = result.insertId;
      }
    }

   

    // 5. Supprimer les images marquées pour suppression
    if (productData.imagesToDelete && productData.imagesToDelete.length > 0) {
      
      const [imagesToDelete] = await connection.query(
        `SELECT url_image FROM images_produit WHERE id IN (?)`,
        [productData.imagesToDelete]
      );

      for (let img of imagesToDelete) {
        try {
          const imagePath = path.join(__dirname, '..', img.url_image);
          await fs.unlink(imagePath);
        } catch (err) {
          console.error('❌ Erreur suppression fichier:', err);
        }
      }

      await connection.query(
        `DELETE FROM images_produit WHERE id IN (?)`,
        [productData.imagesToDelete]
      );
    }

    // 6. Mettre à jour les images existantes
    if (productData.existingImages && productData.existingImages.length > 0) {
      
      for (let img of productData.existingImages) {
        const couleurKey = img.couleur ? img.couleur.toLowerCase().trim() : null;
        const idCouleur = couleurKey && couleurMap[couleurKey] 
          ? couleurMap[couleurKey] 
          : null;


        await connection.query(
          `UPDATE images_produit 
           SET id_couleur = ?
           WHERE id = ?`,
          [idCouleur, img.id]
        );
        
      }
    }

    // 7. Insérer les nouvelles images
    if (productData.images && productData.images.length > 0) {
      
      const [countResult] = await connection.query(
        `SELECT COUNT(*) as count FROM images_produit WHERE id_produit = ?`,
        [id]
      );
      let startOrder = countResult[0].count;

      const imageValues = productData.images.map((img, index) => {
        const couleurKey = img.couleur ? img.couleur.toLowerCase().trim() : null;
        const idCouleur = couleurKey && couleurMap[couleurKey] 
          ? couleurMap[couleurKey] 
          : null;


        return [
          id,
          idCouleur,
          img.url_image,
          startOrder + index + 1,
          false
        ];
      });

      await connection.query(
        `INSERT INTO images_produit (id_produit, id_couleur, url_image, ordre, est_principale) 
         VALUES ?`,
        [imageValues]
      );
    }

    // 8. Supprimer les anciennes tailles
   if (productData.tailles && productData.tailles.length > 0) {

const [taillesExistantes] = await connection.query(
  `SELECT id, taille FROM tailles_produit WHERE id_produit = ?`,
  [id]
);



// Tailles à supprimer = celles en DB qui ne sont PAS dans productData.tailles
const taillesToDelete = taillesExistantes
  .filter(t => !productData.tailles.includes(t.taille))
  .map(t => t.id);

if (taillesToDelete.length > 0) {
  await connection.query(
    `DELETE FROM tailles_produit WHERE id IN (?)`,
    [taillesToDelete]
  );
}

// Tailles à ajouter = celles dans productData.tailles qui ne sont PAS en DB
const taillesExistantesNoms = taillesExistantes.map(t => t.taille);
const taillesToAdd = productData.tailles.filter(t => !taillesExistantesNoms.includes(t));

if (taillesToAdd.length > 0) {
  const tailleValues = taillesToAdd.map(t => [id, t]);
  
  await connection.query(
    `INSERT INTO tailles_produit (id_produit, taille) VALUES ?`,
    [tailleValues]
  );
}

   
}else {
  // ✅ Aucune taille fournie = supprimer toutes les tailles existantes
  await connection.query(
    `DELETE FROM tailles_produit WHERE id_produit = ?`,
    [id]
  );
}
// 9. GESTION DU STOCK (Hybride intelligent)

// Supprimer tout l'ancien stock
await connection.query(
  `DELETE FROM stock_produits WHERE id_produit = ?`,
  [id]
);

// Insérer le nouveau stock
if (productData.couleurs && productData.couleurs.length > 0) {
  const stockValues = [];
  
  // CAS 1: Produit SANS tailles → Stock par couleur uniquement
  if (!productData.tailles || productData.tailles.length === 0) {
    
    productData.couleurs.forEach((couleur, index) => {
      const couleurId = couleurMap[couleur.couleur.toLowerCase().trim()];
      const quantite = productData.stock?.[`couleur_${index}`] || 0;
      
      if (couleurId) {
        stockValues.push([id, couleurId, null, quantite]);
      }
    });
  } 
  // CAS 2: Produit AVEC tailles → Stock par combinaison (couleur + taille)
  else {
    
    productData.couleurs.forEach((couleur) => {
      const couleurId = couleurMap[couleur.couleur.toLowerCase().trim()];
      
      if (couleurId) {
        productData.tailles.forEach(taille => {
          const stockKey = `${couleur.couleur.toLowerCase().trim()}_${taille.toLowerCase()}`;
          const quantite = productData.stock?.[stockKey] || 0;
          
          stockValues.push([id, couleurId, taille, quantite]);
        });
      }
    });
  }

  // Insérer tout le stock
  if (stockValues.length > 0) {
    await connection.query(
      `INSERT INTO stock_produits (id_produit, id_couleur, taille, quantite) 
       VALUES ?`,
      [stockValues]
    );
  }
}
    await connection.commit();

    
    return { success: true, productId: id };

  } catch (error) {
    await connection.rollback();
    console.error('❌ === ERREUR UPDATE ===');
    console.error('❌ Message:', error.message);
    console.error('❌ Stack:', error.stack);
    throw error;
  } finally {
    connection.release();
  }
}

  // Supprimer un produit
  static async deleteProduct(id) {
    const connection = await db.getConnection();
    
    try {
      await connection.beginTransaction();

      // 1. Récupérer les images pour les supprimer du système de fichiers
      const [images] = await connection.query(
        `SELECT url_image FROM images_produit WHERE id_produit = ?`,
        [id]
      );

      // Supprimer les fichiers physiques
      for (let img of images) {
        try {
          const imagePath = path.join(__dirname, '..', img.url_image);
          await fs.unlink(imagePath);
        } catch (err) {
          console.error('Erreur suppression fichier:', err);
        }
      }

      // 2. Supprimer les images de la base de données
      await connection.query(
        `DELETE FROM images_produit WHERE id_produit = ?`,
        [id]
      );

      // 3. Supprimer les couleurs
      await connection.query(
        `DELETE FROM couleurs_produit WHERE id_produit = ?`,
        [id]
      );

      // 4. Supprimer les tailles
      await connection.query(
        `DELETE FROM tailles_produit WHERE id_produit = ?`,
        [id]
      );

      // 5. Supprimer le produit
      await connection.query(
        `DELETE FROM produits WHERE id = ?`,
        [id]
      );

      await connection.commit();
      return { success: true };

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}

module.exports = ProductModel;
