[readme.md.md](https://github.com/user-attachments/files/35235354/readme.md.md)# 💈 DailyCut — Sistema de Agendamento para Barbearia

Sistema web full-stack para agendamento de horários em barbearia, com verificação de disponibilidade em tempo real, painel administrativo protegido por senha e notificações automáticas por e-mail.

---

## 🚀 Funcionalidades Principais

- **Agendamento Online (Cliente):**
  - Escolha de data e visualização dinâmica dos horários disponíveis.
  - Bloqueio automático de horários com status `pendente` ou `confirmado` para evitar conflitos.
  - Liberação imediata de horários quando um agendamento é `cancelado`, `concluido` ou `recusado`.

- **Painel Administrativo (`/admin.html`):**
  - Autenticação via senha administrativa (`ADMIN_PASS`).
  - Listagem ordenada de todos os agendamentos por data e horário.
  - Atualização rápida de status (`confirmado`, `concluido`, `cancelado`, `recusado`).

- **Notificações Transacionais por E-mail (Brevo API):**
  - Disparo automático de e-mail ao cliente sempre que o administrador **confirma**, **cancela** ou **recusa** um horário.
  - Comunicação via API REST HTTPS (porta `443`), garantindo compatibilidade com hospedagens em nuvem que bloqueiam portas SMTP.

---

## 🛠️ Tecnologias Utilizadas

- **Back-end:** Node.js + Express
- **Front-end:** HTML, CSS e JavaScript puro (servidos via pasta estática `public/`)
- **E-mail Transacional:** API REST do Brevo (`https://api.brevo.com/v3/smtp/email`)
- **Persistência Atual:** Arquivo JSON local (`database.json`)
- **Hospedagem:** Render

---

## 📁 Estrutura do Projeto

```text
dailycut/
├── public/              # Arquivos estáticos do front-end (página do cliente e admin.html)
├── server.js            # Servidor Express, rotas da API e integração com Brevo
├── database.json        # Armazenamento local dos agendamentos (gerado automaticamente)
├── package.json         # Dependências e scripts de inicialização
└── README.md            # Documentação do projeto
```

---

## ⚙️ Variáveis de Ambiente

Configure as variáveis abaixo no painel do Render (**Environment**) ou em um arquivo `.env` local:

| Variável | Descrição | Exemplo |
| :--- | :--- | :--- |
| `PORT` | Porta em que o servidor irá escutar (definida automaticamente pelo Render) | `3000` |
| `ADMIN_PASS` | Senha de acesso às rotas e ao painel administrativo | `dailycut123` |
| `BREVO_API_KEY` | Chave de API REST do Brevo (iniciada por `xkeysib-...`) | `xkeysib-xxxxxxxx` |
| `BREVO_SENDER_EMAIL` | E-mail remetente validado na aba *Senders* do Brevo | `contato@seudominio.com` |
| `BREVO_SENDER_NAME` | Nome exibido como remetente nos e-mails enviados | `DailyCut Barbearia` |

---

## ▶️ Como Executar Localmente

1. **Instale as dependências:**
   ```bash
   npm install
   ```

2. **Configure as variáveis de ambiente** no seu terminal (ou diretamente no sistema):
   ```bash
   export ADMIN_PASS="dailycut123"
   export BREVO_API_KEY="sua-chave-xkeysib"
   export BREVO_SENDER_EMAIL="seu-email-validado@gmail.com"
   ```

3. **Inicie o servidor:**
   ```bash
   node server.js
   ```

4. **Acesse no navegador:**
   - **Página de Agendamento:** `http://localhost:3000`
   - **Painel Administrativo:** `http://localhost:3000/admin.html`

---

## 🔌 Principais Rotas da API

| Método | Rota | Acesso | Descrição |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/ocupados?data=YYYY-MM-DD` | Público | Retorna os horários já bloqueados para a data informada |
| `POST` | `/api/agendar` | Público | Cria uma nova solicitação de agendamento com status `pendente` |
| `GET` | `/api/admin/agendamentos` | Admin (`Authorization`) | Lista todos os agendamentos ordenados cronologicamente |
| `PATCH` | `/api/admin/agendamentos/:id` | Admin (`Authorization`) | Atualiza o status do agendamento e dispara o e-mail correspondente |

---

## ⚠️ Observações Importantes e Próximos Passos

- **Armazenamento Efêmero no Render:** Atualmente os dados são gravados em `database.json`. Em hospedagens com disco efêmero, esse arquivo pode ser reiniciado durante novos *deploys* ou reinicializações do servidor.
- **Evolução Recomendada:** Migrar a persistência de `database.json` para um banco de dados externo (como **Supabase / PostgreSQL**) para garantir histórico permanente e visualização tabular dos agendamentos.
