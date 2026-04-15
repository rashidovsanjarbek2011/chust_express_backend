const { prisma } = require('../config/db');
const ApiError = require('../utils/ApiError');

// Territory Controller
const territoryController = {
  getAll: async (req, res, next) => {
    try {
      const territories = await prisma.territory.findMany({
        orderBy: { createdAt: 'desc' },
      });
      res.status(200).json(territories);
    } catch (err) {
      next(err);
    }
  },

  create: async (req, res, next) => {
    try {
      const { name, zoneType, description } = req.body;
      if (!name) throw new ApiError(400, 'Name is required');

      const territory = await prisma.territory.create({
        data: { name, zoneType, description },
      });
      res.status(201).json(territory);
    } catch (err) {
      next(err);
    }
  },

  delete: async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      await prisma.territory.delete({ where: { id } });
      res.status(200).json({ success: true, message: 'Territory deleted' });
    } catch (err) {
      next(err);
    }
  },
};

// Worker Controller
const workerController = {
  getAll: async (req, res, next) => {
    try {
      const workers = await prisma.worker.findMany({
        orderBy: { createdAt: 'desc' },
      });
      res.status(200).json(workers);
    } catch (err) {
      next(err);
    }
  },

  create: async (req, res, next) => {
    try {
      const { fullName, phone, role } = req.body;
      if (!fullName) throw new ApiError(400, 'Full name is required');

      const worker = await prisma.worker.create({
        data: { fullName, phone, role },
      });
      res.status(201).json(worker);
    } catch (err) {
      next(err);
    }
  },

  delete: async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      await prisma.worker.delete({ where: { id } });
      res.status(200).json({ success: true });
    } catch (err) {
      next(err);
    }
  },
};

// ConstructionEquipment Controller
const equipmentController = {
  getAll: async (req, res, next) => {
    try {
      const equipment = await prisma.constructionEquipment.findMany({
        orderBy: { createdAt: 'desc' },
      });
      res.status(200).json(equipment);
    } catch (err) {
      next(err);
    }
  },

  create: async (req, res, next) => {
    try {
      const { name, hourlyRate, status } = req.body;
      if (!name) throw new ApiError(400, 'Name is required');

      const equipment = await prisma.constructionEquipment.create({
        data: { name, hourlyRate: parseFloat(hourlyRate) || 0, status: status || 'Available' },
      });
      res.status(201).json(equipment);
    } catch (err) {
      next(err);
    }
  },

  delete: async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      await prisma.constructionEquipment.delete({ where: { id } });
      res.status(200).json({ success: true });
    } catch (err) {
      next(err);
    }
  },
};

// DeliveryVehicle Controller
const vehicleController = {
  getAll: async (req, res, next) => {
    try {
      const vehicles = await prisma.deliveryVehicle.findMany({
        orderBy: { createdAt: 'desc' },
      });
      res.status(200).json(vehicles);
    } catch (err) {
      next(err);
    }
  },

  create: async (req, res, next) => {
    try {
      const { name, plateNum, capacity, pricePerKm, vehicleType } = req.body;
      if (!name) throw new ApiError(400, 'Name is required');

      const vehicle = await prisma.deliveryVehicle.create({
        data: {
          name,
          plateNum,
          capacity: parseFloat(capacity) || 0,
          pricePerKm: parseFloat(pricePerKm) || 0,
          vehicleType: vehicleType || 'delivery',
        },
      });
      res.status(201).json(vehicle);
    } catch (err) {
      next(err);
    }
  },

  delete: async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      await prisma.deliveryVehicle.delete({ where: { id } });
      res.status(200).json({ success: true });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = {
  territoryController,
  workerController,
  equipmentController,
  vehicleController,
};