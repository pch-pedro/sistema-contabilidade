const db = require('../config/db');

// Helper para verificar se a empresa existe
const verificarEmpresa = async (clientOrDb, empresaId) => {
  const result = await clientOrDb.query('SELECT id FROM empresas WHERE id = $1 AND deleted_at IS NULL', [empresaId]);
  return result.rows.length > 0;
};

// Listar lançamentos ativos da empresa
const listarLancamentos = async (req, res) => {
  const { id: empresaId } = req.params;

  try {
    if (!await verificarEmpresa(db, empresaId)) {
      return res.status(404).json({ error: 'Empresa não encontrada.' });
    }

    const query = `
      SELECT l.*, 
             json_agg(
               json_build_object(
                 'id', ll.id,
                 'conta_id', ll.conta_id,
                 'conta_codigo', pc.codigo,
                 'conta_nome', pc.nome,
                 'tipo', ll.tipo,
                 'valor', ll.valor
               )
             ) as linhas
      FROM lancamentos l
      JOIN lancamento_linhas ll ON l.id = ll.lancamento_id
      JOIN plano_contas pc ON ll.conta_id = pc.id
      WHERE l.empresa_id = $1 AND l.deleted_at IS NULL
      GROUP BY l.id
      ORDER BY l.data DESC, l.id DESC;
    `;
    const result = await db.query(query, [empresaId]);

    res.status(200).json({
      empresa_id: Number(empresaId),
      total: result.rows.length,
      lancamentos: result.rows
    });
  } catch (error) {
    console.error('Erro ao listar lançamentos:', error);
    res.status(500).json({ error: 'Erro interno ao listar lançamentos.' });
  }
};

// Consultar um lançamento específico
const buscarLancamentoPorId = async (req, res) => {
  const { id: empresaId, lancamentoId } = req.params;

  try {
    const query = `
      SELECT l.*, 
             json_agg(
               json_build_object(
                 'id', ll.id,
                 'conta_id', ll.conta_id,
                 'conta_codigo', pc.codigo,
                 'conta_nome', pc.nome,
                 'tipo', ll.tipo,
                 'valor', ll.valor
               )
             ) as linhas
      FROM lancamentos l
      JOIN lancamento_linhas ll ON l.id = ll.lancamento_id
      JOIN plano_contas pc ON ll.conta_id = pc.id
      WHERE l.id = $1 AND l.empresa_id = $2 AND l.deleted_at IS NULL
      GROUP BY l.id;
    `;
    const result = await db.query(query, [lancamentoId, empresaId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Lançamento não encontrado para esta empresa.' });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar lançamento:', error);
    res.status(500).json({ error: 'Erro interno ao buscar lançamento.' });
  }
};

// Função central de validação e salvamento de lançamento (usada para criar e editar)
const processarLancamento = async (empresaId, data, historico, linhas, tipoOrigem = 'MANUAL', lancamentoId = null) => {
  if (!data || !historico || typeof historico !== 'string' || historico.trim() === '') {
    throw { status: 400, message: 'Data e histórico são obrigatórios.' };
  }

  if (!linhas || !Array.isArray(linhas) || linhas.length === 0) {
    throw { status: 400, message: 'O lançamento deve conter pelo menos uma linha de débito e uma de crédito.' };
  }

  let totalDebitos = 0;
  let totalCreditos = 0;
  let temDebito = false;
  let temCredito = false;

  for (const linha of linhas) {
    const { conta_id, tipo, valor } = linha;
    const numValor = Number(valor);

    if (!conta_id || !tipo || isNaN(numValor) || numValor <= 0) {
      throw { status: 400, message: 'Todas as partidas devem possuir conta, tipo (D/C) e valor maior que zero.' };
    }

    if (!['D', 'C'].includes(tipo.toUpperCase())) {
      throw { status: 400, message: 'O tipo da partida deve ser "D" ou "C".' };
    }

    if (tipo.toUpperCase() === 'D') {
      totalDebitos += numValor;
      temDebito = true;
    } else {
      totalCreditos += numValor;
      temCredito = true;
    }
  }

  if (!temDebito || !temCredito) {
    throw { status: 400, message: 'O lançamento deve possuir pelo menos um débito e pelo menos um crédito.' };
  }

  // Tolerância para ponto flutuante monetário
  if (Math.abs(totalDebitos - totalCreditos) > 0.01) {
    throw { status: 400, message: `Partidas desequilibradas. Total de débitos (${totalDebitos.toFixed(2)}) deve ser igual ao total de créditos (${totalCreditos.toFixed(2)}).` };
  }

  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    if (!await verificarEmpresa(client, empresaId)) {
      throw { status: 404, message: 'Empresa não encontrada.' };
    }

    // Validar contas (pertencem à empresa e estão ativas)
    for (const linha of linhas) {
      const contaCheck = await client.query(
        'SELECT id, ativo FROM plano_contas WHERE id = $1 AND empresa_id = $2 AND deleted_at IS NULL',
        [linha.conta_id, empresaId]
      );

      if (contaCheck.rows.length === 0) {
        throw { status: 403, message: `A conta ID ${linha.conta_id} não pertence a esta empresa ou não existe.` };
      }

      if (!contaCheck.rows[0].ativo) {
        throw { status: 400, message: `A conta ID ${linha.conta_id} está inativa e não pode ser utilizada em lançamentos.` };
      }
    }

    let lancamentoIdFinal = lancamentoId;

    if (lancamentoId) {
      // Atualizar cabeçalho
      await client.query(
        'UPDATE lancamentos SET data = $1, historico = $2 WHERE id = $3 AND empresa_id = $4',
        [data, historico.trim(), lancamentoId, empresaId]
      );
      // Remover linhas antigas para re Inserir
      await client.query('DELETE FROM lancamento_linhas WHERE lancamento_id = $1', [lancamentoId]);
    } else {
      // Inserir cabeçalho
      const lancRes = await client.query(
        'INSERT INTO lancamentos (empresa_id, data, historico, tipo_origem) VALUES ($1, $2, $3, $4) RETURNING id',
        [empresaId, data, historico.trim(), tipoOrigem]
      );
      lancamentoIdFinal = lancRes.rows[0].id;
    }

    // Inserir novas linhas
    for (const linha of linhas) {
      await client.query(
        'INSERT INTO lancamento_linhas (lancamento_id, conta_id, tipo, valor) VALUES ($1, $2, $3, $4)',
        [lancamentoIdFinal, linha.conta_id, linha.tipo.toUpperCase(), linha.valor]
      );
    }

    await client.query('COMMIT');

    // Retornar completo
    const resultCompleto = await client.query(`
      SELECT l.*, 
             json_agg(
               json_build_object(
                 'id', ll.id,
                 'conta_id', ll.conta_id,
                 'tipo', ll.tipo,
                 'valor', ll.valor
               )
             ) as linhas
      FROM lancamentos l
      JOIN lancamento_linhas ll ON l.id = ll.lancamento_id
      WHERE l.id = $1
      GROUP BY l.id;
    `, [lancamentoIdFinal]);

    return resultCompleto.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

// Criar lançamento
const criarLancamento = async (req, res) => {
  const { id: empresaId } = req.params;
  const { data, historico, linhas } = req.body;

  try {
    const novoLancamento = await processarLancamento(empresaId, data, historico, linhas, 'MANUAL');
    res.status(201).json(novoLancamento);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message || 'Erro interno ao criar lançamento.' });
  }
};

