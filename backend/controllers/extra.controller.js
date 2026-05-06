const ApiError = require('../utils/ApiError');

// Helper to check if extra subscription is active
const checkSubscription = async (req) => {
  const user = await req.prisma.user.findUnique({ where: { id: req.user.id } });
  // Completely disabled for testing
  return user;
};

// Territory Controller
const territoryController = {
  getAll: async (req, res, next) => {
    try {
      const territories = await req.prisma.territory.findMany({
        where: { userId: req.user.id },
        orderBy: { createdAt: 'desc' },
      });
      res.status(200).json(territories);
    } catch (err) {
      next(err);
    }
  },

  create: async (req, res, next) => {
    try {
      await checkSubscription(req);
      const { name, zoneType, description } = req.body;
      if (!name) throw new ApiError(400, 'Name is required');

      const territory = await req.prisma.territory.create({
        data: { 
          name, zoneType, description,
          userId: req.user.id 
        },
      });
      res.status(201).json(territory);
    } catch (err) {
      next(err);
    }
  },

  delete: async (req, res, next) => {
    try {
      await checkSubscription(req);
      const id = parseInt(req.params.id);
      await req.prisma.territory.delete({ 
        where: { id, userId: req.user.id } 
      });
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
      const workers = await req.prisma.worker.findMany({
        where: { userId: req.user.id },
        orderBy: { createdAt: 'desc' },
      });
      res.status(200).json(workers);
    } catch (err) {
      next(err);
    }
  },

  create: async (req, res, next) => {
    try {
      await checkSubscription(req);
      const { fullName, phone, role, description, district, photos, birthDate, pricingModel, price } = req.body;
      if (!fullName) throw new ApiError(400, 'Full name is required');

      const worker = await req.prisma.worker.create({
        data: { 
          fullName, phone, role, description, district, 
          photos: photos || [], 
          birthDate: birthDate ? new Date(birthDate) : null,
          pricingModel: pricingModel || 'Hourly',
          price: parseFloat(price) || 0,
          userId: req.user.id // Auto-assign owner
        },
      });
      res.status(201).json(worker);
    } catch (err) {
      next(err);
    }
  },

  delete: async (req, res, next) => {
    try {
      await checkSubscription(req);
      const id = parseInt(req.params.id);
      await req.prisma.worker.delete({ 
        where: { id, userId: req.user.id } // Only owner can delete
      });
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
      const equipment = await req.prisma.constructionEquipment.findMany({
        where: { userId: req.user.id },
        orderBy: { createdAt: 'desc' },
      });
      res.status(200).json(equipment);
    } catch (err) {
      next(err);
    }
  },

  create: async (req, res, next) => {
    try {
      await checkSubscription(req);
      const { name, hourlyRate, description, district, status, photos, productionYear, pricingModel, price } = req.body;
      if (!name) throw new ApiError(400, 'Name is required');

      const equipment = await req.prisma.constructionEquipment.create({
        data: { 
          name, 
          hourlyRate: parseFloat(hourlyRate) || 0, 
          description, district,
          photos: photos || [],
          productionYear: parseInt(productionYear) || null,
          pricingModel: pricingModel || 'Hourly',
          price: parseFloat(price) || 0,
          status: status || 'Available',
          userId: req.user.id
        },
      });
      res.status(201).json(equipment);
    } catch (err) {
      next(err);
    }
  },

  delete: async (req, res, next) => {
    try {
      await checkSubscription(req);
      const id = parseInt(req.params.id);
      await req.prisma.constructionEquipment.delete({ 
        where: { id, userId: req.user.id } 
      });
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
      const vehicles = await req.prisma.deliveryVehicle.findMany({
        where: { userId: req.user.id },
        orderBy: { createdAt: 'desc' },
      });
      res.status(200).json(vehicles);
    } catch (err) {
      next(err);
    }
  },

  create: async (req, res, next) => {
    try {
      await checkSubscription(req);
      // Remove vehicleType from request body if present
      const { vehicleType, ...bodyData } = req.body;
      const { name, plateNum, capacity, phone, pricePerKm, description, district, photos, productionYear, pricingModel, price } = bodyData;
      if (!name) throw new ApiError(400, 'Name is required');

      // Debug: Log what we're receiving
      console.log('Request body:', req.body);
      console.log('After vehicleType removal:', bodyData);
      
      // Explicitly create clean data object without vehicleType
      const vehicleData = {
          name,
          plateNum,
          capacity: parseFloat(capacity) || 0,
          phone: phone || '',
          pricePerKm: parseFloat(pricePerKm) || 0,
          description, district,
          photos: photos || [],
          productionYear: parseInt(productionYear) || null,
          pricingModel: pricingModel || 'Hourly',
          price: parseFloat(price) || 0,
          userId: req.user.id
        };
      
      // Debug: Log what we're sending to Prisma
      console.log('Vehicle data for Prisma:', vehicleData);
      
      // Aggressive filtering - remove any unwanted fields
      const unwantedFields = ['vehicleType', 'id', 'createdAt', 'updatedAt', 'user'];
      unwantedFields.forEach(field => delete vehicleData[field]);
      
      // Final clean data object with only allowed fields
      const cleanVehicleData = {
        name: vehicleData.name,
        plateNum: vehicleData.plateNum,
        capacity: vehicleData.capacity,
        phone: vehicleData.phone,
        pricePerKm: vehicleData.pricePerKm,
        description: vehicleData.description,
        district: vehicleData.district,
        photos: vehicleData.photos,
        productionYear: vehicleData.productionYear,
        pricingModel: vehicleData.pricingModel,
        price: vehicleData.price,
        userId: vehicleData.userId
      };
      
      console.log('Clean vehicle data:', cleanVehicleData);
      
      const vehicle = await req.prisma.deliveryVehicle.create({
        data: cleanVehicleData,
      });
      res.status(201).json(vehicle);
    } catch (err) {
      next(err);
    }
  },

  delete: async (req, res, next) => {
    try {
      await checkSubscription(req);
      const id = parseInt(req.params.id);
      await req.prisma.deliveryVehicle.delete({ 
        where: { id, userId: req.user.id } 
      });
      res.status(200).json({ success: true });
    } catch (err) {
      next(err);
    }
  },
};

