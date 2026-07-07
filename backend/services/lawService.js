const { getLawModel, allowedActs } = require('../models/Law');
const mongoose = require('mongoose');

/**
 * Standard CSV Line Parser
 * Splits comma-separated values, respecting double quotes.
 */
const parseCSVLine = (line) => {
  const result = [];
  let cell = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(cell);
      cell = '';
    } else {
      cell += char;
    }
  }
  result.push(cell);
  return result.map(c => c.trim().replace(/^"|"$/g, ''));
};

/**
 * Normalize heterogeneous document structures to a unified JSON layout
 */
const normalizeLaw = (doc, act) => {
  if (!doc) return null;
  const obj = doc.toObject ? doc.toObject() : doc;
  
  const normalized = {
    id: obj._id,
    act: act.toUpperCase(),
    chapter: obj.chapter,
    chapter_title: obj.chapter_title,
    section: obj.section !== undefined ? obj.section : obj.Section,
    title: obj.section_title || obj.title,
    description: obj.section_desc || obj.description,
    isArchived: obj.isArchived || false,
    isDeleted: obj.isDeleted || false,
    views: obj.views || 0,
    bookmarkCount: obj.bookmarkCount || 0,
    history: obj.history || [],
    createdAt: obj.createdAt,
    updatedAt: obj.updatedAt
  };

  // Special handling for the Hindu Marriage Act (hma) comma-separated field
  const csvField = obj["chapter,section,section_title,section_desc"];
  if (csvField) {
    try {
      const parts = parseCSVLine(csvField);
      normalized.chapter = parts[0] ? parseInt(parts[0], 10) : undefined;
      normalized.section = parts[1] ? parseInt(parts[1], 10) : undefined;
      normalized.title = parts[2] || undefined;
      normalized.description = parts[3] || undefined;
    } catch (err) {
      console.error("Failed parsing HMA CSV fields:", err.message);
    }
  }

  return normalized;
};

/**
 * Map normalized request bodies back to the specific collection schema layout
 */
const mapToCollectionSchema = (normalizedData, act) => {
  const normalizedAct = act.toLowerCase();
  const rawData = {};
  
  if (normalizedAct === 'ipc') {
    if (normalizedData.chapter !== undefined) rawData.chapter = normalizedData.chapter;
    if (normalizedData.chapter_title !== undefined) rawData.chapter_title = normalizedData.chapter_title;
    if (normalizedData.section !== undefined) rawData.Section = normalizedData.section;
    if (normalizedData.title !== undefined) rawData.section_title = normalizedData.title;
    if (normalizedData.description !== undefined) rawData.section_desc = normalizedData.description;
  } else if (['crpc', 'iea', 'nia'].includes(normalizedAct)) {
    if (normalizedData.chapter !== undefined) rawData.chapter = normalizedData.chapter;
    if (normalizedData.section !== undefined) rawData.section = normalizedData.section;
    if (normalizedData.title !== undefined) rawData.section_title = normalizedData.title;
    if (normalizedData.description !== undefined) rawData.section_desc = normalizedData.description;
  } else if (['cpc', 'ida', 'mva'].includes(normalizedAct)) {
    if (normalizedData.section !== undefined) rawData.section = normalizedData.section;
    if (normalizedData.title !== undefined) rawData.title = normalizedData.title;
    if (normalizedData.description !== undefined) rawData.description = normalizedData.description;
  } else if (normalizedAct === 'hma') {
    // If saving to HMA, we rebuild the CSV row string
    const chapterStr = normalizedData.chapter !== undefined ? normalizedData.chapter : '';
    const sectionStr = normalizedData.section !== undefined ? normalizedData.section : '';
    const titleStr = normalizedData.title || '';
    const descStr = normalizedData.description || '';
    
    rawData["chapter,section,section_title,section_desc"] = `${chapterStr},${sectionStr},"${titleStr}","${descStr}"`;
  } else {
    Object.assign(rawData, normalizedData);
  }

  // Common metadata
  if (normalizedData.isArchived !== undefined) rawData.isArchived = normalizedData.isArchived;
  if (normalizedData.isDeleted !== undefined) rawData.isDeleted = normalizedData.isDeleted;
  if (normalizedData.views !== undefined) rawData.views = normalizedData.views;
  if (normalizedData.bookmarkCount !== undefined) rawData.bookmarkCount = normalizedData.bookmarkCount;
  
  return rawData;
};

