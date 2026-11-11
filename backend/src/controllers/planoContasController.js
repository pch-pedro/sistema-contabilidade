const db = require('../config/db');

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

// Carregar plano de contas padrão para uma empresa específica
const carregarPlanoPadrao = async (req, res) => {
  const { empresaId } = req.params;

  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Verificar se a empresa existe e está ativa
    const empCheck = await client.query('SELECT id, nome FROM empresas WHERE id = $1 AND deleted_at IS NULL', [empresaId]);
    if (empCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Empresa não encontrada.' });
    }

    // 2. Inserir as contas utilizando transação e ON CONFLICT para evitar duplicações
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
  const { empresaId } = req.params;

  try {
    const empCheck = await db.query('SELECT id FROM empresas WHERE id = $1 AND deleted_at IS NULL', [empresaId]);
    if (empCheck.rows.length === 0) {
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

module.exports = {
  carregarPlanoPadrao,
  listarContas
};