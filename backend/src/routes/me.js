const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.get('/', auth(true), async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
  return res.json(user.toSafeJSON());
});

// Atualiza dados do próprio perfil (nome, email, e/ou senha)
router.patch('/', auth(true), async (req, res) => {
  try {
    const { name, email, password } = req.body || {};

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });

    if (typeof name === 'string' && name.trim()) {
      user.name = name.trim();
    }

    if (typeof email === 'string' && email.trim()) {
      const newEmail = email.toLowerCase().trim();
      if (newEmail !== user.email) {
        const exists = await User.findOne({ email: newEmail });
        if (exists) {
          return res.status(409).json({ error: 'E-mail já cadastrado' });
        }
        user.email = newEmail;
      }
    }

    if (typeof password === 'string' && password.length) {
      if (password.length < 6) {
        return res.status(400).json({ error: 'Senha deve ter pelo menos 6 caracteres' });
      }
      user.passwordHash = await bcrypt.hash(password, 10);
    }

    await user.save();

    // Opcional: emitir novo token refletindo e-mail/role atuais
    const payload = { id: user._id, email: user.email, role: user.role, accessLevel: user.accessLevel };
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'changeme', { expiresIn: '7d' });

    return res.json({ token, user: user.toSafeJSON() });
  } catch (err) {
    // Tratamento para conflito de índice único (caso ocorra no save)
    if (err && err.code === 11000) {
      return res.status(409).json({ error: 'E-mail já cadastrado' });
    }
    console.error('Erro atualização de perfil:', err);
    return res.status(500).json({ error: 'Erro ao atualizar perfil' });
  }
});

// Exclui a própria conta (apenas níveis 1-6). SUPERADMIN (nível 7) é bloqueado.
router.delete('/', auth(true), async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
    if (user.role === 'SUPERADMIN' || user.accessLevel >= 7) {
      return res.status(403).json({ error: 'SUPERADMIN não pode excluir a própria conta' });
    }
    await User.deleteOne({ _id: user._id });
    return res.status(204).send();
  } catch (err) {
    console.error('Erro ao excluir conta:', err);
    return res.status(500).json({ error: 'Erro ao excluir conta' });
  }
});

module.exports = router;
