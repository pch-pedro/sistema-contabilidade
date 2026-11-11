-- Garante a criação limpa das tabelas respeitando as dependências estrangeiras
DROP TABLE IF EXISTS auditoria_logs CASCADE;
DROP TABLE IF EXISTS venda_itens CASCADE;
DROP TABLE IF EXISTS vendas CASCADE;
DROP TABLE IF EXISTS compra_itens CASCADE;
DROP TABLE IF EXISTS compras CASCADE;
DROP TABLE IF EXISTS estoque_movimentacoes CASCADE;
DROP TABLE IF EXISTS produtos CASCADE;
DROP TABLE IF EXISTS fornecedores CASCADE;
DROP TABLE IF EXISTS clientes CASCADE;
DROP TABLE IF EXISTS lancamento_linhas CASCADE;
DROP TABLE IF EXISTS lancamentos CASCADE;
DROP TABLE IF EXISTS plano_contas CASCADE;
DROP TABLE IF EXISTS empresas CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;

-- 1. Tabela de Usuários
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabela de Empresas (Isolamento Multi-tenant)
CREATE TABLE empresas (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    cnpj VARCHAR(18),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- 3. Tabela do Plano de Contas
CREATE TABLE plano_contas (
    id SERIAL PRIMARY KEY,
    empresa_id INT NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    codigo VARCHAR(20) NOT NULL,
    nome VARCHAR(150) NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    subtipo VARCHAR(50),
    natureza CHAR(1) NOT NULL CHECK (natureza IN ('D', 'C')),
    ativo BOOLEAN DEFAULT TRUE, -- <--- Ajustado de 'ativa' para 'ativo'
    deleted_at TIMESTAMP,
    CONSTRAINT uk_empresa_codigo UNIQUE (empresa_id, codigo)
);

-- 4. Tabela de Lançamentos Contábeis (Cabeçalho)
CREATE TABLE lancamentos (
    id SERIAL PRIMARY KEY,
    empresa_id INT NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    data DATE NOT NULL,
    historico TEXT NOT NULL,
    tipo_origem VARCHAR(30) DEFAULT 'MANUAL',
    lancamento_origem_id INT REFERENCES lancamentos(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- 5. Tabela de Linhas do Lançamento (Partidas Dobradas Compostas)
CREATE TABLE lancamento_linhas (
    id SERIAL PRIMARY KEY,
    lancamento_id INT NOT NULL REFERENCES lancamentos(id) ON DELETE CASCADE,
    conta_id INT NOT NULL REFERENCES plano_contas(id),
    tipo CHAR(1) NOT NULL CHECK (tipo IN ('D', 'C')),
    valor NUMERIC(15, 2) NOT NULL CHECK (valor > 0)
);

-- 6. Clientes e Fornecedores
CREATE TABLE clientes (
    id SERIAL PRIMARY KEY,
    empresa_id INT NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    nome VARCHAR(150) NOT NULL,
    cpf_cnpj VARCHAR(18),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE fornecedores (
    id SERIAL PRIMARY KEY,
    empresa_id INT NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    nome VARCHAR(150) NOT NULL,
    cpf_cnpj VARCHAR(18),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Produtos e Estoque
CREATE TABLE produtos (
    id SERIAL PRIMARY KEY,
    empresa_id INT NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    codigo VARCHAR(30) NOT NULL,
    nome VARCHAR(150) NOT NULL,
    quantidade_estoque NUMERIC(12, 4) DEFAULT 0,
    custo_medio NUMERIC(15, 2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Auditoria
CREATE TABLE auditoria_logs (
    id SERIAL PRIMARY KEY,
    empresa_id INT REFERENCES empresas(id),
    usuario_id INT REFERENCES usuarios(id),
    tabela VARCHAR(50) NOT NULL,
    registro_id INT NOT NULL,
    operacao VARCHAR(20) NOT NULL,
    dados_anteriores JSONB,
    dados_novos JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_empresas_cnpj_normalizado 
ON empresas (REGEXP_REPLACE(COALESCE(cnpj, ''), '[^0-9]', '', 'g')) 
WHERE cnpj IS NOT NULL AND TRIM(cnpj) <> '' AND REGEXP_REPLACE(cnpj, '[^0-9]', '', 'g') <> '';

ALTER TABLE plano_contas DROP CONSTRAINT IF EXISTS chk_tipo_conta;
ALTER TABLE plano_contas ADD CONSTRAINT chk_tipo_conta CHECK (
    tipo IN ('Ativo', 'Passivo', 'Patrimônio Líquido', 'Despesa', 'Receita', 'Apuração do Resultado')
);

CREATE INDEX IF NOT EXISTS idx_lancamentos_empresa_data ON lancamentos (empresa_id, data);
CREATE INDEX IF NOT EXISTS idx_lancamento_linhas_conta ON lancamento_linhas (conta_id);