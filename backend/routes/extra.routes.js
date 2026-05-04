const express = require('express');
const router = express.Router();
const {
  territoryController,
  workerController,
  equipmentController,
  vehicleController,
  rentalController,
  statsController,
} = require('../controllers/extra.controller');
const { protect } = require('../middleware/auth');

// Apply protection to all extra routes
router.use(protect);

// Stats
router.get('/stats', statsController.getStats);

// Territories
router.get('/territories', territoryController.getAll);
router.post('/territories', territoryController.create);
router.delete('/territories/:id', territoryController.delete);

// Workers
router.get('/workers', workerController.getAll);
router.post('/workers', workerController.create);
router.delete('/workers/:id', workerController.delete);

// Construction Equipment
router.get('/construction-equipments', equipmentController.getAll);
router.post('/construction-equipments', equipmentController.create);
router.delete('/construction-equipments/:id', equipmentController.delete);

// Delivery Vehicles
router.get('/delivery-vehicles', vehicleController.getAll);
router.post('/delivery-vehicles', vehicleController.create);
router.delete('/delivery-vehicles/:id', vehicleController.delete);

// Rental Services
router.get('/rentals', rentalController.getAll);
router.post('/rentals', rentalController.create);
router.delete('/rentals/:id', rentalController.delete);

module.exports = router;