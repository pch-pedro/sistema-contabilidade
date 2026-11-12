const db = require('../config/db');

// Helper para verificar existência da empresa
const verificarEmpresa = async (clientOrDb, empresaId) => {
  const result = await clientOrDb.query('SELECT id FROM empresas WHERE id = $1 AND deleted_at IS NULL', [empresaId]);
  return result.rows.length > 0;
};

// Consultar Livro Diário
const obterLivroDiario = async (req, res) => {
  const { id: empresaId } = req.params;
  const { data_inicial, data_final } = req.query;

  try {
    if (!await verificarEmpresa(db, empresaId)) {
      return res.status(404).json({ error: 'Empresa não encontrada.' });
    }

    // Query otimizada no PostgreSQL agrupando as linhas do lançamento
    let query = `
      SELECT l.id AS lancamento_id, 
             l.data, 
             l.historico, 
             l.tipo_origem,
             json_agg(
               json_build_object(
                 'conta_codigo', pc.codigo,
                 'conta_nome', pc.nome,
                 'tipo', ll.tipo,
                 'valor', ll.valor
               ) ORDER BY ll.tipo DESC, pc.codigo ASC
             ) AS linhas
      FROM lancamentos l
      JOIN lancamento_linhas ll ON l.id = ll.lancamento_id
      JOIN plano_contas pc ON ll.conta_id = pc.id
      WHERE l.empresa_id = $1 AND l.deleted_at IS NULL
    `;

    const params = [empresaId];
    let paramIndex = 2;

    if (data_inicial) {
      query += ` AND l.data >= $${paramIndex}::date`;
      params.push(data_inicial);
      paramIndex++;
    }

    if (data_final) {
      query += ` AND l.data <= $${paramIndex}::date`;
      params.push(data_final);
      paramIndex++;
    }

    query += `
      GROUP BY l.id, l.data, l.historico, l.tipo_origem
      ORDER BY l.data ASC, l.id ASC;
    `;

    const result = await db.query(query, params);

    res.status(200).json({
      empresa_id: Number(empresaId),
      data_inicial: data_inicial || null,
      data_final: data_final || null,
      total_registros: result.rows.length,
      lancamentos: result.rows
    });
  } catch (error) {
    console.error('Erro ao gerar Livro Diário:', error);
    res.status(500).json({ error: 'Erro interno ao gerar Livro Diário.' });
  }
};

module.exports = {
  obterLivroDiario
};