require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/dacdb';
const email = (process.env.SUPERADMIN_EMAIL || 'superadmin@admin.com').toLowerCase();
const password = process.env.SUPERADMIN_PASSWORD || 'superadmin123';

(async () => {
  try {
    await mongoose.connect(MONGO_URI);
    const existing = await User.findOne({ email });
    if (existing) {
      // Garantir que o SUPERADMIN tenha o papel e parâmetros corretos
      const updates = {};
      if (existing.role !== 'SUPERADMIN') updates.role = 'SUPERADMIN';
      if (existing.accessLevel < 100) updates.accessLevel = 100;
      if (!existing.active) updates.active = true;
      // Opcional: atualizar senha se SUPERADMIN_PASSWORD mudar
      if (password && password.length >= 6) {
        const ok = await bcrypt.compare(password, existing.passwordHash).catch(() => false);
        if (!ok) {
          updates.passwordHash = await bcrypt.hash(password, 10);
        }
      }
      if (Object.keys(updates).length > 0) {
        await User.updateOne({ _id: existing._id }, { $set: updates });
        console.log('SUPERADMIN atualizado para configuração esperada:', email);
      } else {
        console.log('SUPERADMIN já existe e está consistente:', email);
      }
      process.exit(0);
    } else {
      const passwordHash = await bcrypt.hash(password, 10);
      await User.create({
        name: 'Super Admin',
        email,
        passwordHash,
        role: 'SUPERADMIN',
        accessLevel: 100,
        active: true,
      });
      console.log('SUPERADMIN criado:', email);
      process.exit(0);
    }
  } catch (err) {
    console.error('Erro seed SUPERADMIN:', err);
    process.exit(1);
  }
})();
