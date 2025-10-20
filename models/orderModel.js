// models/orderModel.js
const db = require('../config/database');

class OrderModel {
  // Créer une nouvelle commande
  static async createOrder(orderData) {
    const connection = await db.getConnection();
    
    try {
      await connection.beginTransaction();

      // 1. Insérer la commande principale
 const [orderResult] = await connection.query(
  `INSERT INTO commandes (
    user_id, nom_client, prenom_client, telephone, wilaya, commune, 
    adresse, type_livraison, frais_livraison, total, statut, code_promo_id, montant_reduction, date_commande
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?,?,?, ?, ?, NOW())`,
  [
    orderData.user_id || null,
    orderData.nom,
    orderData.prenom,
    orderData.telephone,
    orderData.wilaya,
    orderData.commune,
    orderData.adresse || null, // NULL si livraison bureau
    orderData.type_livraison || 'domicile',
    orderData.frais_livraison || 0,
    orderData.total,
    'en_attente', // correspond à la colonne "statut"
    orderData.code_promo_id || null,
    orderData.montant_reduction || 0
  ]
);


      const orderId = orderResult.insertId;

      // 2. Insérer les articles de la commande
      if (orderData.articles && orderData.articles.length > 0) {
        const articleValues = orderData.articles.map(article => [
          orderId,
          article.id,
          article.quantite,
          article.prix,
          article.couleur_id || null,
          article.taille || null
        ]);

        await connection.query(
          `INSERT INTO articles_commande 
          (commande_id, produit_id, quantite, prix_unitaire, couleur_id, taille) 
          VALUES ?`,
          [articleValues]
        );

        // 3. Réduire les stocks
       // 3. Réduire les stocks (nouveau système hybride)
for (let article of orderData.articles) {
  // Vérifier si le produit a des tailles
  const [tailles] = await connection.query(
    `SELECT taille FROM tailles_produit WHERE id_produit = ? LIMIT 1`,
    [article.id]
  );
  
  const hasTailles = tailles.length > 0;
  
  if (hasTailles && article.taille && article.couleur_id) {
    // CAS 1: Produit avec tailles → Déduire du stock spécifique (couleur + taille)
    const [stockResult] = await connection.query(
      `UPDATE stock_produits 
       SET quantite = quantite - ? 
       WHERE id_produit = ? AND id_couleur = ? AND taille = ?`,
      [article.quantite, article.id, article.couleur_id, article.taille]
    );
    
    if (stockResult.affectedRows === 0) {
      throw new Error(`Stock insuffisant pour le produit ${article.id} (${article.taille})`);
    }
  } else if (article.couleur_id) {
    // CAS 2: Produit sans tailles → Déduire du stock par couleur
    const [stockResult] = await connection.query(
      `UPDATE stock_produits 
       SET quantite = quantite - ? 
       WHERE id_produit = ? AND id_couleur = ? AND taille IS NULL`,
      [article.quantite, article.id, article.couleur_id]
    );
    
    if (stockResult.affectedRows === 0) {
      throw new Error(`Stock insuffisant pour le produit ${article.id}`);
    }
  } else {
    // CAS 3: Produit sans couleur ni taille (cas rare, ancien système)
    await connection.query(
      `UPDATE produits SET quantite = quantite - ? WHERE id = ?`,
      [article.quantite, article.id]
    );
  }
}
      }
      if (orderData.code_promo_id) {
        await connection.query(
        `UPDATE codes_promo SET utilisations_actuelles = utilisations_actuelles + 1 WHERE id = ?`,
         [orderData.code_promo_id]
     );
   }

      await connection.commit();
      return { success: true, orderId };

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // Récupérer toutes les commandes
  static async getAllOrders() {
    try {
      const [orders] = await db.query(`
        SELECT * FROM commandes 
        ORDER BY date_commande DESC
      `);

      // Récupérer les articles pour chaque commande
      for (let order of orders) {
        const [articles] = await db.query(`
          SELECT ac.*, p.titre,p.revenu, cp.couleur, cp.code_couleur
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

  // Récupérer une commande par ID
  static async getOrderById(id) {
    try {
      const [orders] = await db.query(
        `SELECT * FROM commandes WHERE id = ?`,
        [id]
      );

      if (orders.length === 0) {
        throw new Error('Commande non trouvée');
      }

      const order = orders[0];

      const [articles] = await db.query(`
        SELECT ac.*, p.titre,p.revenu, cp.couleur, cp.code_couleur,
               (SELECT url_image FROM images_produit 
                WHERE id_produit = p.id 
                ${order.couleur_id ? 'AND id_couleur = ac.couleur_id' : ''}
                LIMIT 1) as image
        FROM articles_commande ac
        JOIN produits p ON ac.produit_id = p.id
        LEFT JOIN couleurs_produit cp ON ac.couleur_id = cp.id
        WHERE ac.commande_id = ?
      `, [id]);

      order.articles = articles;
      return order;
    } catch (error) {
      throw error;
    }
  }

  // Mettre à jour le statut d'une commande
  static async updateOrderStatus(id, statut) {
    try {
      await db.query(
        `UPDATE commandes SET statut = ? WHERE id = ?`,
        [statut, id]
      );
      return { success: true };
    } catch (error) {
      throw error;
    }
  }


  // Vérifier et valider un code promo
static async verifyPromoCode(code) {
  try {
    const [results] = await db.query(
      `SELECT * FROM codes_promo 
       WHERE code = ? 
       AND actif = 1 
       AND date_debut <= CURDATE() 
       AND date_fin >= CURDATE()
       AND (utilisations_max IS NULL OR utilisations_actuelles < utilisations_max)`,
      [code.toUpperCase()]
    );

    if (results.length === 0) {
      return { valid: false, message: 'Code promo invalide ou expiré' };
    }

    return { valid: true, promo: results[0] };
  } catch (error) {
    throw error;
  }
}

// Calculer la réduction
static calculateDiscount(total, promo) {
  if (promo.pourcentage_reduction) {
    return (total * promo.pourcentage_reduction) / 100;
  }
  if (promo.montant_reduction) {
    return Math.min(promo.montant_reduction, total);
  }
  return 0;
}
// Récupérer les commandes d'un utilisateur spécifique
static async getOrdersByUserId(userId) {
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
}

module.exports = OrderModel;