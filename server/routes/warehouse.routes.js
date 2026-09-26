const express = require('express');
const router = express.Router();
const warehouseController = require('../controllers/warehouse.controller');
const { protect } = require('../middleware/auth.middleware');

router.route('/')
  .get(warehouseController.getWarehouses)
  .post(protect, warehouseController.createWarehouse);

router.route('/:id')
  .get(warehouseController.getWarehouseById)
  .put(protect, warehouseController.updateWarehouse)
  .delete(protect, warehouseController.deleteWarehouse);

module.exports = router;
