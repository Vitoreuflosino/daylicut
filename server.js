const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

const DB_FILE = path.join(__dirname, 'database.json');
const ADMIN_PASS = process.env.ADMIN_PASS || 'dailycut123';

if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify([], null, 2), 'utf-8');
}

const readDB = () => JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
const writeDB = (data) => fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const BREVO_SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL;
const BREVO_SENDER_NAME = process.env.BREVO_SENDER_NAME || 'DailyCut Barbearia';

// Apenas 'pendente' e 'confirmado' bloqueiam o horário; 'cancelado', 'concluido' e 'recusado' liberam
const STATUS_QUE_BLOQUEIAM = ['pendente', 'confirmado'];

app.get('/api/ocupados', (req, res) => {
    const { data } = req.query;
    const agendamentos = readDB();
    const ocupados = agendamentos
        .filter(a => a.data === data && STATUS_QUE_BLOQUEIAM.includes(a.status))
        .map(a => a.hora);
    res.json(ocupados);
});

app.post('/api/agendar', (req, res) => {
    const { nome, email, data, hora } = req.body;
    if (!nome || !email || !data || !hora) {
        return res.status(400).json({ erro: 'Preencha todos os campos.' });
    }

    const agendamentos = readDB();
    const conflito = agendamentos.find(
        a => a.data === data && a.hora === hora && STATUS_QUE_BLOQUEIAM.includes(a.status)
    );

    if (conflito) {
        return res.status(409).json({ erro: 'Horário já reservado ou aguardando aprovação.' });
    }

    const novo = {
        id: Date.now().toString(),
        nome,
        email,
        data,
        hora,
        status: 'pendente'
    };

    agendamentos.push(novo);
    writeDB(agendamentos);

    res.status(201).json({ mensagem: 'Solicitação enviada! Aguarde a confirmação por e-mail.' });
});

const authAdmin = (req, res, next) => {
    const token = req.headers['authorization'];
    if (token !== ADMIN_PASS) {
        return res.status(401).json({ erro: 'Acesso não autorizado.' });
    }
    next();
};

app.get('/api/admin/agendamentos', authAdmin, (req, res) => {
    const agendamentos = readDB();
    agendamentos.sort((a, b) => `${a.data} ${a.hora}`.localeCompare(`${b.data} ${b.hora}`));
    res.json(agendamentos);
});

async function enviarEmailStatus(cliente, status) {
    const dataFormatada = cliente.data.split('-').reverse().join('/');
    let assunto = '';
    let texto = '';

    if (status === 'confirmado') {
        assunto = `✅ Corte Confirmado - DailyCut (${dataFormatada} às ${cliente.hora})`;
        texto = `Olá, ${cliente.nome}!\n\nSeu horário na DailyCut foi CONFIRMADO para o dia ${dataFormatada} às ${cliente.hora}.\nTe esperamos lá!`;
    } else if (status === 'cancelado') {
        assunto = `⚠️ Horário Cancelado - DailyCut (${dataFormatada} às ${cliente.hora})`;
        texto = `Olá, ${cliente.nome}.\n\nInformamos que seu agendamento na DailyCut para o dia ${dataFormatada} às ${cliente.hora} foi CANCELADO.\nSe precisar, faça uma nova solicitação em nosso site.`;
    } else if (status === 'recusado') {
        assunto = `❌ Horário Indisponível - DailyCut`;
        texto = `Olá, ${cliente.nome}.\n\nInfelizmente não conseguimos confirmar seu horário para ${dataFormatada} às ${cliente.hora}. Por favor, escolha outro horário em nosso site.`;
    } else {
        return; // 'concluido' não dispara e-mail
    }

    if (!BREVO_API_KEY || !BREVO_SENDER_EMAIL) {
        console.warn('⚠️ BREVO_API_KEY ou BREVO_SENDER_EMAIL não configurados; e-mail não disparado.');
        return;
    }

    try {
        const resposta = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'api-key': BREVO_API_KEY,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                sender: {
                    name: BREVO_SENDER_NAME,
                    email: BREVO_SENDER_EMAIL
                },
                to: [
                    {
                        email: cliente.email,
                        name: cliente.nome
                    }
                ],
                subject: assunto,
                textContent: texto
            })
        });

        const dados = await resposta.json();
        if (!resposta.ok) {
            throw new Error(dados.message || `HTTP ${resposta.status}`);
        }

        console.log(`📧 E-mail (${status}) enviado para ${cliente.email} via Brevo (messageId: ${dados.messageId})`);
    } catch (err) {
        console.error('Erro ao enviar e-mail:', err.message);
    }
}

app.patch('/api/admin/agendamentos/:id', authAdmin, async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const permitidos = ['confirmado', 'concluido', 'cancelado', 'recusado'];
    if (!permitidos.includes(status)) {
        return res.status(400).json({ erro: 'Status inválido.' });
    }

    const agendamentos = readDB();
    const index = agendamentos.findIndex(a => a.id === id);

    if (index === -1) return res.status(404).json({ erro: 'Agendamento não encontrado.' });

    agendamentos[index].status = status;
    writeDB(agendamentos);

    const cliente = agendamentos[index];
    await enviarEmailStatus(cliente, status);

    res.json({ mensagem: `Status atualizado para ${status}.`, agendamento: cliente });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`💈 DailyCut a correr na porta ${PORT}`);
});
