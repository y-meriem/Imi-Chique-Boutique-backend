const Avis = require('../models/avisModel');

exports.createAvis = async (req, res) => {
  try {
    const { produit_id, nom, email, note, commentaire } = req.body;
    
    
    let utilisateur_id = null;
    let finalNom = nom || '';
    let finalEmail = email || '';
    
    // Si l'utilisateur est connecté, utiliser ses infos
    if (req.user && req.user.id) {
      utilisateur_id = req.user.id;
      finalNom = `${req.user.prenom} ${req.user.nom}`;
      finalEmail = req.user.email;
    } 

    // Validation
    if (!note || !commentaire) {
      return res.status(400).json({ 
        success: false, 
        message: 'Note et commentaire requis' 
      });
    }

    // Si pas connecté, vérifier nom et email
    if (!utilisateur_id && (!finalNom || !finalEmail)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Veuillez remplir votre nom et email' 
      });
    }

    const avisId = await Avis.create({
      utilisateur_id,
      produit_id: produit_id || null,
      nom: finalNom,
      email: finalEmail,
      note,
      commentaire
    });


    res.status(201).json({
      success: true,
      message: 'Merci pour votre avis! Il sera publié après vérification.',
      data: { id: avisId }
    });
  } catch (error) {
    console.error('❌ Erreur création avis:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la création de l\'avis' 
    });
  }
};

exports.getAvisByProduct = async (req, res) => {
  try {
    const { produit_id } = req.params;
    const avis = await Avis.findByProduct(produit_id);
    
    res.json({ success: true, data: avis });
  } catch (error) {
    console.error('Erreur récupération avis:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la récupération des avis' 
    });
  }
};

exports.getGeneralAvis = async (req, res) => {
  try {
    const avis = await Avis.findGeneralAvis();
    res.json({ success: true, data: avis });
  } catch (error) {
    console.error('Erreur récupération avis généraux:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la récupération des avis' 
    });
  }
};

exports.getAllAvis = async (req, res) => {
  try {
    const avis = await Avis.findAll();
    res.json({ success: true, data: avis });
  } catch (error) {
    console.error('Erreur récupération avis:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la récupération des avis' 
    });
  }
};

exports.updateStatutAvis = async (req, res) => {
  try {
    const { id } = req.params;
    const { statut } = req.body;

    if (!['en_attente', 'approuve', 'rejete'].includes(statut)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Statut invalide' 
      });
    }

    await Avis.updateStatut(id, statut);
    res.json({ 
      success: true, 
      message: 'Statut mis à jour' 
    });
  } catch (error) {
    console.error('Erreur mise à jour statut:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la mise à jour' 
    });
  }
};

exports.deleteAvis = async (req, res) => {
  try {
    const { id } = req.params;
    await Avis.delete(id);
    res.json({ success: true, message: 'Avis supprimé' });
  } catch (error) {
    console.error('Erreur suppression avis:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la suppression' 
    });
  }
};// Ajoute ces deux exports à ton avisController.js

exports.getMyAvis = async (req, res) => {
  try {
    const avis = await Avis.findByUserId(req.user.id);
    res.json({
      success: true,
      data: avis
    });
  } catch (error) {
    console.error('Erreur récupération avis utilisateur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de vos avis',
      error: error.message
    });
  }
};

exports.deleteMyAvis = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Vérifier que l'avis appartient à l'utilisateur connecté
    const avis = await Avis.findById(id);
    
    if (!avis) {
      return res.status(404).json({
        success: false,
        message: 'Avis non trouvé'
      });
    }
    
    if (avis.utilisateur_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Vous n\'êtes pas autorisé à supprimer cet avis'
      });
    }
    
    await Avis.delete(id);
    
    res.json({
      success: true,
      message: 'Avis supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur suppression avis:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression',
      error: error.message
    });
  }
};