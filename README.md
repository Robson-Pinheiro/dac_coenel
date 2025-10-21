# DAC COENEL - Stack Dockerizada (Node.js + React + MongoDB + Nginx)

Este projeto provisiona um backend Node.js/Express, um frontend React (Vite) com Bootstrap, MongoDB, Mongo Express e Nginx como proxy reverso — tudo via Docker Compose.

## Portas
- Frontend: 5000 (servido por Nginx do próprio container do frontend)
- Backend: 5001
- MongoDB: 27017 (padrão)
- Mongo Express: 5002
- Nginx (gateway): 5003
- Reservadas: 5004 a 5020

## Perfis (roles)
- SUPERADMIN
- GESTOR_DE_ENERGIA
- TECNICO_DE_MANUTENCAO
- USUARIO
- FINANCEIRO
- SENSORES-MEDIDORES
- SISTEMA_NOTIFICACAO

Usuários recém-cadastrados têm `accessLevel=0` e podem acessar apenas o próprio perfil.

Seed do SUPERADMIN (executado manualmente apenas uma vez):
- SUPERADMIN: `superadmin@admin.com` / `superadmin123`

Mongo Express:
- BasicAuth: `superadmin@admin.com` / `superadmin123`
- Conecta no Mongo com usuário root (senha `superadmin123`)

## Subir o projeto (PowerShell)

1. Crie o arquivo `.env` a partir do template:

```powershell
Copy-Item .env.example .env
```

2. Suba os serviços:

```powershell
docker compose up --build -d
```

3. Execute a seed do SUPERADMIN (uma vez):
```powershell
docker compose run --rm backend npm run seed:superadmin
```

4. Acesse:
- App (via Nginx gateway): http://localhost:5003/
- API (via Nginx gateway): http://localhost:5003/api
- Mongo Express: http://localhost:5003/mongo-express

Endpoints úteis:
- POST http://localhost:5003/api/auth/register
- POST http://localhost:5003/api/auth/login
- GET http://localhost:5003/api/me (autenticado via Bearer Token)

## Desenvolvimento

- Alterações no frontend exigem rebuild para refletir no container (o container serve build estático). Em desenvolvimento local, você pode rodar o Vite fora do Docker se preferir.

## Estrutura
```
backend/
frontend/
nginx/
```

## Notas
- O Nginx (porta 5003) faz o roteamento para o frontend (5000), backend (5001) e Mongo Express (5002).
- O MongoDB usa credenciais definidas em `.env`.
- O backend não faz mais seed automaticamente; use o comando de seed acima.

## Autorização por papel/nível
- Middleware disponível em `backend/src/middleware/auth.js`:
		- `auth(required=true)` — valida JWT.
		- `requireRole(...roles)` — restringe por papel (ex.: SUPERADMIN).
		- `requireAccessLevel(min)` — restringe por nível numérico (ex.: >= 10).
		- O JWT inclui `id`, `email`, `role` e `accessLevel`.
