const Favoris = require('../models/favorisModel');

exports.addFavori = async (req, res) => {
  try {
    const { produit_id } = req.body;
    const utilisateur_id = req.user.id;

    if (!produit_id) {
      return res.status(400).json({ 
        success: false, 
        message: 'ID produit requis' 
      });
    }

    const favoriId = await Favoris.add(utilisateur_id, produit_id);
    
    res.status(201).json({ 
      success: true, 
      message: 'Produit ajouté aux favoris',
      data: { id: favoriId }
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ 
        success: false, 
        message: 'Produit déjà dans les favoris' 
      });
    }
    console.error('Erreur ajout favori:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de l\'ajout aux favoris' 
    });
  }
};

exports.removeFavori = async (req, res) => {
  try {
    const { produit_id } = req.params;
    const utilisateur_id = req.user.id;

    await Favoris.remove(utilisateur_id, produit_id);
    
    res.json({ 
      success: true, 
      message: 'Produit retiré des favoris' 
    });
  } catch (error) {
    console.error('Erreur suppression favori:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la suppression' 
    });
  }
};

exports.getFavoris = async (req, res) => {
  try {
    const utilisateur_id = req.user.id;
    const favoris = await Favoris.findByUser(utilisateur_id);
    
    res.json({ success: true, data: favoris });
  } catch (error) {
    console.error('Erreur récupération favoris:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la récupération des favoris' 
    });
  }
};

exports.checkFavori = async (req, res) => {
  try {
    const { produit_id } = req.params;
    const utilisateur_id = req.user.id;

    const isFavorite = await Favoris.check(utilisateur_id, produit_id);
    
    res.json({ success: true, isFavorite });
  } catch (error) {
    console.error('Erreur vérification favori:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la vérification' 
    });
  }
};