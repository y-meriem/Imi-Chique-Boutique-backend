const UserModel = require('../models/userModel');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
// const nodemailer = require('nodemailer'); // Pour l'envoi d'emails

// Générer un token JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'your-secret-key', {
    expiresIn: '30d'
  });
};

// Inscription
exports.register = async (req, res) => {
  try {
    const { nom, prenom, email, telephone, password, type } = req.body;

    // Validation
    if (!nom || !prenom || !email ||!telephone || !password) {
      return res.status(400).json({
        success: false,
        message: 'Tous les champs sont requis'
      });
    }

    // Vérifier si l'email existe déjà
    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Cet email est déjà utilisé'
      });
    }

    // Vérifier si le username existe déjà
    

    // Créer l'utilisateur
    const result = await UserModel.createUser({
      nom,
      prenom,
      email,
      telephone,
      password,
      type: type || 'user'
    });

    // Générer le token
    const token = generateToken(result.id);

    res.status(201).json({
      success: true,
      message: 'Utilisateur créé avec succès',
      token,
      user: {
        id: result.id,
        nom,
        prenom,
        email,
        telephone,
        type: type || 'user'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'inscription',
      error: error.message
    });
  }
};

// Connexion
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email et mot de passe requis'
      });
    }

    // Trouver l'utilisateur
    const user = await UserModel.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      });
    }

    // Vérifier le mot de passe
    const isPasswordValid = await UserModel.verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      });
    }

    // Générer le token
    const token = generateToken(user.id);

    res.json({
      success: true,
      message: 'Connexion réussie',
      token,
      user: {
        id: user.id,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        telephone: user.telephone,
        type: user.type
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la connexion',
      error: error.message
    });
  }
};

// Demande de réinitialisation de mot de passe
// Générer un code à 6 chiffres
const generateCode = () => Math.floor(100000 + Math.random() * 900000).toString();

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    const user = await UserModel.findByEmail(email);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Email introuvable' });
    }

    const code = generateCode();
    const expiry = new Date(Date.now() + 10 * 60000); // 10 minutes

    await UserModel.saveResetToken(email, code, expiry);

    // Envoyer l'email
    const transporter = require('../config/emailConfig');
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Code de réinitialisation',
      html: `<h2>Votre code de vérification</h2>
             <p>Code : <strong>${code}</strong></p>
             <p>Valide pendant 10 minutes</p>`
    });

    res.json({ success: true, message: 'Code envoyé par email' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
exports.verifyResetCode = async (req, res) => {
  try {
    const { email, code } = req.body;
    
    const user = await UserModel.findByResetToken(code);
    
    if (!user || user.email !== email) {
      return res.status(400).json({ success: false, message: 'Code invalide ou expiré' });
    }

    res.json({ success: true, message: 'Code valide' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// Réinitialiser le mot de passe
exports.resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    const user = await UserModel.findByResetToken(code);
    if (!user || user.email !== email) {
      return res.status(400).json({ success: false, message: 'Code invalide' });
    }

    await UserModel.updatePassword(email, newPassword);
    await UserModel.clearResetToken(email);

    res.json({ success: true, message: 'Mot de passe modifié' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Obtenir tous les utilisateurs (Admin)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await UserModel.getAllUsers();
    
    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des utilisateurs',
      error: error.message
    });
  }
};

// Obtenir un utilisateur par ID
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await UserModel.findById(id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }
    
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de l\'utilisateur',
      error: error.message
    });
  }
};

// Mettre à jour un utilisateur
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { nom, prenom, email, telephone, type } = req.body;
    
    await UserModel.updateUser(id, { nom, prenom, email, telephone, email, type });
    
    res.json({
      success: true,
      message: 'Utilisateur mis à jour avec succès'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour',
      error: error.message
    });
  }
};

// Supprimer un utilisateur
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    await UserModel.deleteUser(id);
    
    res.json({
      success: true,
      message: 'Utilisateur supprimé avec succès'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression',
      error: error.message
    });
  }
};

// Obtenir le profil de l'utilisateur connecté
exports.getProfile = async (req, res) => {
  try {
    const user = await UserModel.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }
    
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du profil',
      error: error.message
    });
  }
};
// Déconnexion
exports.logout = async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Déconnexion réussie'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la déconnexion',
      error: error.message
    });
  }
};
// Mettre à jour le profil de l'utilisateur connecté
exports.updateProfile = async (req, res) => {
  try {
    const { nom, prenom, email, telephone } = req.body;
    
    // Validation basique
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Format d\'email invalide'
      });
    }

    if (telephone && !/^[0-9]{10}$/.test(telephone.replace(/\s/g, ''))) {
      return res.status(400).json({
        success: false,
        message: 'Format de téléphone invalide (10 chiffres requis)'
      });
    }
    
    await UserModel.updateUser(req.user.id, { nom, prenom, email, telephone });
    
    res.json({
      success: true,
      message: 'Profil mis à jour avec succès'
    });
  } catch (error) {
    // Gestion des erreurs spécifiques
    if (error.message.includes('email') || error.message.includes('téléphone')) {
      return res.status(409).json({
        success: false,
        message: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du profil',
      error: error.message
    });
  }
};

// Récupérer les commandes d'un utilisateur
exports.getUserOrders = async (req, res) => {
  try {
    const orders = await UserModel.getUserOrders(req.params.id);
    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Récupérer une commande spécifique d'un utilisateur
exports.getUserOrderById = async (req, res) => {
  try {
    const order = await UserModel.getUserOrderById(req.params.userId, req.params.orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Commande non trouvée' });
    }
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
