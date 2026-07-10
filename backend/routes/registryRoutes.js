const express = require('express');
const router = express.Router();
const registryController = require('../controllers/registryController');

// Public route to list registered entities
router.get('/list', registryController.getRegistryList);

// Public route to search & verify certificate/registration
router.get('/verify', registryController.verifyRegistration);

module.exports = router;