// Editar lançamento
const editarLancamento = async (req, res) => {
  const { id: empresaId, lancamentoId } = req.params;
  const { data, historico, linhas } = req.body;

  try {
    const check = await db.query('SELECT id FROM lancamentos WHERE id = $1 AND empresa_id = $2 AND deleted_at IS NULL', [lancamentoId, empresaId]);
    if (check.rows.length === 0) {
      return res.status(404).json({ error: 'Lançamento não encontrado para esta empresa.' });
    }

    const lancamentoAtualizado = await processarLancamento(empresaId, data, historico, linhas, 'MANUAL', lancamentoId);
    res.status(200).json(lancamentoAtualizado);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message || 'Erro interno ao editar lançamento.' });
  }
};

// Exclusão lógica (Soft Delete)
const excluirLancamento = async (req, res) => {
  const { id: empresaId, lancamentoId } = req.params;

  try {
    const check = await db.query('SELECT id FROM lancamentos WHERE id = $1 AND empresa_id = $2 AND deleted_at IS NULL', [lancamentoId, empresaId]);
    if (check.rows.length === 0) {
      return res.status(404).json({ error: 'Lançamento não encontrado para esta empresa.' });
    }

    await db.query('UPDATE lancamentos SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1 AND empresa_id = $2', [lancamentoId, empresaId]);

    res.status(200).json({ message: 'Lançamento excluído logicamente com sucesso.' });
  } catch (error) {
    console.error('Erro ao excluir lançamento:', error);
    res.status(500).json({ error: 'Erro interno ao excluir lançamento.' });
  }
};

// Registrar Saldos Iniciais
const registrarSaldosIniciais = async (req, res) => {
  const { id: empresaId } = req.params;
  const { data, linhas } = req.body;

  try {
    // Verificar se já existe carga inicial ativa para esta empresa
    const existingCheck = await db.query(
      "SELECT id FROM lancamentos WHERE empresa_id = $1 AND tipo_origem = 'SALDO_INICIAL' AND deleted_at IS NULL",
      [empresaId]
    );

    if (existingCheck.rows.length > 0) {
      return res.status(409).json({ error: 'Saldos iniciais já cadastrados para esta empresa. Utilize a edição ou exclusão lógica caso precise corrigir.' });
    }

    const historico = `Carga de Saldos Iniciais em ${data}`;
    const novoLancamento = await processarLancamento(empresaId, data, historico, linhas, 'SALDO_INICIAL');
    res.status(201).json({ message: 'Saldos iniciais registrados com sucesso.', lancamento: novoLancamento });
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message || 'Erro interno ao registrar saldos iniciais.' });
  }
};

module.exports = {
  listarLancamentos,
  buscarLancamentoPorId,
  criarLancamento,
  editarLancamento,
  excluirLancamento,
  registrarSaldosIniciais
};