-- Exemplo para popular o Plano de Contas padrão para uma empresa com ID 1
-- Certifique-se de que a empresa com ID 1 existe na tabela 'empresas' antes de rodar este seed.

INSERT INTO plano_contas (empresa_id, codigo, nome, tipo, subtipo, natureza) VALUES
-- ATIVO
(1, '1.0.1', 'Caixa', 'Ativo', 'Circulante', 'D'),
(1, '1.0.2', 'Bancos Conta Movimento', 'Ativo', 'Circulante', 'D'),
(1, '1.0.3', 'Clientes', 'Ativo', 'Circulante', 'D'),
(1, '1.0.4', 'Estoques', 'Ativo', 'Circulante', 'D'),
(1, '1.0.5', 'Despesas Antecipadas', 'Ativo', 'Circulante', 'D'),
(1, '2.0.1', 'Clientes - Longo Prazo', 'Ativo', 'Ativo Realizável a Longo Prazo', 'D'),
(1, '2.0.2', 'Depósitos Judiciais', 'Ativo', 'Ativo Realizável a Longo Prazo', 'D'),
(1, '2.1.1', 'Participações Societárias', 'Ativo', 'Ativo Investimento', 'D'),
(1, '2.1.2', 'Imóveis para Renda', 'Ativo', 'Ativo Investimento', 'D'),
(1, '2.2.1', 'Máquinas e Equipamentos', 'Ativo', 'Ativo Imobilizado', 'D'),
(1, '2.2.2', 'Veículos', 'Ativo', 'Ativo Imobilizado', 'D'),
(1, '2.2.3', 'Móveis e Utensílios', 'Ativo', 'Ativo Imobilizado', 'D'),
(1, '2.2.4', 'Depreciação Acumulada', 'Ativo', 'Ativo Imobilizado', 'C'),
(1, '2.3.1', 'Softwares', 'Ativo', 'Ativo Intangível', 'D'),
(1, '2.3.2', 'Marcas e Patentes', 'Ativo', 'Ativo Intangível', 'D'),

-- PASSIVO
(1, '3.0.1', 'Fornecedores', 'Passivo', 'Passivo Circulante', 'C'),
(1, '3.0.2', 'Salários a Pagar', 'Passivo', 'Passivo Circulante', 'C'),
(1, '3.0.3', 'Impostos a Recolher', 'Passivo', 'Passivo Circulante', 'C'),
(1, '3.0.4', 'Empréstimos Bancários CP', 'Passivo', 'Passivo Circulante', 'C'),
(1, '3.0.5', 'Contas a Pagar', 'Passivo', 'Passivo Circulante', 'C'),
(1, '3.1.1', 'Empréstimos Bancários LP', 'Passivo', 'Passivo Não Circulante', 'C'),
(1, '3.1.2', 'Provisões Trabalhistas', 'Passivo', 'Passivo Não Circulante', 'C'),
(1, '3.1.3', 'Contas a Pagar LP', 'Passivo', 'Passivo Não Circulante', 'C'),

-- PATRIMÔNIO LÍQUIDO
(1, '4.0.1', 'Capital Social', 'Patrimônio Líquido', 'N/A', 'C'),
(1, '4.0.2', 'Reservas de Lucros', 'Patrimônio Líquido', 'N/A', 'C'),
(1, '4.0.3', 'Lucros Acumulados', 'Patrimônio Líquido', 'N/A', 'C'),

-- DESPESAS E CUSTOS
(1, '5.0.1', 'CMV', 'Despesa', 'N/A', 'D'),
(1, '5.0.2', 'CPV', 'Despesa', 'N/A', 'D'),
(1, '5.0.3', 'CSP', 'Despesa', 'N/A', 'D'),
(1, '5.1.1', 'Despesa com Salários', 'Despesa', 'N/A', 'D'),
(1, '5.1.2', 'Despesa com Aluguel', 'Despesa', 'N/A', 'D'),
(1, '5.1.3', 'Despesa com Energia Elétrica', 'Despesa', 'N/A', 'D'),
(1, '5.1.4', 'Despesa Financeira', 'Despesa', 'N/A', 'D'),
(1, '5.1.5', 'Despesa com Material de Escritório', 'Despesa', 'N/A', 'D'),
(1, '5.2.1', 'Despesa com Depreciação', 'Despesa', 'N/A', 'D'),
(1, '5.3.0', 'Despesa com IRPJ', 'Despesa', 'N/A', 'D'),

-- RECEITAS
(1, '6.0.1', 'Receita de Vendas', 'Receita', 'N/A', 'C'),
(1, '6.0.2', 'Receita de Serviços', 'Receita', 'N/A', 'C'),
(1, '6.0.3', 'Receita Financeira', 'Receita', 'N/A', 'C'),

-- APURAÇÃO
(1, '7.0.1', 'Resultado do Exercício', 'Apuração do Resultado', 'N/A', 'D');