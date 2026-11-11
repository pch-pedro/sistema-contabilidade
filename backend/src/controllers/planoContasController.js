const db = require('../config/db');

// Validador de tipos e subtipos contábeis
const validarTipoESubtipo = (tipo, subtipo) => {
  const tiposValidos = ['Ativo', 'Passivo', 'Patrimônio Líquido', 'Despesa', 'Receita', 'Apuração do Resultado'];
  if (!tiposValidos.includes(tipo)) {
    return { valido: false, mensagem: 'Tipo de conta inválido.' };
  }

  const subLimpo = subtipo ? subtipo.trim() : null;

  if (tipo === 'Ativo') {
    const subtiposAtivo = ['Circulante', 'Ativo Realizável a Longo Prazo', 'Ativo Investimento', 'Ativo Imobilizado', 'Ativo Intangível'];
    if (subLimpo && !subtiposAtivo.includes(subLimpo)) {
      return { valido: false, mensagem: 'Subtipo inválido para o tipo Ativo.' };
    }
  } else if (tipo === 'Passivo') {
    const subtiposPassivo = ['Passivo Circulante', 'Passivo Não Circulante', 'Circulante', 'Não Circulante'];
    if (subLimpo && !subtiposPassivo.includes(subLimpo)) {
      return { valido: false, mensagem: 'Subtipo inválido para o tipo Passivo.' };
    }
  } else {
    // PL, Despesa, Receita, Apuração não devem possuir subtipo
    if (subLimpo) {
      return { valido: false, mensagem: `O tipo "${tipo}" não deve possuir subtipo.` };
    }
  }
  return { valido: true };
};

