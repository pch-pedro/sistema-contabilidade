const express = require('express');
const router = express.Router({ mergeParams: true });
const relatorioController = require('../controllers/relatorioController');

router.get('/diario', relatorioController.obterLivroDiario);

module.exports = router;