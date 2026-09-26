const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { protect } = require('../middleware/auth.middleware');
const { validateUpdateProfile, validateChangePassword } = require('../middleware/validate.middleware');

// All user routes are protected
router.use(protect);

router.get('/profile', userController.getProfile);
router.put('/profile', validateUpdateProfile, userController.updateProfile);
router.put('/change-password', validateChangePassword, userController.changePassword);

module.exports = router;
