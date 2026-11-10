const db = require('../config/db');

// Função auxiliar para normalizar o CNPJ (mantém apenas os dígitos)
const normalizarCnpj = (cnpj) => {
if (!cnpj || typeof cnpj !== 'string') return null;
const apenasDigitos = cnpj.replace(/[^0-9]/g, '');
return apenasDigitos.length === 0 ? null : apenasDigitos;
};

// Listar todas as empresas ativas
const listarEmpresas = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM empresas WHERE deleted_at IS NULL ORDER BY id ASC');
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Erro ao listar empresas:', error);
    res.status(500).json({ error: 'Erro interno ao buscar empresas.' });
  }
};

// Criar nova empresa (com validação de nome obrigatório)
const criarEmpresa = async (req, res) => {
  const { nome, cnpj } = req.body;

  if (!nome || typeof nome !== 'string' || nome.trim() === '') {
    return res.status(400).json({ error: 'O campo "nome" da empresa é obrigatório e não pode estar vazio.' });
  }
  const cnpjNormalizado = normalizarCnpj(cnpj);
  const cnpjParaSalvar = (cnpj && cnpj.trim() !== '') ? cnpj.trim() : null;

  try {
    // Se o CNPJ foi informado, valida se já existe outra empresa com o mesmo CNPJ normalizado
    if (cnpjNormalizado) {
      const queryVerificacao = `
        SELECT id FROM empresas 
        WHERE deleted_at IS NULL 
        AND REGEXP_REPLACE(COALESCE(cnpj, ''), '[^0-9]', '', 'g') = $1
      `;
      const checkResult = await db.query(queryVerificacao, [cnpjNormalizado]);

      if (checkResult.rows.length > 0) {
        return res.status(409).json({ error: 'Este CNPJ já está cadastrado em outra empresa.' });
      }
    }

    const query = 'INSERT INTO empresas (nome, cnpj) VALUES ($1, $2) RETURNING *';
    const values = [nome.trim(), cnpjParaSalvar];
    
    const result = await db.query(query, values);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    // Tratamento de violação de unicidade caso ocorra requisição simultânea (PostgreSQL error 23505)
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Este CNPJ já está cadastrado em outra empresa.' });
    }
    console.error('Erro ao criar empresa:', error);
    res.status(500).json({ error: 'Erro interno ao criar empresa.' });
  }
};

// Buscar empresa específica por ID
const buscarEmpresaPorId = async (req, res) => {
  const { id } = req.params;

  try {
    const query = 'SELECT * FROM empresas WHERE id = $1 AND deleted_at IS NULL';
    const result = await db.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Empresa não encontrada.' });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar empresa:', error);
    res.status(500).json({ error: 'Erro interno ao buscar empresa.' });
  }
};

module.exports = {
  listarEmpresas,
  criarEmpresa,
  buscarEmpresaPorId
};