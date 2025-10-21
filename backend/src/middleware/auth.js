const jwt = require('jsonwebtoken');
const User = require('../models/User');

function auth(required = true) {
  return async (req, res, next) => {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      if (required) return res.status(401).json({ error: 'Token ausente' });
      else return next();
    }

    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET || 'changeme');
      // Carregar usuário do banco para garantir papel/nível/ativo atuais
      const user = await User.findById(payload.id);
      if (!user) return res.status(401).json({ error: 'Usuário não encontrado' });
      if (!user.active) return res.status(403).json({ error: 'Perfil inativo' });
      req.user = {
        id: String(user._id),
        email: user.email,
        role: user.role,
        accessLevel: user.accessLevel,
        active: user.active,
      };
      next();
    } catch (err) {
      return res.status(401).json({ error: 'Token inválido' });
    }
  };
}

function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Não autenticado' });
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Acesso negado (papel insuficiente)' });
    }
    next();
  };
}

function requireAccessLevel(minLevel = 1) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Não autenticado' });
    if (typeof req.user.accessLevel !== 'number') {
      return res.status(403).json({ error: 'Acesso negado (nível ausente)' });
    }
    if (req.user.accessLevel < minLevel) {
      return res.status(403).json({ error: 'Acesso negado (nível insuficiente)' });
    }
    next();
  };
}

module.exports = { auth, requireRole, requireAccessLevel };