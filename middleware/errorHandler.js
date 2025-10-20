const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log l'erreur en console pour le développement
  if (process.env.NODE_ENV === 'development') {
    console.error(err);
  }

  // Erreur de duplication MySQL
  if (err.code === 'ER_DUP_ENTRY') {
    const message = 'Cette ressource existe déjà';
    error = { statusCode: 400, message };
  }

  // Erreur de validation MySQL
  if (err.code === 'ER_NO_REFERENCED_ROW_2' || err.code === 'ER_NO_DEFAULT_FOR_FIELD') {
    const message = 'Données invalides';
    error = { statusCode: 400, message };
  }

  // Erreur JWT invalide
  if (err.name === 'JsonWebTokenError') {
    const message = 'Token invalide';
    error = { statusCode: 401, message };
  }

  // Token JWT expiré
  if (err.name === 'TokenExpiredError') {
    const message = 'Token expiré';
    error = { statusCode: 401, message };
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Erreur serveur',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;