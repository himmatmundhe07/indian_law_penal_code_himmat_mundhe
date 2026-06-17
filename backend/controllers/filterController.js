const lawService = require('../services/lawService');

class FilterController {
  // GET /api/v1/laws/filter/act/:actName
  filterByAct = async (req, res) => {
    const { actName } = req.params;
    const { page, limit, sort, isArchived } = req.query;
    const result = await lawService.getAllLaws({ act: actName, page, limit, sort, isArchived });
    res.status(200).json({
      success: true,
      message: `Filtered by act ${actName.toUpperCase()} successfully.`,
      metadata: result.metadata,
      data: result.data
    });
  };

  // GET /api/v1/laws/filter/chapter/:chapterId
  filterByChapter = async (req, res) => {
    const { chapterId } = req.params;
    const { act = 'ipc', page, limit, sort } = req.query;
    const chapNum = parseInt(chapterId, 10);
    const queryObj = isNaN(chapNum)
      ? { chapter_title: new RegExp(chapterId, 'i') }
      : {
          $or: [
            { chapter: chapNum },
            { "chapter,section,section_title,section_desc": new RegExp(`^${chapNum},`, 'i') }
          ]
        };
    const result = await lawService.filterLaws({ queryObj, act, page, limit, sort });
    res.status(200).json({
      success: true,
      message: `Filtered by chapter "${chapterId}" successfully.`,
      metadata: result.metadata,
      data: result.data
    });
  };

  // GET /api/v1/laws/filter/section/:sectionNumber
  filterBySection = async (req, res) => {
    const { sectionNumber } = req.params;
    const { act = 'ipc', page, limit, sort } = req.query;
    const secNum = parseInt(sectionNumber, 10);
    const queryObj = isNaN(secNum)
      ? {
          $or: [
            { section_title: new RegExp(sectionNumber, 'i') },
            { title: new RegExp(sectionNumber, 'i') }
          ]
        }
      : {
          $or: [
            { section: secNum },
            { Section: secNum },
            { "chapter,section,section_title,section_desc": new RegExp(`^\\d+,${secNum},`, 'i') }
          ]
        };
    const result = await lawService.filterLaws({ queryObj, act, page, limit, sort });
    res.status(200).json({
      success: true,
      message: `Filtered by section "${sectionNumber}" successfully.`,
      metadata: result.metadata,
      data: result.data
    });
  };

  // GET /api/v1/laws/filter/state/:state
  filterByState = async (req, res) => {
    const { state } = req.params;
    const { act = 'ipc', page, limit, sort } = req.query;
    const queryObj = { state: new RegExp(state, 'i') };
    const result = await lawService.filterLaws({ queryObj, act, page, limit, sort });
    res.status(200).json({
      success: true,
      message: `Filtered by state "${state}" successfully.`,
      metadata: result.metadata,
      data: result.data
    });
  };

  // GET /api/v1/laws/filter/court/:courtName
  filterByCourt = async (req, res) => {
    const { courtName } = req.params;
    const { act = 'ipc', page, limit, sort } = req.query;
    const queryObj = {
      $or: [
        { court: new RegExp(courtName, 'i') },
        { courtName: new RegExp(courtName, 'i') }
      ]
    };
    const result = await lawService.filterLaws({ queryObj, act, page, limit, sort });
    res.status(200).json({
      success: true,
      message: `Filtered by court "${courtName}" successfully.`,
      metadata: result.metadata,
      data: result.data
    });
  };

  // GET /api/v1/laws/filter/status/:status
  filterByStatus = async (req, res) => {
    const { status } = req.params;
    const { act = 'ipc', page, limit, sort } = req.query;
    const queryObj = { status: new RegExp(status, 'i') };
    const result = await lawService.filterLaws({ queryObj, act, page, limit, sort });
    res.status(200).json({
      success: true,
      message: `Filtered by status "${status}" successfully.`,
      metadata: result.metadata,
      data: result.data
    });
  };

  // GET /api/v1/laws/filter/category/:category
  filterByCategory = async (req, res) => {
    const { category } = req.params;
    const { act = 'ipc', page, limit, sort } = req.query;
    const queryObj = {
      $or: [
        { category: new RegExp(category, 'i') },
        { offenseCategory: new RegExp(category, 'i') },
        { chapter_title: new RegExp(category, 'i') }
      ]
    };
    const result = await lawService.filterLaws({ queryObj, act, page, limit, sort });
    res.status(200).json({
      success: true,
      message: `Filtered by category "${category}" successfully.`,
      metadata: result.metadata,
      data: result.data
    });
  };

  // GET /api/v1/laws/filter/punishment/:type
  filterByPunishment = async (req, res) => {
    const { type } = req.params;
    const { act = 'ipc', page, limit, sort } = req.query;
    const queryObj = {
      $or: [
        { punishment: new RegExp(type, 'i') },
        { punishmentType: new RegExp(type, 'i') }
      ]
    };
    const result = await lawService.filterLaws({ queryObj, act, page, limit, sort });
    res.status(200).json({
      success: true,
      message: `Filtered by punishment type "${type}" successfully.`,
      metadata: result.metadata,
      data: result.data
    });
  };

  // GET /api/v1/laws/filter/bailable/:value
  filterByBailable = async (req, res) => {
    const { value } = req.params;
    const { act = 'ipc', page, limit, sort } = req.query;
    const isBailable = value === 'true';
    const queryObj = {
      $or: [
        { bailable: isBailable },
        { classification: new RegExp(isBailable ? '\\bbailable\\b' : 'non-bailable', 'i') }
      ]
    };
    const result = await lawService.filterLaws({ queryObj, act, page, limit, sort });
    res.status(200).json({
      success: true,
      message: `Filtered by bailable="${value}" successfully.`,
      metadata: result.metadata,
      data: result.data
    });
  };

  // GET /api/v1/laws/filter/cognizable/:value
  filterByCognizable = async (req, res) => {
    const { value } = req.params;
    const { act = 'ipc', page, limit, sort } = req.query;
    const isCognizable = value === 'true';
    const queryObj = {
      $or: [
        { cognizable: isCognizable },
        { classification: new RegExp(isCognizable ? '\\bcognizable\\b' : 'non-cognizable', 'i') }
      ]
    };
    const result = await lawService.filterLaws({ queryObj, act, page, limit, sort });
    res.status(200).json({
      success: true,
      message: `Filtered by cognizable="${value}" successfully.`,
      metadata: result.metadata,
      data: result.data
    });
  };

  // GET /api/v1/laws/filter/repealed
  filterRepealed = async (req, res) => {
    const { act = 'ipc', page, limit, sort } = req.query;
    const queryObj = {
      $or: [
        { isRepealed: true },
        { repealed: true },
        { status: /repealed/i }
      ]
    };
    const result = await lawService.filterLaws({ queryObj, act, page, limit, sort });
    res.status(200).json({
      success: true,
      message: `Retrieved repealed laws successfully.`,
      metadata: result.metadata,
      data: result.data
    });
  };

  // GET /api/v1/laws/filter/constitutional
  filterConstitutional = async (req, res) => {
    const { act = 'ipc', page, limit, sort } = req.query;
    const queryObj = {
      $or: [
        { isConstitutional: true },
        { constitutional: true },
        { category: /constitutional/i }
      ]
    };
    const result = await lawService.filterLaws({ queryObj, act, page, limit, sort });
    res.status(200).json({
      success: true,
      message: `Retrieved constitutional laws successfully.`,
      metadata: result.metadata,
      data: result.data
    });
  };
}

module.exports = new FilterController();
