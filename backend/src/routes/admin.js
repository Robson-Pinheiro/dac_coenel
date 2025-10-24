const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/User');
const { auth, requireRole } = require('../middleware/auth');
const { roles, roleLevels } = require('../config');

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
  res.json({ roles, assignableRoles, roleLevels });
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
  // Blindar conta canônica do SUPERADMIN por e-mail configurado
  const superadminEmail = (process.env.SUPERADMIN_EMAIL || 'superadmin@admin.com').toLowerCase();
  if (String(target.email).toLowerCase() === superadminEmail) {
    return res.status(403).json({ error: 'Não é permitido alterar o SUPERADMIN' });
  }
  const isSelf = String(req.user.id) === String(id);
  // Bloquear qualquer alteração se o alvo for SUPERADMIN (inclusive auto-edição)
  if (target.role === 'SUPERADMIN') {
    return res.status(403).json({ error: 'Não é permitido alterar o SUPERADMIN' });
  }
  // Bloquear auto-edição de papel para qualquer usuário
  if (isSelf) {
    return res.status(403).json({ error: 'Não é permitido alterar o próprio papel' });
  }

  target.role = role;
  target.accessLevel = roleLevels[role] || target.accessLevel;
  await target.save();
  return res.json(target.toSafeJSON());
});

// PATCH /api/admin/users/:id - edita dados do usuário (nome, email, senha, ativo)
router.patch('/users/:id', auth(true), requireRole('SUPERADMIN'), async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ error: 'ID inválido' });
  }
  const { name, email, password, active } = req.body || {};

  const target = await User.findById(id);
  if (!target) return res.status(404).json({ error: 'Usuário não encontrado' });

  // Blindar conta canônica do SUPERADMIN e qualquer usuário com papel SUPERADMIN
  const superadminEmail = (process.env.SUPERADMIN_EMAIL || 'superadmin@admin.com').toLowerCase();
  if (String(target.email).toLowerCase() === superadminEmail || target.role === 'SUPERADMIN') {
    return res.status(403).json({ error: 'Não é permitido alterar o SUPERADMIN' });
  }
  // Bloquear auto-edição (o admin não pode editar a si mesmo aqui)
  if (String(req.user.id) === String(id)) {
    return res.status(403).json({ error: 'Não é permitido alterar o próprio perfil por aqui' });
  }

  // Atualizações permitidas
  if (typeof name === 'string' && name.trim()) target.name = name.trim();
  if (typeof email === 'string' && email.trim()) {
    const newEmail = email.toLowerCase().trim();
    if (newEmail !== target.email) {
      const exists = await User.findOne({ email: newEmail });
      if (exists) return res.status(409).json({ error: 'E-mail já cadastrado' });
      target.email = newEmail;
    }
  }
  if (typeof password === 'string' && password.length) {
    if (password.length < 6) return res.status(400).json({ error: 'Senha deve ter pelo menos 6 caracteres' });
    const bcrypt = require('bcryptjs');
    target.passwordHash = await bcrypt.hash(password, 10);
  }
  if (typeof active === 'boolean') {
    target.active = active;
  }

  await target.save();
  return res.json(target.toSafeJSON());
});

// DELETE /api/admin/users/:id - exclui usuário (não permite SUPERADMIN nem autoexclusão)
router.delete('/users/:id', auth(true), requireRole('SUPERADMIN'), async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ error: 'ID inválido' });
  }
  const target = await User.findById(id);
  if (!target) return res.status(404).json({ error: 'Usuário não encontrado' });
  const superadminEmail = (process.env.SUPERADMIN_EMAIL || 'superadmin@admin.com').toLowerCase();
  if (String(target.email).toLowerCase() === superadminEmail || target.role === 'SUPERADMIN') {
    return res.status(403).json({ error: 'Não é permitido excluir o SUPERADMIN' });
  }
  if (String(req.user.id) === String(id)) {
    return res.status(403).json({ error: 'Não é permitido excluir a própria conta por aqui' });
  }
  await User.deleteOne({ _id: target._id });
  return res.status(204).send();
});

module.exports = router;
