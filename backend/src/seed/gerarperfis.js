require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/dacdb';

// Mapeamento determinístico de accessLevel -> role (1..6)
const accessToRole = {
  1: 'USUARIO',
  2: 'TECNICO_DE_MANUTENCAO',
  3: 'GESTOR_DE_ENERGIA',
  4: 'FINANCEIRO',
  5: 'SENSORES-MEDIDORES',
  6: 'SISTEMA_NOTIFICACAO',
};

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

(async () => {
  try {
    await mongoose.connect(MONGO_URI);

    // Preparar 300 usuários com níveis 1..6 distribuídos e ordem aleatória
    const base = [];
    for (let i = 1; i <= 8; i++) {
      const accessLevel = ((i - 1) % 6) + 1; // 1..6 de forma determinística
      const role = accessToRole[accessLevel];
      base.push({
        idx: i,
        name: `perfil-${i}`,
        email: `perfil-${i}@gmail.com`.toLowerCase(),
        role,
        accessLevel,
      });
    }
    shuffle(base);

    const passwordHash = await bcrypt.hash('123456', 10);

    let created = 0;
    let updated = 0;

    // Criar/atualizar de forma idempotente
    for (const u of base) {
      const existing = await User.findOne({ email: u.email });
      if (existing) {
        // Atualizar campos principais (sem nunca promover a SUPERADMIN)
        const sets = {
          name: u.name,
          role: u.role,
          accessLevel: u.accessLevel,
          active: true,
        };
        // Atualizar senha para o valor especificado pelo requisito
        sets.passwordHash = passwordHash;

        await User.updateOne({ _id: existing._id }, { $set: sets });
        updated++;
      } else {
        await User.create({
          name: u.name,
          email: u.email,
          passwordHash,
          role: u.role,
          accessLevel: u.accessLevel,
          active: true,
        });
        created++;
      }
    }

    console.log(`Seed gerarperfis concluída. Criados: ${created}, Atualizados: ${updated}`);
    process.exit(0);
  } catch (err) {
    console.error('Erro na seed gerarperfis:', err);
    process.exit(1);
  }
})();