// Rental Controller
const rentalController = {
  getAll: async (req, res, next) => {
    try {
      const rentals = await req.prisma.rentalService.findMany({
        where: { userId: req.user.id },
        orderBy: { createdAt: 'desc' },
      });
      res.status(200).json(rentals);
    } catch (err) {
      next(err);
    }
  },

  create: async (req, res, next) => {
    try {
      await checkSubscription(req);
      const { name, category, description, district, photos, pricingModel, price, status } = req.body;
      if (!name) throw new ApiError(400, 'Name is required');

      const rental = await req.prisma.rentalService.create({
        data: { 
          name, category, description, district,
          photos: photos || [],
          pricingModel: pricingModel || 'Daily',
          price: parseFloat(price) || 0,
          status: status || 'Available',
          userId: req.user.id
        },
      });
      res.status(201).json(rental);
    } catch (err) {
      next(err);
    }
  },

  delete: async (req, res, next) => {
    try {
      await checkSubscription(req);
      const id = parseInt(req.params.id);
      await req.prisma.rentalService.delete({ 
        where: { id, userId: req.user.id } 
      });
      res.status(200).json({ success: true });
    } catch (err) {
      next(err);
    }
  },
};

// Stats Controller
const statsController = {
  getStats: async (req, res, next) => {
    try {
      const userId = req.user.id;
      const [workers, vehicles, equipment, territories, rentals] = await Promise.all([
        req.prisma.worker.count({ where: { userId } }),
        req.prisma.deliveryVehicle.count({ where: { userId } }),
        req.prisma.constructionEquipment.count({ where: { userId } }),
        req.prisma.territory.count({ where: { userId } }),
        req.prisma.rentalService.count({ where: { userId } }),
      ]);

      // Fetch recent records for 'Activity' log
      const [recentWorkers, recentVehicles, recentEquip, recentRentals] = await Promise.all([
        req.prisma.worker.findMany({ where: { userId }, take: 5, orderBy: { createdAt: 'desc' } }),
        req.prisma.deliveryVehicle.findMany({ where: { userId }, take: 5, orderBy: { createdAt: 'desc' } }),
        req.prisma.constructionEquipment.findMany({ where: { userId }, take: 5, orderBy: { createdAt: 'desc' } }),
        req.prisma.rentalService.findMany({ where: { userId }, take: 5, orderBy: { createdAt: 'desc' } }),
      ]);

      const recentItems = [
        ...recentWorkers.map(i => ({ ...i, type: 'Personnel', icon: 'Users' })),
        ...recentVehicles.map(i => ({ ...i, type: 'Vehicle', icon: 'Truck' })),
        ...recentEquip.map(i => ({ ...i, type: 'Equipment', icon: 'Wrench' })),
        ...recentRentals.map(i => ({ ...i, type: 'Rental', icon: 'FolderPlus' })),
      ]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);

      res.status(200).json({
        workers,
        vehicles,
        equipment,
        territories,
        rentals,
        recentItems
      });
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
  rentalController,
  statsController,
};