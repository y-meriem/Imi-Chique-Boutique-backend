const LivraisonModel = require('../models/livraisonModel');

exports.getAllLivraisons = async (req, res) => {
  try {
    const livraisons = await LivraisonModel.getAllLivraisons();
    
    res.json({
      success: true,
      data: livraisons
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des livraisons',
      error: error.message
    });
  }
};

exports.getLivraisonByWilaya = async (req, res) => {
  try {
    const { wilaya } = req.params;
    
    const livraison = await LivraisonModel.getLivraisonByWilaya(wilaya);
    
    if (!livraison) {
      return res.status(404).json({
        success: false,
        message: 'Tarif de livraison non trouvé pour cette wilaya'
      });
    }
    
    res.json({
      success: true,
      data: livraison
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du tarif',
      error: error.message
    });
  }
};

exports.createLivraison = async (req, res) => {
  try {
    const { wilaya, prix_bureau, prix_domicile, delai_livraison } = req.body;
    
    if (!wilaya || prix_bureau === undefined || prix_domicile === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Données manquantes'
      });
    }
    
    const result = await LivraisonModel.createLivraison({
      wilaya,
      prix_bureau,
      prix_domicile,
      delai_livraison
    });
    
    res.status(201).json({
      success: true,
      message: 'Tarif de livraison créé avec succès',
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du tarif',
      error: error.message
    });
  }
};

exports.updateLivraison = async (req, res) => {
  try {
    const { id } = req.params;
    const { prix_bureau, prix_domicile, delai_livraison, actif } = req.body;
    
    await LivraisonModel.updateLivraison(id, {
      prix_bureau,
      prix_domicile,
      delai_livraison,
      actif: actif !== undefined ? actif : 1
    });
    
    res.json({
      success: true,
      message: 'Tarif mis à jour avec succès'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour',
      error: error.message
    });
  }
};

exports.deleteLivraison = async (req, res) => {
  try {
    const { id } = req.params;
    
    await LivraisonModel.deleteLivraison(id);
    
    res.json({
      success: true,
      message: 'Tarif supprimé avec succès'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression',
      error: error.message
    });
  }
};