// Lista completa das 39 contas padrão com tipos, subtipos e naturezas corretas
const CONTAS_PADRAO = [
  // ATIVO (Circulante)
  { codigo: '1.0.1', nome: 'Caixa', tipo: 'Ativo', subtipo: 'Circulante', natureza: 'D' },
  { codigo: '1.0.2', nome: 'Bancos Conta Movimento', tipo: 'Ativo', subtipo: 'Circulante', natureza: 'D' },
  { codigo: '1.0.3', nome: 'Clientes', tipo: 'Ativo', subtipo: 'Circulante', natureza: 'D' },
  { codigo: '1.0.4', nome: 'Estoques', tipo: 'Ativo', subtipo: 'Circulante', natureza: 'D' },
  { codigo: '1.0.5', nome: 'Despesas Antecipadas', tipo: 'Ativo', subtipo: 'Circulante', natureza: 'D' },
  
  // ATIVO (Realizável a Longo Prazo)
  { codigo: '2.0.1', nome: 'Clientes - Longo Prazo', tipo: 'Ativo', subtipo: 'Ativo Realizável a Longo Prazo', natureza: 'D' },
  { codigo: '2.0.2', nome: 'Depósitos Judiciais', tipo: 'Ativo', subtipo: 'Ativo Realizável a Longo Prazo', natureza: 'D' },
  
  // ATIVO (Investimento)
  { codigo: '2.1.1', nome: 'Participações Societárias', tipo: 'Ativo', subtipo: 'Ativo Investimento', natureza: 'D' },
  { codigo: '2.1.2', nome: 'Imóveis para Renda', tipo: 'Ativo', subtipo: 'Ativo Investimento', natureza: 'D' },
  
  // ATIVO (Imobilizado)
  { codigo: '2.2.1', nome: 'Máquinas e Equipamentos', tipo: 'Ativo', subtipo: 'Ativo Imobilizado', natureza: 'D' },
  { codigo: '2.2.2', nome: 'Veículos', tipo: 'Ativo', subtipo: 'Ativo Imobilizado', natureza: 'D' },
  { codigo: '2.2.3', nome: 'Móveis e Utensílios', tipo: 'Ativo', subtipo: 'Ativo Imobilizado', natureza: 'D' },
  { codigo: '2.2.4', nome: 'Depreciação Acumulada', tipo: 'Ativo', subtipo: 'Ativo Imobilizado', natureza: 'C' },
  
  // ATIVO (Intangível)
  { codigo: '2.3.1', nome: 'Softwares', tipo: 'Ativo', subtipo: 'Ativo Intangível', natureza: 'D' },
  { codigo: '2.3.2', nome: 'Marcas e Patentes', tipo: 'Ativo', subtipo: 'Ativo Intangível', natureza: 'D' },

  // PASSIVO (Circulante)
  { codigo: '3.0.1', nome: 'Fornecedores', tipo: 'Passivo', subtipo: 'Passivo Circulante', natureza: 'C' },
  { codigo: '3.0.2', nome: 'Salários a Pagar', tipo: 'Passivo', subtipo: 'Passivo Circulante', natureza: 'C' },
  { codigo: '3.0.3', nome: 'Impostos a Recolher', tipo: 'Passivo', subtipo: 'Passivo Circulante', natureza: 'C' },
  { codigo: '3.0.4', nome: 'Empréstimos Bancários CP', tipo: 'Passivo', subtipo: 'Passivo Circulante', natureza: 'C' },
  { codigo: '3.0.5', nome: 'Contas a Pagar', tipo: 'Passivo', subtipo: 'Passivo Circulante', natureza: 'C' },

  // PASSIVO (Não Circulante)
  { codigo: '3.1.1', nome: 'Empréstimos Bancários LP', tipo: 'Passivo', subtipo: 'Passivo Não Circulante', natureza: 'C' },
  { codigo: '3.1.2', nome: 'Provisões Trabalhistas', tipo: 'Passivo', subtipo: 'Passivo Não Circulante', natureza: 'C' },
  { codigo: '3.1.3', nome: 'Contas a Pagar LP', tipo: 'Passivo', subtipo: 'Passivo Não Circulante', natureza: 'C' },

  // PATRIMÔNIO LÍQUIDO
  { codigo: '4.0.1', nome: 'Capital Social', tipo: 'Patrimônio Líquido', subtipo: null, natureza: 'C' },
  { codigo: '4.0.2', nome: 'Reservas de Lucros', tipo: 'Patrimônio Líquido', subtipo: null, natureza: 'C' },
  { codigo: '4.0.3', nome: 'Lucros Acumulados', tipo: 'Patrimônio Líquido', subtipo: null, natureza: 'C' },

  // DESPESAS
  { codigo: '5.0.1', nome: 'CMV', tipo: 'Despesa', subtipo: null, natureza: 'D' },
  { codigo: '5.0.2', nome: 'CPV', tipo: 'Despesa', subtipo: null, natureza: 'D' },
  { codigo: '5.0.3', nome: 'CSP', tipo: 'Despesa', subtipo: null, natureza: 'D' },
  { codigo: '5.1.1', nome: 'Despesa com Salários', tipo: 'Despesa', subtipo: null, natureza: 'D' },
  { codigo: '5.1.2', nome: 'Despesa com Aluguel', tipo: 'Despesa', subtipo: null, natureza: 'D' },
  { codigo: '5.1.3', nome: 'Despesa com Energia Elétrica', tipo: 'Despesa', subtipo: null, natureza: 'D' },
  { codigo: '5.1.4', nome: 'Despesa Financeira', tipo: 'Despesa', subtipo: null, natureza: 'D' },
  { codigo: '5.1.5', nome: 'Despesa com Material de Escritório', tipo: 'Despesa', subtipo: null, natureza: 'D' },
  { codigo: '5.2.1', nome: 'Despesa com Depreciação', tipo: 'Despesa', subtipo: null, natureza: 'D' },
  { codigo: '5.3.0', nome: 'Despesa com IRPJ', tipo: 'Despesa', subtipo: null, natureza: 'D' },

  // RECEITAS
  { codigo: '6.0.1', nome: 'Receita de Vendas', tipo: 'Receita', subtipo: null, natureza: 'C' },
  { codigo: '6.0.2', nome: 'Receita de Serviços', tipo: 'Receita', subtipo: null, natureza: 'C' },
  { codigo: '6.0.3', nome: 'Receita Financeira', tipo: 'Receita', subtipo: null, natureza: 'C' },

  // APURAÇÃO DO RESULTADO
  { codigo: '7.0.1', nome: 'Resultado do Exercício', tipo: 'Apuração do Resultado', subtipo: null, natureza: 'C' }
];

// Helper para validar existência da empresa
const verificarEmpresa = async (clientOrDb, empresaId) => {
    const result = await clientOrDb.query('SELECT id FROM empresas WHERE id = $1 AND deleted_at IS NULL', [empresaId]);
    return result.rows.length > 0;
  };

