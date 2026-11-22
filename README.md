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
