const express = require('express');
const router = express.Router({ mergeParams: true });
const lancamentoController = require('../controllers/lancamentoController');

router.get('/', lancamentoController.listarLancamentos);
router.get('/:lancamentoId', lancamentoController.buscarLancamentoPorId);
router.post('/', lancamentoController.criarLancamento);
router.post('/saldos-iniciais', lancamentoController.registrarSaldosIniciais);
router.put('/:lancamentoId', lancamentoController.editarLancamento);
router.delete('/:lancamentoId', lancamentoController.excluirLancamento);

module.exports = router;