// Carregar plano de contas padrão para uma empresa específica
const carregarPlanoPadrao = async (req, res) => {
    const { id: empresaId } = req.params;
  
    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');
  
      // 1. Verificar se a empresa existe e está ativa
      const empCheck = await client.query('SELECT id, nome FROM empresas WHERE id = $1 AND deleted_at IS NULL', [empresaId]);
      if (empCheck.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'Empresa não encontrada.' });
      }
  
      // 2. Verificar se o plano padrão já foi carregado anteriormente
      const countCheck = await client.query('SELECT COUNT(*) FROM plano_contas WHERE empresa_id = $1 AND deleted_at IS NULL', [empresaId]);
      const totalContas = parseInt(countCheck.rows[0].count, 10);
  
      if (totalContas >= CONTAS_PADRAO.length) {
        await client.query('ROLLBACK');
        return res.status(200).json({
          message: 'Plano Padrão já carregado',
          empresa_id: Number(empresaId)
        });
      }
  
      // 3. Inserir as contas utilizando transação e ON CONFLICT para evitar duplicações
      let inseridas = 0;
      for (const conta of CONTAS_PADRAO) {
        const query = `
          INSERT INTO plano_contas (empresa_id, codigo, nome, tipo, subtipo, natureza, ativo)
          VALUES ($1, $2, $3, $4, $5, $6, TRUE)
          ON CONFLICT (empresa_id, codigo) DO NOTHING
          RETURNING id;
        `;
        const values = [empresaId, conta.codigo, conta.nome, conta.tipo, conta.subtipo, conta.natureza];
        const result = await client.query(query, values);
        if (result.rows.length > 0) {
          inseridas++;
        }
      }
  
      await client.query('COMMIT');
  
      res.status(200).json({
        message: 'Plano de contas padrão processado com sucesso.',
        empresa_id: Number(empresaId),
        total_contas_padrao: CONTAS_PADRAO.length,
        novas_contas_inseridas: inseridas
      });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Erro ao carregar plano de contas padrão:', error);
      res.status(500).json({ error: 'Erro interno ao carregar plano de contas padrão.' });
    } finally {
      client.release();
    }
};

// Listar contas do plano de contas de uma empresa
const listarContas = async (req, res) => {
    const { id: empresaId } = req.params;
  
    try {
      if (!await verificarEmpresa(db, empresaId)) {
        return res.status(404).json({ error: 'Empresa não encontrada.' });
      }
  
      const query = 'SELECT * FROM plano_contas WHERE empresa_id = $1 AND deleted_at IS NULL ORDER BY codigo ASC';
      const result = await db.query(query, [empresaId]);
  
      res.status(200).json({
        empresa_id: Number(empresaId),
        total: result.rows.length,
        contas: result.rows
      });
    } catch (error) {
      console.error('Erro ao listar contas:', error);
      res.status(500).json({ error: 'Erro interno ao listar contas.' });
    }
};

// 2. Consultar uma conta específica
const buscarContaPorId = async (req, res) => {
    const { id: empresaId, contaId } = req.params;
  
    try {
      const query = 'SELECT * FROM plano_contas WHERE id = $1 AND empresa_id = $2 AND deleted_at IS NULL';
      const result = await db.query(query, [contaId, empresaId]);
  
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Conta não encontrada para esta empresa.' });
      }
  
      res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error('Erro ao buscar conta:', error);
      res.status(500).json({ error: 'Erro interno ao buscar conta.' });
    }
};

