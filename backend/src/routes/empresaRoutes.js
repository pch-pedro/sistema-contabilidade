const express = require('express');
const router = express.Router();
const empresaController = require('../controllers/empresaController');

router.get('/', empresaController.listarEmpresas);
router.post('/', empresaController.criarEmpresa);
router.get('/:id', empresaController.buscarEmpresaPorId);

module.exports = router;