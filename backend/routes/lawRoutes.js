const express = require('express');
const router = express.Router();
const lawController = require('../controllers/lawController');
const asyncHandler = require('../middlewares/asyncHandler');
const { validateLaw, validateLawUpdate } = require('../middlewares/validators');
const { protect, authorize } = require('../middlewares/authMiddleware');

// 1. Static and Specific GET Routes (placed above dynamic ID paths)
router.get('/', asyncHandler(lawController.getAllLaws));
router.get('/recent', asyncHandler(lawController.getRecentLaws));
router.get('/archived', asyncHandler(lawController.getArchivedLaws));
router.get('/random', asyncHandler(lawController.getRandomLaw));
router.get('/trending', asyncHandler(lawController.getTrendingLaws));
// 2. Specific Parameter Routes (placed above general ID path)
router.get('/exists/:id', asyncHandler(lawController.checkExists));

// 3. General ID Parameter GET Routes
router.get('/:id', asyncHandler(lawController.getLawById));

// 4. Mutation Routes (POST, PUT, PATCH, DELETE)
router.post('/', protect, authorize('admin'), validateLaw, asyncHandler(lawController.createLaw));
router.put('/:id', protect, authorize('admin'), validateLawUpdate, asyncHandler(lawController.replaceLaw));
router.patch('/:id', protect, authorize('admin'), validateLawUpdate, asyncHandler(lawController.updateLaw));
router.delete('/:id', protect, authorize('admin'), asyncHandler(lawController.deleteLaw));

// 5. Nested Resource / Action PATCH/GET Routes
router.patch('/:id/archive', protect, authorize('admin'), asyncHandler(lawController.archiveLaw));
router.patch('/:id/restore', protect, authorize('admin'), asyncHandler(lawController.restoreLaw));
router.get('/:id/history', asyncHandler(lawController.getHistory));
router.get('/:id/summary', asyncHandler(lawController.getSummary));
router.patch('/:id/bookmark', protect, asyncHandler(lawController.toggleBookmark));



module.exports = router;