// 3. Cadastrar uma conta personalizada
const criarConta = async (req, res) => {
    const { id: empresaId } = req.params;
    const { codigo, nome, tipo, subtipo, natureza } = req.body;
  
    // Validação de campos obrigatórios (HTTP 400)
    if (!codigo || typeof codigo !== 'string' || codigo.trim() === '' ||
      !nome || typeof nome !== 'string' || nome.trim() === '' ||
      !tipo || typeof tipo !== 'string' || tipo.trim() === '' ||
      !natureza || typeof natureza !== 'string' || natureza.trim() === '') {
      return res.status(400).json({ error: 'Campos obrigatórios ausentes: codigo, nome, tipo e natureza são obrigatórios.' });
    }
  
    if (!['D', 'C'].includes(natureza.toUpperCase())) {
      return res.status(400).json({ error: 'A natureza deve ser "D" (Devedora) ou "C" (Credora).' });
    }
    
    // Validação de Tipo e Subtipo
    const validacaoTipo = validarTipoESubtipo(tipo.trim(), subtipo);
    if (!validacaoTipo.valido) {
      return res.status(400).json({ error: validacaoTipo.mensagem });
    }

    try {
      if (!await verificarEmpresa(db, empresaId)) {
        return res.status(404).json({ error: 'Empresa não encontrada.' });
      }
  
      const query = `
        INSERT INTO plano_contas (empresa_id, codigo, nome, tipo, subtipo, natureza, ativo)
        VALUES ($1, $2, $3, $4, $5, $6, TRUE)
        RETURNING *;
      `;
      const values = [empresaId, codigo.trim(), nome.trim(), tipo.trim(), subtipo ? subtipo.trim() : null, natureza.toUpperCase()];
      
      const result = await db.query(query, values);
      res.status(201).json(result.rows[0]);
    } catch (error) {
      if (error.code === '23505') {
        return res.status(409).json({ error: 'Já existe uma conta com este código nesta empresa.' });
      }
      console.error('Erro ao criar conta:', error);
      res.status(500).json({ error: 'Erro interno ao criar conta.' });
    }
};

// 4. Editar uma conta existente
const editarConta = async (req, res) => {
    const { id: empresaId, contaId } = req.params;
    const { codigo, nome, tipo, subtipo, natureza } = req.body;
  
    if (!codigo || !nome || !tipo || !natureza) {
      return res.status(400).json({ error: 'Campos obrigatórios ausentes: codigo, nome, tipo e natureza são obrigatórios.' });
    }
  
    if (!['D', 'C'].includes(natureza.toUpperCase())) {
      return res.status(400).json({ error: 'A natureza deve ser "D" (Devedora) ou "C" (Credora).' });
    }
    
    const validacaoTipo = validarTipoESubtipo(tipo.trim(), subtipo);
    if (!validacaoTipo.valido) {
      return res.status(400).json({ error: validacaoTipo.mensagem });
    }

    try {
      // Verificar se a conta pertence à empresa
      const checkConta = await db.query('SELECT id FROM plano_contas WHERE id = $1 AND empresa_id = $2 AND deleted_at IS NULL', [contaId, empresaId]);
      if (checkConta.rows.length === 0) {
        return res.status(404).json({ error: 'Conta não encontrada para esta empresa.' });
      }
  
      const query = `
        UPDATE plano_contas 
        SET codigo = $1, nome = $2, tipo = $3, subtipo = $4, natureza = $5
        WHERE id = $6 AND empresa_id = $7
        RETURNING *;
      `;
      const values = [codigo.trim(), nome.trim(), tipo.trim(), subtipo ? subtipo.trim() : null, natureza.toUpperCase(), contaId, empresaId];
  
      const result = await db.query(query, values);
      res.status(200).json(result.rows[0]);
    } catch (error) {
      if (error.code === '23505') {
        return res.status(409).json({ error: 'Já existe outra conta com este código nesta empresa.' });
      }
      console.error('Erro ao editar conta:', error);
      res.status(500).json({ error: 'Erro interno ao editar conta.' });
    }
};

// 5. Desativar uma conta (Soft Delete / Inativação)
const desativarConta = async (req, res) => {
    const { id: empresaId, contaId } = req.params;
  
    try {
      const checkConta = await db.query('SELECT id, ativo FROM plano_contas WHERE id = $1 AND empresa_id = $2 AND deleted_at IS NULL', [contaId, empresaId]);
      if (checkConta.rows.length === 0) {
        return res.status(404).json({ error: 'Conta não encontrada para esta empresa.' });
      }
  
      const query = `
        UPDATE plano_contas 
        SET ativo = FALSE 
        WHERE id = $1 AND empresa_id = $2 
        RETURNING *;
      `;
      const result = await db.query(query, [contaId, empresaId]);
  
      res.status(200).json({
        message: 'Conta desativada com sucesso. Histórico preservado.',
        conta: result.rows[0]
      });
    } catch (error) {
      console.error('Erro ao desativar conta:', error);
      res.status(500).json({ error: 'Erro interno ao desativar conta.' });
    }
};

module.exports = {
    listarContas,
    buscarContaPorId,
    criarConta,
    editarConta,
    desativarConta,
    carregarPlanoPadrao
  };