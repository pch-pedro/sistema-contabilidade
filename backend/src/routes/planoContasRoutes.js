const express = require('express');
const router = express.Router({ mergeParams: true });
const planoContasController = require('../controllers/planoContasController');

router.post('/carregar-padrao', planoContasController.carregarPlanoPadrao);
router.get('/', planoContasController.listarContas);

module.exports = router;