class LawService {
  /**
   * Fetch all laws from a collection (paginated, sorted, filtered)
   */
  async getAllLaws({ act = 'ipc', page = 1, limit = 10, sort = 'section', isArchived = false, filters = {} }) {
    const LawModel = getLawModel(act);
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skipNum = (pageNum - 1) * limitNum;

    // Filter out soft-deleted records and handle archive toggle
    const dbFilter = {
      isDeleted: { $ne: true }
    };
    if (isArchived === 'true' || isArchived === true) {
      dbFilter.isArchived = true;
    } else {
      dbFilter.isArchived = { $ne: true };
    }

    // Process dynamic query filters (e.g. bailable=true, state=Delhi)
    for (const [key, value] of Object.entries(filters)) {
      // Ignore empty filters
      if (value === undefined || value === '') continue;

      // Handle boolean string conversions
      if (value === 'true') {
        dbFilter[key] = true;
      } else if (value === 'false') {
        dbFilter[key] = false;
      } 
      // Handle search queries inside general filtering if passed
      else if (key === 'search') {
         dbFilter['$or'] = [
            { section_title: new RegExp(value, 'i') },
            { title: new RegExp(value, 'i') },
            { description: new RegExp(value, 'i') }
         ];
      }
      else {
        // Simple case-insensitive exact/regex match for strings
        dbFilter[key] = new RegExp(`^${value}$`, 'i');
      }
    }

    // Construct sort object. E.g., 'section' -> { section: 1 } or '-section' -> { section: -1 }
    const sortField = sort.startsWith('-') ? sort.substring(1) : sort;
    const sortDirection = sort.startsWith('-') ? -1 : 1;
    
    // Support sorting by both 'section' and IPC capitalized 'Section'
    const sortObj = {};
    if (sortField === 'section' && act.toLowerCase() === 'ipc') {
      sortObj.Section = sortDirection;
    } else {
      sortObj[sortField] = sortDirection;
    }

    const [docs, total] = await Promise.all([
      LawModel.find(dbFilter).sort(sortObj).skip(skipNum).limit(limitNum),
      LawModel.countDocuments(dbFilter)
    ]);

    return {
      metadata: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      },
      data: docs.map(doc => normalizeLaw(doc, act))
    };
  }

  /**
   * Fetch a single law by ID (and increment view count)
   */
  async getLawById(act, id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const err = new Error('Invalid Law ID format');
      err.statusCode = 400;
      throw err;
    }

    const LawModel = getLawModel(act);
    
    // Find and increment views in a single database roundtrip
    const doc = await LawModel.findOneAndUpdate(
      { _id: id, isDeleted: { $ne: true } },
      { $inc: { views: 1 } },
      { new: true }
    );

    if (!doc) {
      const err = new Error('Law record not found');
      err.statusCode = 404;
      throw err;
    }

    return normalizeLaw(doc, act);
  }

  /**
   * Create a new law record
   */
  async createLaw(act, lawData) {
    const LawModel = getLawModel(act);
    const rawData = mapToCollectionSchema(lawData, act);
    
    const doc = await LawModel.create(rawData);
    return normalizeLaw(doc, act);
  }

  /**
   * Replace a law record (PUT)
   */
  async replaceLaw(act, id, lawData) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const err = new Error('Invalid Law ID format');
      err.statusCode = 400;
      throw err;
    }

    const LawModel = getLawModel(act);
    const rawData = mapToCollectionSchema(lawData, act);

    // Keep history intact
    const historyEntry = {
      timestamp: new Date(),
      action: 'REPLACE',
      changes: rawData
    };

    const doc = await LawModel.findOneAndUpdate(
      { _id: id, isDeleted: { $ne: true } },
      { 
        $set: rawData,
        $push: { history: historyEntry }
      },
      { new: true, runValidators: true }
    );

    if (!doc) {
      const err = new Error('Law record not found to replace');
      err.statusCode = 404;
      throw err;
    }

    return normalizeLaw(doc, act);
  }

  /**
   * Update partial fields of a law record (PATCH)
   */
  async updateLaw(act, id, lawData) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const err = new Error('Invalid Law ID format');
      err.statusCode = 400;
      throw err;
    }

    const LawModel = getLawModel(act);
    const rawData = mapToCollectionSchema(lawData, act);

    const historyEntry = {
      timestamp: new Date(),
      action: 'UPDATE',
      changes: rawData
    };

    const doc = await LawModel.findOneAndUpdate(
      { _id: id, isDeleted: { $ne: true } },
      { 
        $set: rawData,
        $push: { history: historyEntry }
      },
      { new: true, runValidators: true }
    );

    if (!doc) {
      const err = new Error('Law record not found to update');
      err.statusCode = 404;
      throw err;
    }

    return normalizeLaw(doc, act);
  }

  /**
   * Soft Delete a law record (sets isDeleted to true)
   */
  async deleteLaw(act, id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const err = new Error('Invalid Law ID format');
      err.statusCode = 400;
      throw err;
    }

    const LawModel = getLawModel(act);

    const doc = await LawModel.findOneAndUpdate(
      { _id: id, isDeleted: { $ne: true } },
      { 
        $set: { isDeleted: true },
        $push: { 
          history: { timestamp: new Date(), action: 'SOFT_DELETE' } 
        } 
      },
      { new: true }
    );

    if (!doc) {
      const err = new Error('Law record not found to delete');
      err.statusCode = 404;
      throw err;
    }

    return { success: true, message: `Law successfully soft-deleted.` };
  }

  /**
   * Check if a law exists
   */
  async checkExists(act, id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return { exists: false };
    }
    const LawModel = getLawModel(act);
    const count = await LawModel.countDocuments({ _id: id, isDeleted: { $ne: true } });
    return { exists: count > 0 };
  }

  /**
   * Fetch recently added laws
   */
  async getRecentLaws({ act = 'ipc', page = 1, limit = 10 }) {
    return this.getAllLaws({ act, page, limit, sort: '-createdAt' });
  }

  /**
   * Fetch archived laws
   */
  async getArchivedLaws({ act = 'ipc', page = 1, limit = 10 }) {
    return this.getAllLaws({ act, page, limit, sort: 'section', isArchived: true });
  }

  /**
   * Archive a law record
   */
  async archiveLaw(act, id) {
    return this.updateLaw(act, id, { isArchived: true });
  }

  /**
   * Restore an archived law record
   */
  async restoreLaw(act, id) {
    return this.updateLaw(act, id, { isArchived: false });
  }

  /**
   * Fetch update history of a law record
   */
  async getHistory(act, id) {
    const law = await this.getLawById(act, id);
    return law.history || [];
  }

  /**
   * Fetch summary of a law record (shortened description / mock summary)
   */
  async getSummary(act, id) {
    const law = await this.getLawById(act, id);
    if (!law.description) {
      return { summary: 'No description available to summarize.' };
    }
    
    // Return first 200 characters followed by ellipses as a summary
    const cleanDesc = law.description.replace(/\n\t/g, ' ').replace(/\s+/g, ' ').trim();
    const summary = cleanDesc.length > 200 ? `${cleanDesc.substring(0, 200)}...` : cleanDesc;
    
    return {
      id: law.id,
      title: law.title,
      section: law.section,
      summary
    };
  }

  /**
   * Fetch a random law record
   */
  async getRandomLaw(act) {
    const LawModel = getLawModel(act);
    
    const docs = await LawModel.aggregate([
      { $match: { isDeleted: { $ne: true }, isArchived: { $ne: true } } },
      { $sample: { size: 1 } }
    ]);

    if (!docs || docs.length === 0) {
      const err = new Error('No active law records found in this collection');
      err.statusCode = 404;
      throw err;
    }

    return normalizeLaw(docs[0], act);
  }

  /**
   * Fetch trending law records (sorted by views descending)
   */
  async getTrendingLaws({ act = 'ipc', page = 1, limit = 10 }) {
    return this.getAllLaws({ act, page, limit, sort: '-views' });
  }

  /**
   * Search laws by keyword across a specific act or all acts
   */
  async searchLaws({ q, act = 'ipc', page = 1, limit = 10 }) {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skipNum = (pageNum - 1) * limitNum;

    if (!q) {
      return {
        metadata: { total: 0, page: pageNum, limit: limitNum, totalPages: 0 },
        data: []
      };
    }

    const regex = new RegExp(q, 'i');
    const filter = {
      isDeleted: { $ne: true },
      $or: [
        { section_title: regex },
        { title: regex },
        { section_desc: regex },
        { description: regex },
        { "chapter,section,section_title,section_desc": regex }
      ]
    };

    if (act.toLowerCase() === 'all') {
      const searchPromises = allowedActs.map(async (actName) => {
        const LawModel = getLawModel(actName);
        const docs = await LawModel.find(filter).limit(100);
        return docs.map(doc => normalizeLaw(doc, actName));
      });

      const resultsArray = await Promise.all(searchPromises);
      const allResults = resultsArray.flat();

      const total = allResults.length;
      const paginatedResults = allResults.slice(skipNum, skipNum + limitNum);

      return {
        metadata: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum)
        },
        data: paginatedResults
      };
    } else {
      const LawModel = getLawModel(act);
      const [docs, total] = await Promise.all([
        LawModel.find(filter).skip(skipNum).limit(limitNum),
        LawModel.countDocuments(filter)
      ]);

      return {
        metadata: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum)
        },
        data: docs.map(doc => normalizeLaw(doc, act))
      };
    }
  }

  /**
   * Generic helper to filter laws based on an arbitrary query object
   */
  async filterLaws({ queryObj, act = 'ipc', page = 1, limit = 10, sort = 'section' }) {
    const LawModel = getLawModel(act);
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skipNum = (pageNum - 1) * limitNum;

    const filter = {
      isDeleted: { $ne: true },
      ...queryObj
    };

    const sortField = sort.startsWith('-') ? sort.substring(1) : sort;
    const sortDirection = sort.startsWith('-') ? -1 : 1;
    
    const sortObj = {};
    if (sortField === 'section' && act.toLowerCase() === 'ipc') {
      sortObj.Section = sortDirection;
    } else {
      sortObj[sortField] = sortDirection;
    }

    const [docs, total] = await Promise.all([
      LawModel.find(filter).sort(sortObj).skip(skipNum).limit(limitNum),
      LawModel.countDocuments(filter)
    ]);

    return {
      metadata: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      },
      data: docs.map(doc => normalizeLaw(doc, act))
    };
  }

  /**
   * Most bookmarked laws
   */
  async getMostBookmarked({ act = 'ipc', limit = 10 }) {
    const limitNum = parseInt(limit, 10) || 10;
    if (act.toLowerCase() === 'all') {
      const promises = allowedActs.map(async (actName) => {
        const LawModel = getLawModel(actName);
        const docs = await LawModel.find({ isDeleted: { $ne: true } }).sort({ bookmarkCount: -1 }).limit(limitNum);
        return docs.map(doc => normalizeLaw(doc, actName));
      });
      const results = await Promise.all(promises);
      return results.flat().sort((a, b) => (b.bookmarkCount || 0) - (a.bookmarkCount || 0)).slice(0, limitNum);
    } else {
      const LawModel = getLawModel(act);
      const docs = await LawModel.find({ isDeleted: { $ne: true } }).sort({ bookmarkCount: -1 }).limit(limitNum);
      return docs.map(doc => normalizeLaw(doc, act));
    }
  }

  /**
   * Analytics by Category
   */
  async getAnalyticsByCategory({ act = 'ipc' }) {
    const resolveByCategory = async (actName) => {
      const LawModel = getLawModel(actName);
      const docs = await LawModel.find({ isDeleted: { $ne: true } }, { category: 1, offenseCategory: 1, chapter_title: 1, views: 1 });
      const stats = {};
      docs.forEach(doc => {
        let cat = doc.category || doc.offenseCategory || doc.chapter_title || 'Uncategorized';
        if (cat && typeof cat === 'string') {
          cat = cat.charAt(0).toUpperCase() + cat.slice(1);
        }
        if (!stats[cat]) stats[cat] = { count: 0, totalViews: 0 };
        stats[cat].count++;
        stats[cat].totalViews += (doc.views || 0);
      });
      return Object.keys(stats).map(cat => ({
        category: cat,
        count: stats[cat].count,
        totalViews: stats[cat].totalViews
      }));
    };

    if (act.toLowerCase() === 'all') {
      const promises = allowedActs.map(actName => resolveByCategory(actName));
      const results = await Promise.all(promises);
      const merged = {};
      results.flat().forEach(item => {
        if (!merged[item.category]) merged[item.category] = { count: 0, totalViews: 0 };
        merged[item.category].count += item.count;
        merged[item.category].totalViews += item.totalViews;
      });
      return Object.keys(merged).map(cat => ({
        category: cat,
        count: merged[cat].count,
        totalViews: merged[cat].totalViews
      }));
    } else {
      return resolveByCategory(act);
    }
  }

  /**
   * Analytics by State
   */
  async getAnalyticsByState({ act = 'ipc' }) {
    const resolveByState = async (actName) => {
      const LawModel = getLawModel(actName);
      const docs = await LawModel.find({ isDeleted: { $ne: true } }, { state: 1, views: 1 });
      const stats = {};
      docs.forEach(doc => {
        const state = doc.state || 'National';
        stats[state] = (stats[state] || 0) + 1;
      });
      return Object.keys(stats).map(state => ({ state, count: stats[state] }));
    };

    if (act.toLowerCase() === 'all') {
      const promises = allowedActs.map(actName => resolveByState(actName));
      const results = await Promise.all(promises);
      const merged = {};
      results.flat().forEach(item => {
        merged[item.state] = (merged[item.state] || 0) + item.count;
      });
      return Object.keys(merged).map(state => ({ state, count: merged[state] }));
    } else {
      return resolveByState(act);
    }
  }

  /**
   * Analytics by Court
   */
  async getAnalyticsByCourt({ act = 'ipc' }) {
    const resolveByCourt = async (actName) => {
      const LawModel = getLawModel(actName);
      const docs = await LawModel.find({ isDeleted: { $ne: true } }, { court: 1, courtName: 1 });
      const stats = {};
      docs.forEach(doc => {
        const court = doc.court || doc.courtName || 'None';
        stats[court] = (stats[court] || 0) + 1;
      });
      return Object.keys(stats).map(court => ({ court, count: stats[court] }));
    };

    if (act.toLowerCase() === 'all') {
      const promises = allowedActs.map(actName => resolveByCourt(actName));
      const results = await Promise.all(promises);
      const merged = {};
      results.flat().forEach(item => {
        merged[item.court] = (merged[item.court] || 0) + item.count;
      });
      return Object.keys(merged).map(court => ({ court, count: merged[court] }));
    } else {
      return resolveByCourt(act);
    }
  }

  /**
   * Recent Updates
   */
  async getRecentUpdates({ act = 'ipc', limit = 10 }) {
    const limitNum = parseInt(limit, 10) || 10;
    if (act.toLowerCase() === 'all') {
      const promises = allowedActs.map(async (actName) => {
        const LawModel = getLawModel(actName);
        const docs = await LawModel.find({ isDeleted: { $ne: true }, "history.0": { $exists: true } })
          .sort({ updatedAt: -1 })
          .limit(limitNum);
        return docs.map(doc => normalizeLaw(doc, actName));
      });
      const results = await Promise.all(promises);
      return results.flat().sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, limitNum);
    } else {
      const LawModel = getLawModel(act);
      const docs = await LawModel.find({ isDeleted: { $ne: true }, "history.0": { $exists: true } })
        .sort({ updatedAt: -1 })
        .limit(limitNum);
      return docs.map(doc => normalizeLaw(doc, act));
    }
  }

  /**
   * Popularity Metrics
   */
  async getPopularityMetrics({ act = 'ipc', limit = 10 }) {
    const limitNum = parseInt(limit, 10) || 10;
    const fetchPopular = async (actName) => {
      const LawModel = getLawModel(actName);
      const docs = await LawModel.find({ isDeleted: { $ne: true } });
      return docs.map(doc => {
        const normalized = normalizeLaw(doc, actName);
        normalized.popularityScore = (normalized.views || 0) + (normalized.bookmarkCount || 0) * 5;
        return normalized;
      });
    };

    let all = [];
    if (act.toLowerCase() === 'all') {
      const promises = allowedActs.map(actName => fetchPopular(actName));
      const results = await Promise.all(promises);
      all = results.flat();
    } else {
      all = await fetchPopular(act);
    }

    return all.sort((a, b) => b.popularityScore - a.popularityScore).slice(0, limitNum);
  }

  /**
   * Complexity Distribution
   */
  async getComplexityDistribution({ act = 'ipc' }) {
    const fetchComplexity = async (actName) => {
      const LawModel = getLawModel(actName);
      const docs = await LawModel.find({ isDeleted: { $ne: true } }, { description: 1, section_desc: 1 });
      const counts = { simple: 0, medium: 0, complex: 0 };
      docs.forEach(doc => {
        const desc = doc.description || doc.section_desc || "";
        const len = desc.length;
        if (len < 150) counts.simple++;
        else if (len < 600) counts.medium++;
        else counts.complex++;
      });
      return counts;
    };

    if (act.toLowerCase() === 'all') {
      const promises = allowedActs.map(actName => fetchComplexity(actName));
      const results = await Promise.all(promises);
      const totals = { simple: 0, medium: 0, complex: 0 };
      results.forEach(counts => {
        totals.simple += counts.simple;
        totals.medium += counts.medium;
        totals.complex += counts.complex;
      });
      return totals;
    } else {
      return fetchComplexity(act);
    }
  }

  /**
   * Stats: Total Count
   */
  async getStatsCount({ act = 'ipc' }) {
    if (act.toLowerCase() === 'all') {
      const counts = await Promise.all(allowedActs.map(actName => getLawModel(actName).countDocuments({})));
      return { total: counts.reduce((acc, curr) => acc + curr, 0) };
    } else {
      const count = await getLawModel(act).countDocuments({});
      return { total: count };
    }
  }

  /**
   * Stats: Active Count
   */
  async getStatsActive({ act = 'ipc' }) {
    const filter = { isDeleted: { $ne: true }, isArchived: { $ne: true } };
    if (act.toLowerCase() === 'all') {
      const counts = await Promise.all(allowedActs.map(actName => getLawModel(actName).countDocuments(filter)));
      return { active: counts.reduce((acc, curr) => acc + curr, 0) };
    } else {
      const count = await getLawModel(act).countDocuments(filter);
      return { active: count };
    }
  }

  /**
   * Stats: Repealed Count
   */
  async getStatsRepealed({ act = 'ipc' }) {
    const filter = {
      $or: [
        { isRepealed: true },
        { repealed: true },
        { status: /repealed/i }
      ]
    };
    if (act.toLowerCase() === 'all') {
      const counts = await Promise.all(allowedActs.map(actName => getLawModel(actName).countDocuments(filter)));
      return { repealed: counts.reduce((acc, curr) => acc + curr, 0) };
    } else {
      const count = await getLawModel(act).countDocuments(filter);
      return { repealed: count };
    }
  }

  /**
   * Stats: Count by Act
   */
  async getStatsByAct() {
    const counts = await Promise.all(allowedActs.map(async (actName) => {
      const count = await getLawModel(actName).countDocuments({ isDeleted: { $ne: true } });
      return { act: actName.toUpperCase(), count };
    }));
    return counts;
  }

  /**
   * Stats: Count by Category
   */
  async getStatsByCategory({ act = 'ipc' }) {
    return this.getAnalyticsByCategory({ act });
  }

  /**
   * Stats: Count by State
   */
  async getStatsByState({ act = 'ipc' }) {
    return this.getAnalyticsByState({ act });
  }

  /**
   * Stats: Count by Court
   */
  async getStatsByCourt({ act = 'ipc' }) {
    return this.getAnalyticsByCourt({ act });
  }

  /**
   * Stats: Recent Laws Count
   */
  async getStatsRecent({ act = 'ipc', days = 30 }) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(days, 10));
    
    const filter = {
      isDeleted: { $ne: true },
      createdAt: { $gte: cutoffDate }
    };

    if (act.toLowerCase() === 'all') {
      const counts = await Promise.all(allowedActs.map(actName => getLawModel(actName).countDocuments(filter)));
      return { recent: counts.reduce((acc, curr) => acc + curr, 0), days };
    } else {
      const count = await getLawModel(act).countDocuments(filter);
      return { recent: count, days };
    }
  }

  /**
   * Stats: Trending Metrics
   */
  async getStatsTrending({ act = 'ipc' }) {
    const fetchTrendingStats = async (actName) => {
      const LawModel = getLawModel(actName);
      const docs = await LawModel.find({ isDeleted: { $ne: true } }, { views: 1, title: 1, section_title: 1, section: 1, Section: 1 });
      let totalViews = 0;
      let maxViews = 0;
      let highestViewedDoc = null;
      
      docs.forEach(doc => {
        const v = doc.views || 0;
        totalViews += v;
        if (v >= maxViews) {
          maxViews = v;
          highestViewedDoc = doc;
        }
      });

      const avgViews = docs.length > 0 ? (totalViews / docs.length) : 0;
      return {
        act: actName.toUpperCase(),
        totalViews,
        avgViews: Math.round(avgViews * 100) / 100,
        highestViewed: highestViewedDoc ? {
          id: highestViewedDoc._id,
          section: highestViewedDoc.section || highestViewedDoc.Section,
          title: highestViewedDoc.title || highestViewedDoc.section_title || 'Unnamed',
          views: maxViews
        } : null
      };
    };

    if (act.toLowerCase() === 'all') {
      const stats = await Promise.all(allowedActs.map(actName => fetchTrendingStats(actName)));
      return stats;
    } else {
      return fetchTrendingStats(act);
    }
  }

  /**
   * Stats: Bookmark Metrics
   */
  async getStatsBookmarks({ act = 'ipc' }) {
    const fetchBookmarkStats = async (actName) => {
      const LawModel = getLawModel(actName);
      const docs = await LawModel.find({ isDeleted: { $ne: true } }, { bookmarkCount: 1 });
      let totalBookmarks = 0;
      docs.forEach(doc => {
        totalBookmarks += (doc.bookmarkCount || 0);
      });
      const avgBookmarks = docs.length > 0 ? (totalBookmarks / docs.length) : 0;
      return {
        act: actName.toUpperCase(),
        totalBookmarks,
        avgBookmarks: Math.round(avgBookmarks * 100) / 100
      };
    };

    if (act.toLowerCase() === 'all') {
      const stats = await Promise.all(allowedActs.map(actName => fetchBookmarkStats(actName)));
      return stats;
    } else {
      return fetchBookmarkStats(act);
    }
  }
}

module.exports = new LawService();


