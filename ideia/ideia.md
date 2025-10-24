## IDEIA
Quero um sistema backend node.js + frontend react + bootstrap + mongo + mongo_express para acesso web + nginx controlando toda rotação, tudo isso containerizado com docker

Vamos começar com uma tela de login onde também permita criação de conta.
o usuario ao se cadastrar, o perfil está ativo e ele pode efetuar login
a permissão de acesso dele no site é 0, onde ele não tem acesso a nada do site a não ser as informações do proprio perfil



## REGRAS

perfil de super admin
usuario: superadmin@admin.com
senha: superadmin123

senha do mongo para controle do mongo_express ao mongo
senha: superadmin123

senha do banco de dados mongo_express
usuario: superadmin@admin.com
senha: superadmin123


## PORTAS
frontend: 5000
backend: 5001
mongo: porta padrão
mongo_express: 5002
nginx: 5003
e demais portas 5004 até 5020

## CORES


## CASOS DE USO
Casos de Uso (Essenciais)
Cadastrar Medidores/Unidades/Setores – dados do ponto de medição, demanda
contratada, tensão, horário de ponta/fora-ponta.
Ingerir Leituras – automática (IoT/API) ou manual; granularidade 15min/hora/dia.
Registrar Faturas e Tarifas – bandeiras, tributos, demanda, encargos.
Visualizar Consumo e Custo – dashboards por período, unidade, ponta/fora-ponta,
W/kWh/R$.
Detectar Desvios/Anomalias – alerta por limiar, baseline, sazonalidade (no-show, picos
noturnos).
Comparar vs. Metas – metas de consumo/custo/emissões (tCO₂e) por unidade.
Planejar Ações de Eficiência – lista de medidas (troca de iluminação, automação,
setpoints), custo, ROI, payback, responsável e prazo.
Executar e Acompanhar Ações – status, evidências, medição e verificação (M&V) de
economia.
Simular Cenários – tarifa horária, redução de demanda, curva de carga (antes/depois).
Relatórios e Exportações – consumo, custo, fator de carga, economias obtidas, ranking
de unidades; exportar CSV/PDF.
Notificações – pico de demanda, consumo atípico, fatura acima do esperado, meta não
atingida.


## PERFIS
SUPERDMIN: pode controlar todo sistema, gerenciar perfis e modificar os cargos dos usuarios (criado apenas por SEED)

Gestor de Energia: configura metas, analisa consumo/custos, valida ações.
Técnico de Manutenção: executa ações (ajustes, retrofit, manutenção).
Usuário Local/Setor: consulta consumo do seu setor/unidade.
Financeiro: acompanha custos, faturas e economias.
Sensores/Medidores: enviam leituras (IoT/AMI).
Sistema de Notificações: alerta desvios e oportunidades.


## NIVEL DE ACESSO 
1 USUARIO LOCAL/SETOR 
2 TECNICO DE MANUTENÇÃO 
3 GESTOR DE ENERGIA 
4 FINANCEIRO 
5 SENSORES/MEDIDORES
6 SISTEMA DE NOTIFAÇÕES 
7 SUPERADMIN