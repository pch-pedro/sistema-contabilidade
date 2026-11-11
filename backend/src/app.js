const express = require('express');
const cors = require('cors');
const db = require('./config/db');
const empresaRoutes = require('./routes/empresaRoutes');
const planoContasRoutes = require('./routes/planoContasRoutes');
const lancamentoRoutes = require('./routes/lancamentoRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// Rota de Teste de Conexão com o Banco de Dados
app.get('/api/v1/health', async (req, res) => {
  try {
    const result = await db.query('SELECT NOW() as current_time');
    res.status(200).json({
      status: 'success',
      message: 'API conectada ao PostgreSQL com sucesso!',
      database_time: result.rows[0].current_time
    });
  } catch (error) {
    console.error('Erro ao conectar no banco de dados:', error);
    res.status(500).json({
      status: 'error',
      message: 'Falha na conexão com o banco de dados',
      error: error.message
    });
  }
});

// Rotas do Módulo de Empresas
app.use('/api/v1/empresas', empresaRoutes);

// Rotas do Plano de Contas (aninhadas sob empresas)
app.use('/api/v1/empresas/:empresaId/plano-contas', planoContasRoutes);

// Rotas do Plano de Contas (aninhadas sob empresas com parâmetro :id)
app.use('/api/v1/empresas/:id/contas', planoContasRoutes);

app.use('/api/v1/empresas/:id/lancamentos', lancamentoRoutes);

module.exports = app;