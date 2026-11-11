const express = require('express');
const router = express.Router({ mergeParams: true });
const planoContasController = require('../controllers/planoContasController');

router.get('/', planoContasController.listarContas);
router.get('/:contaId', planoContasController.buscarContaPorId);
router.post('/', planoContasController.criarConta);
router.post('/carregar-padrao', planoContasController.carregarPlanoPadrao);
router.put('/:contaId', planoContasController.editarConta);
router.patch('/:contaId/desativar', planoContasController.desativarConta);

module.exports = router;