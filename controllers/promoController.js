const PromoModel = require('../models/promoModel');
const OrderModel = require('../models/orderModel');

class PromoController {
  // Vérifier un code promo (pour les clients)
  static async verifyPromoCode(req, res) {
    try {
      const { code } = req.body;
      
      if (!code) {
        return res.status(400).json({ 
          valid: false, 
          message: 'Code promo requis' 
        });
      }

      const result = await OrderModel.verifyPromoCode(code);
      res.json(result);
    } catch (error) {
      console.error('Erreur vérification promo:', error);
      res.status(500).json({ 
        valid: false, 
        message: 'Erreur serveur' 
      });
    }
  }

  // Créer un code promo
  static async createPromo(req, res) {
    try {
      const result = await PromoModel.createPromo(req.body);
      res.status(201).json({
        success: true,
        message: 'Code promo créé avec succès',
        data: result
      });
    } catch (error) {
      console.error('Erreur création promo:', error);
      res.status(400).json({ 
        success: false,
        message: error.message 
      });
    }
  }

  // Récupérer tous les codes promo
  static async getAllPromos(req, res) {
    try {
      const promos = await PromoModel.getAllPromos();
      res.json({
        success: true,
        data: promos
      });
    } catch (error) {
      console.error('Erreur récupération promos:', error);
      res.status(500).json({ 
        success: false,
        message: 'Erreur lors de la récupération des codes promo' 
      });
    }
  }

  // Récupérer un code promo par ID
  static async getPromoById(req, res) {
    try {
      const promo = await PromoModel.getPromoById(req.params.id);
      res.json({
        success: true,
        data: promo
      });
    } catch (error) {
      console.error('Erreur récupération promo:', error);
      res.status(404).json({ 
        success: false,
        message: error.message 
      });
    }
  }

  // Mettre à jour un code promo
  static async updatePromo(req, res) {
    try {
      const result = await PromoModel.updatePromo(req.params.id, req.body);
      res.json({
        success: true,
        message: 'Code promo mis à jour avec succès',
        data: result
      });
    } catch (error) {
      console.error('Erreur mise à jour promo:', error);
      res.status(400).json({ 
        success: false,
        message: error.message 
      });
    }
  }

  // Supprimer un code promo
  static async deletePromo(req, res) {
    try {
      const result = await PromoModel.deletePromo(req.params.id);
      res.json({
        success: true,
        message: 'Code promo supprimé avec succès',
        data: result
      });
    } catch (error) {
      console.error('Erreur suppression promo:', error);
      res.status(400).json({ 
        success: false,
        message: error.message 
      });
    }
  }

  // Activer/Désactiver un code promo
  static async toggleStatus(req, res) {
    try {
      const result = await PromoModel.toggleStatus(req.params.id);
      res.json({
        success: true,
        message: 'Statut du code promo modifié',
        data: result
      });
    } catch (error) {
      console.error('Erreur changement statut:', error);
      res.status(500).json({ 
        success: false,
        message: 'Erreur lors du changement de statut' 
      });
    }
  }

  // Statistiques d'un code promo
  static async getPromoStats(req, res) {
    try {
      const stats = await PromoModel.getPromoStats(req.params.id);
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Erreur stats promo:', error);
      res.status(404).json({ 
        success: false,
        message: error.message 
      });
    }
  }
}

module.exports = PromoController;