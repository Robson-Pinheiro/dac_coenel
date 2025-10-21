const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/User');
const { auth, requireRole } = require('../middleware/auth');
const { roles } = require('../config');

const router = express.Router();

// GET /api/admin/users - lista todos os usuários (apenas SUPERADMIN)
router.get('/users', auth(true), requireRole('SUPERADMIN'), async (_req, res) => {
  const users = await User.find({}, 'name email role accessLevel active createdAt updatedAt').sort({ createdAt: -1 });
  res.json(users.map(u => ({
    id: u._id,
    name: u.name,
    email: u.email,
    role: u.role,
    accessLevel: u.accessLevel,
    active: u.active,
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
  })));
});

// GET /api/admin/roles - lista papéis válidos (apenas SUPERADMIN)
router.get('/roles', auth(true), requireRole('SUPERADMIN'), (_req, res) => {
  const assignableRoles = roles.filter(r => r !== 'SUPERADMIN');
  res.json({ roles, assignableRoles });
});

// PATCH /api/admin/users/:id/role - altera papel do usuário (apenas SUPERADMIN)
router.patch('/users/:id/role', auth(true), requireRole('SUPERADMIN'), async (req, res) => {
  const { id } = req.params;
  const { role } = req.body || {};
  if (!role || !roles.includes(role)) {
    return res.status(400).json({ error: 'Papel inválido' });
  }
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ error: 'ID inválido' });
  }
  // Regras de segurança:
  // 1) Não permitir atribuir SUPERADMIN via API (seed controla superadmin)
  if (role === 'SUPERADMIN') {
    return res.status(403).json({ error: 'Não é permitido atribuir SUPERADMIN via API' });
  }
  // 2) Não permitir alterar usuários que já são SUPERADMIN
  const target = await User.findById(id);
  if (!target) return res.status(404).json({ error: 'Usuário não encontrado' });
  if (target.role === 'SUPERADMIN') {
    return res.status(403).json({ error: 'Não é permitido alterar o SUPERADMIN' });
  }
  // 3) (Opcional) Não permitir que o próprio usuário altere o próprio papel
  if (String(req.user.id) === String(id)) {
    return res.status(403).json({ error: 'Não é permitido alterar o próprio papel' });
  }
  target.role = role;
  await target.save();
  return res.json(target.toSafeJSON());
});

module.exports = router;
