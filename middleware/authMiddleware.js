const jwt = require('jsonwebtoken');
const UserModel = require('../models/userModel');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

exports.protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Non autorisé. Veuillez vous connecter.'
      });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      

      const user = await UserModel.findById(decoded.id);

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Utilisateur non trouvé.'
        });
      }

      req.user = user;
      next();
    } catch (error) {
      console.error('Erreur de vérification du token:', error.message);
      return res.status(401).json({
        success: false,
        message: 'Token invalide ou expiré.'
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de l\'authentification.'
    });
  }
};

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.type)) {
      return res.status(403).json({
        success: false,
        message: `Le rôle '${req.user.type}' n'est pas autorisé à accéder à cette ressource.`
      });
    }
    next();
  };
};

// Nouveau middleware : Autoriser l'utilisateur à modifier son propre profil
exports.isOwnerOrAdmin = (req, res, next) => {
  const userId = parseInt(req.params.id);
  const currentUserId = req.user.id;
  const userRole = req.user.type;

  if (userRole === 'admin' || userId === currentUserId) {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Vous n\'êtes pas autorisé à modifier ce profil.'
    });
  }
};