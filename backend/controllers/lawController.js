const lawService = require('../services/lawService');

class LawController {
  // GET /api/v1/laws
  getAllLaws = async (req, res) => {
    // Extract explicitly known pagination/sorting fields, then capture the rest as generic filters
    const { act = 'ipc', page, limit, sort, isArchived, ...filters } = req.query;
    
    // Pass the extracted dynamic filters down to the service layer
    const result = await lawService.getAllLaws({ act, page, limit, sort, isArchived, filters });
    
    res.status(200).json({
      success: true,
      message: `Retrieved ${act.toUpperCase()} law records successfully.`,
      metadata: result.metadata,
      data: result.data
    });
  };

  // GET /api/v1/laws/:id
  getLawById = async (req, res) => {
    const { id } = req.params;
    const { act = 'ipc' } = req.query;
    const data = await lawService.getLawById(act, id);
    res.status(200).json({
      success: true,
      message: `Retrieved ${act.toUpperCase()} law by ID successfully.`,
      data
    });
  };

  // POST /api/v1/laws
  createLaw = async (req, res) => {
    const { act = 'ipc' } = req.query;
    const data = await lawService.createLaw(act, req.body);
    res.status(201).json({
      success: true,
      message: `Created new record in ${act.toUpperCase()} collection successfully.`,
      data
    });
  };

  // PUT /api/v1/laws/:id
  replaceLaw = async (req, res) => {
    const { id } = req.params;
    const { act = 'ipc' } = req.query;
    const data = await lawService.replaceLaw(act, id, req.body);
    res.status(200).json({
      success: true,
      message: `Replaced ${act.toUpperCase()} law record successfully.`,
      data
    });
  };

  // PATCH /api/v1/laws/:id
  updateLaw = async (req, res) => {
    const { id } = req.params;
    const { act = 'ipc' } = req.query;
    const data = await lawService.updateLaw(act, id, req.body);
    res.status(200).json({
      success: true,
      message: `Updated ${act.toUpperCase()} law record successfully.`,
      data
    });
  };

  // DELETE /api/v1/laws/:id
  deleteLaw = async (req, res) => {
    const { id } = req.params;
    const { act = 'ipc' } = req.query;
    const result = await lawService.deleteLaw(act, id);
    res.status(200).json({
      success: true,
      message: result.message
    });
  };

  // GET /api/v1/laws/exists/:id
  checkExists = async (req, res) => {
    const { id } = req.params;
    const { act = 'ipc' } = req.query;
    const result = await lawService.checkExists(act, id);
    res.status(200).json({
      success: true,
      message: `Existence check for ${act.toUpperCase()} ID completed.`,
      data: result
    });
  };

  // GET /api/v1/laws/recent
  getRecentLaws = async (req, res) => {
    const { act = 'ipc', page, limit } = req.query;
    const result = await lawService.getRecentLaws({ act, page, limit });
    res.status(200).json({
      success: true,
      message: `Retrieved recent ${act.toUpperCase()} laws successfully.`,
      metadata: result.metadata,
      data: result.data
    });
  };

  // GET /api/v1/laws/archived
  getArchivedLaws = async (req, res) => {
    const { act = 'ipc', page, limit } = req.query;
    const result = await lawService.getArchivedLaws({ act, page, limit });
    res.status(200).json({
      success: true,
      message: `Retrieved archived ${act.toUpperCase()} laws successfully.`,
      metadata: result.metadata,
      data: result.data
    });
  };

  // PATCH /api/v1/laws/:id/archive
  archiveLaw = async (req, res) => {
    const { id } = req.params;
    const { act = 'ipc' } = req.query;
    const data = await lawService.archiveLaw(act, id);
    res.status(200).json({
      success: true,
      message: `Archived ${act.toUpperCase()} law successfully.`,
      data
    });
  };

  // PATCH /api/v1/laws/:id/restore
  restoreLaw = async (req, res) => {
    const { id } = req.params;
    const { act = 'ipc' } = req.query;
    const data = await lawService.restoreLaw(act, id);
    res.status(200).json({
      success: true,
      message: `Restored archived ${act.toUpperCase()} law successfully.`,
      data
    });
  };

  // GET /api/v1/laws/:id/history
  getHistory = async (req, res) => {
    const { id } = req.params;
    const { act = 'ipc' } = req.query;
    const data = await lawService.getHistory(act, id);
    res.status(200).json({
      success: true,
      message: `Retrieved update history successfully.`,
      data
    });
  };

  // GET /api/v1/laws/:id/summary
  getSummary = async (req, res) => {
    const { id } = req.params;
    const { act = 'ipc' } = req.query;
    const data = await lawService.getSummary(act, id);
    res.status(200).json({
      success: true,
      message: `Retrieved summary for ${act.toUpperCase()} law successfully.`,
      data
    });
  };

  // GET /api/v1/laws/random
  getRandomLaw = async (req, res) => {
    const { act = 'ipc' } = req.query;
    const data = await lawService.getRandomLaw(act);
    res.status(200).json({
      success: true,
      message: `Retrieved a random ${act.toUpperCase()} law record successfully.`,
      data
    });
  };

  // GET /api/v1/laws/trending
  getTrendingLaws = async (req, res) => {
    const { act = 'ipc', page, limit } = req.query;
    const result = await lawService.getTrendingLaws({ act, page, limit });
    res.status(200).json({
      success: true,
      message: `Retrieved trending ${act.toUpperCase()} laws successfully.`,
      metadata: result.metadata,
      data: result.data
    });
  };
  // PATCH /api/v1/laws/:id/bookmark
  toggleBookmark = async (req, res) => {
    const { id } = req.params;
    const { act = 'ipc' } = req.query;
    const userId = req.user.id; // Available from protect middleware

    const User = require('../models/User');
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Validate the law exists
    const law = await lawService.getLawById(act, id);
    if (!law) return res.status(404).json({ success: false, message: 'Law not found' });

    const isBookmarked = user.bookmarks.includes(id);

    if (isBookmarked) {
      user.bookmarks = user.bookmarks.filter(b => b.toString() !== id);
      await lawService.updateLaw(act, id, { bookmarkCount: Math.max(0, (law.bookmarkCount || 1) - 1) });
    } else {
      user.bookmarks.push(id);
      await lawService.updateLaw(act, id, { bookmarkCount: (law.bookmarkCount || 0) + 1 });
    }

    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: isBookmarked ? 'Bookmark removed successfully.' : 'Bookmark added successfully.',
      bookmarks: user.bookmarks
    });
  };
}

module.exports = new LawController();


