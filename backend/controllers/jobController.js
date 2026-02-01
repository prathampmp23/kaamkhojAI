const Job = require('../models/job');
const User = require('../models/user');
const AuthUser = require('../models/authUser');
const mongoose = require('mongoose');

// Treat legacy jobs that have no `status` field as active.
const activeStatusQuery = {
  $or: [{ status: 'active' }, { status: { $exists: false } }, { status: null }],
};

const withActiveStatus = (extra = {}) => ({ $and: [activeStatusQuery, extra] });

const parseObjectIdList = (value) => {
  if (!value || typeof value !== 'string') return [];
  return value
    .split(',')
    .map((s) => s.trim())
    .filter((s) => /^[a-fA-F0-9]{24}$/.test(s))
    .map((s) => new mongoose.Types.ObjectId(s));
};

const attachJobContacts = async (jobs) => {
  const list = Array.isArray(jobs) ? jobs : [];
  if (list.length === 0) return [];

  const postedByIds = Array.from(
    new Set(
      list
        .map((j) => {
          const postedBy = j?.postedBy;
          if (!postedBy) return null;
          // Handle ObjectId and string
          const s = typeof postedBy === 'string' ? postedBy : postedBy.toString?.();
          return s && /^[a-fA-F0-9]{24}$/.test(s) ? s : null;
        })
        .filter(Boolean)
    )
  );

  if (postedByIds.length === 0) {
    return list.map((j) => (typeof j?.toObject === 'function' ? j.toObject() : { ...j, contactPhone: null }));
  }

  const authUsers = await AuthUser.find({ _id: { $in: postedByIds } }).select('phone');
  const phoneMap = new Map(authUsers.map((u) => [u._id.toString(), u.phone || null]));

  return list.map((j) => {
    const obj = typeof j?.toObject === 'function' ? j.toObject() : { ...j };
    const postedBy = obj.postedBy;
    const postedByStr = typeof postedBy === 'string' ? postedBy : postedBy?.toString?.();
    const contactPhone = obj.contactPhone || (postedByStr ? phoneMap.get(postedByStr) || null : null);
    return { ...obj, contactPhone };
  });
};

const escapeRegex = (value) => String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const parseMinSalaryFromString = (salaryRaw) => {
  const s = String(salaryRaw || '').replace(/,/g, ' ');
  if (!s) return null;
  const kMatch = s.match(/(\d+(?:\.\d+)?)\s*k\b/i);
  if (kMatch) {
    const n = Number(kMatch[1]);
    return Number.isFinite(n) ? Math.round(n * 1000) : null;
  }
  const nums = s.match(/\d{3,6}/g);
  if (!nums || nums.length === 0) return null;
  const values = nums.map((x) => Number(x)).filter((n) => Number.isFinite(n));
  if (values.length === 0) return null;
  return Math.min(...values);
};

// GET /api/jobs/search?location=&category=&availability=&q=&minSalary=&limit=
exports.searchJobs = async (req, res) => {
  try {
    const {
      location = '',
      category = '',
      availability = '',
      q = '',
      minSalary = '',
      limit = '20',
    } = req.query || {};

    const pageLimit = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
    const and = [activeStatusQuery];

    if (location) {
      and.push({ location: { $regex: escapeRegex(location), $options: 'i' } });
    }
    if (category) {
      and.push({ category: String(category).trim() });
    }
    if (availability) {
      and.push({ availability: String(availability).trim() });
    }

    if (q) {
      const re = new RegExp(escapeRegex(q), 'i');
      and.push({
        $or: [
          { jobName: re },
          { company: re },
          { jobDescription: re },
          { location: re },
          { category: re },
        ],
      });
    }

    const mongoQuery = and.length > 1 ? { $and: and } : activeStatusQuery;

    let jobs = await Job.find(mongoQuery).sort({ createdAt: -1 }).limit(pageLimit);

    const minSalaryNum = minSalary !== '' ? Number(minSalary) : null;
    if (Number.isFinite(minSalaryNum) && minSalaryNum !== null) {
      jobs = jobs.filter((job) => {
        const parsed = parseMinSalaryFromString(job?.salary);
        return parsed !== null && parsed >= minSalaryNum;
      });
    }

    jobs = await attachJobContacts(jobs);
    return res.status(200).json({ success: true, count: jobs.length, jobs });
  } catch (error) {
    console.error('[ERROR searchJobs]', error);
    return res.status(500).json({ success: false, message: 'Failed to search jobs', error: error.message });
  }
};

// Helper: Calculate distance between two coordinates (Haversine formula)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in km
};

// Helper: Parse location string to coordinates
const parseLocation = (locationString) => {
  if (!locationString) return null;
  
  const coordMatch = locationString.match(/(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)/);
  if (coordMatch) {
    return {
      lat: parseFloat(coordMatch[1]),
      lon: parseFloat(coordMatch[2])
    };
  }
  
  return null;
};

// ULTRA-STRICT: Check if job EXACTLY matches worker's category
const isExactCategoryMatch = (job, worker) => {
  if (!worker.job_title || !job.category) return false;
  
  const workerJobTitle = worker.job_title.toLowerCase().trim();
  const jobCategory = job.category.toLowerCase().trim();
  const jobName = (job.jobName || '').toLowerCase().trim();
  
  // EXACT category match
  if (jobCategory === workerJobTitle) return true;
  
  // Job name exactly matches or contains worker's title as main word
  if (jobName === workerJobTitle) return true;
  if (jobName.startsWith(workerJobTitle + ' ')) return true;
  if (jobName.endsWith(' ' + workerJobTitle)) return true;
  if (jobName.includes(' ' + workerJobTitle + ' ')) return true;
  
  return false;
};

// Helper: Check if job is related but not exact match
const isRelatedJob = (job, worker) => {
  if (!worker.job_title || !job.category) return false;
  
  const workerJobTitle = worker.job_title.toLowerCase().trim();
  const jobCategory = job.category.toLowerCase().trim();
  const jobName = (job.jobName || '').toLowerCase().trim();
  
  // Define closely related roles
  const relatedRoles = {
    'driver': ['delivery', 'transport', 'vehicle', 'logistics'],
    'electrician': ['electrical', 'wiring', 'maintenance', 'technician'],
    'plumber': ['plumbing', 'pipe', 'water', 'sanitation'],
    'cook': ['chef', 'kitchen', 'food', 'culinary'],
    'cleaner': ['cleaning', 'housekeeping', 'janitor', 'sanitization'],
    'security': ['guard', 'watchman', 'safety', 'surveillance'],
    'construction': ['builder', 'mason', 'carpenter', 'contractor'],
    'gardener': ['landscaping', 'plants', 'garden', 'horticulture'],
    'factory': ['manufacturing', 'production', 'assembly', 'operator'],
    'office-helper': ['assistant', 'clerk', 'admin', 'support']
  };
  
  const relatedKeywords = relatedRoles[workerJobTitle] || [];
  
  // Check if job name or category contains related keywords
  return relatedKeywords.some(keyword => 
    jobName.includes(keyword) || jobCategory.includes(keyword)
  );
};

// IMPROVED: Calculate detailed job score with multiple factors
const calculateJobScore = (job, worker) => {
  let score = 0;
  
  // Experience match (30 points)
  if (job.experience && worker.experience !== undefined) {
    const expMatch = job.experience.match(/(\d+)/);
    const jobExpRequired = expMatch ? parseInt(expMatch[0]) : 0;
    
    if (worker.experience >= jobExpRequired + 2) {
      score += 30; // Overqualified
    } else if (worker.experience >= jobExpRequired) {
      score += 30; // Perfect match
    } else if (worker.experience >= jobExpRequired - 1) {
      score += 20; // Close enough
    } else {
      score += 5; // Underqualified
    }
  } else {
    score += 15;
  }
  
  // Shift/Availability match (30 points)
  if (job.availability && worker.shift_time) {
    const jobAvail = job.availability.toLowerCase();
    const workerShift = worker.shift_time.toLowerCase();
    
    if (workerShift === 'flexible' || workerShift === 'any') {
      score += 30;
    } else if (jobAvail === workerShift) {
      score += 30; // Exact match
    } else if (jobAvail.includes(workerShift) || workerShift.includes(jobAvail)) {
      score += 25;
    } else if (jobAvail === 'full-time' && (workerShift === 'day' || workerShift === 'night')) {
      score += 15;
    }
  } else {
    score += 15;
  }
  
  // Location proximity (20 points)
  const workerCoords = parseLocation(worker.address);
  const jobCoords = parseLocation(job.location);
  
  if (workerCoords && jobCoords) {
    const distance = calculateDistance(
      workerCoords.lat, workerCoords.lon,
      jobCoords.lat, jobCoords.lon
    );
    
    if (distance <= 5) score += 20;
    else if (distance <= 10) score += 15;
    else if (distance <= 20) score += 10;
    else if (distance <= 50) score += 5;
  } else {
    score += 5;
  }
  
  // Salary expectation match (20 points)
  if (job.salary && worker.salary_expectation) {
    // Parse salary range from job (e.g., "₹10000-15000")
    const salaryMatch = job.salary.match(/(\d+)/g);
    if (salaryMatch && salaryMatch.length >= 1) {
      const minSalary = parseInt(salaryMatch[0]);
      const maxSalary = salaryMatch.length > 1 ? parseInt(salaryMatch[1]) : minSalary;
      
      if (worker.salary_expectation >= minSalary && worker.salary_expectation <= maxSalary) {
        score += 20; // Within range
      } else if (worker.salary_expectation <= maxSalary + 5000) {
        score += 15; // Close to range
      } else if (worker.salary_expectation <= maxSalary + 10000) {
        score += 10; // Somewhat close
      }
    }
  } else {
    score += 10;
  }
  
  return score;
};

// Controller: Get jobs for non-logged-in workers (random + nearby)
exports.getPublicJobs = async (req, res) => {
  try {
    console.log('[DEBUG getPublicJobs] Called');
    
    const { lat, lon, limit = 20, exclude = '' } = req.query;
    const excludeIds = parseObjectIdList(exclude);
    const excludeSet = new Set(excludeIds.map((id) => id.toString()));
    const pageLimit = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
    
    let jobs = [];
    
    if (lat && lon) {
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lon);
      
      console.log('[DEBUG getPublicJobs] Location provided:', { latitude, longitude });
      
      let allJobs = await Job.find(activeStatusQuery);
      
      if (allJobs.length === 0) {
        console.log('[DEBUG getPublicJobs] No active jobs found, fetching all jobs');
        allJobs = await Job.find({});
      }
      
      const nearTarget = Math.floor(pageLimit / 2);
      jobs = allJobs
        .filter((job) => !excludeSet.has(job._id.toString()))
        .map(job => {
          const jobCoords = parseLocation(job.location);
          if (jobCoords) {
            const distance = calculateDistance(
              latitude, longitude,
              jobCoords.lat, jobCoords.lon
            );
            return { ...job.toObject(), distance };
          }
          return { ...job.toObject(), distance: 9999 };
        })
        .sort((a, b) => a.distance - b.distance)
        .slice(0, nearTarget);

      jobs.forEach((job) => excludeSet.add(job._id.toString()));
    }
    
    const remainingLimit = pageLimit - jobs.length;
    const excludeForAgg = Array.from(excludeSet).map((s) => new mongoose.Types.ObjectId(s));
    
    let randomJobs = await Job.aggregate([
      { $match: withActiveStatus({ _id: { $nin: excludeForAgg } }) },
      { $sample: { size: remainingLimit } }
    ]);
    
    if (randomJobs.length === 0) {
      console.log('[DEBUG getPublicJobs] No active jobs for random sampling, using all jobs');
      randomJobs = await Job.aggregate([
        { $match: { _id: { $nin: excludeForAgg } } },
        { $sample: { size: remainingLimit } }
      ]);
    }
    
    jobs = [...jobs, ...randomJobs];
    jobs = jobs.sort(() => Math.random() - 0.5);

    jobs = await attachJobContacts(jobs);
    
    console.log('[DEBUG getPublicJobs] Returning', jobs.length, 'jobs');
    
    // Has more? (based on remaining candidates excluding passed-in exclude ids)
    const remainingCount = await Job.countDocuments(
      withActiveStatus({ _id: { $nin: excludeIds } })
    );
    const fallbackRemainingCount = remainingCount === 0
      ? await Job.countDocuments({ _id: { $nin: excludeIds } })
      : remainingCount;
    const hasMore = fallbackRemainingCount > jobs.length;

    return res.status(200).json({
      success: true,
      count: jobs.length,
      jobs,
      mode: 'public'
      ,hasMore
    });
    
  } catch (error) {
    console.error('[ERROR getPublicJobs]', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch jobs',
      error: error.message
    });
  }
};

// Controller: Get recommended jobs - SEPARATED into exact matches and others
exports.getRecommendedJobs = async (req, res) => {
  try {
    const authUserId = req.user._id;
    
    console.log('[DEBUG getRecommendedJobs] AuthUser ID:', authUserId);
    
    const authUser = await AuthUser.findById(authUserId);
    
    if (!authUser) {
      console.log('[DEBUG getRecommendedJobs] AuthUser not found');
      return res.status(404).json({
        success: false,
        message: 'Authentication user not found'
      });
    }
    
    console.log('[DEBUG getRecommendedJobs] profileId from AuthUser:', authUser.profileId);
    
    if (!authUser.profileId) {
      console.log('[DEBUG getRecommendedJobs] No profileId found, falling back to PUBLIC jobs');
      return exports.getPublicJobs(req, res);
    }
    
    const profileId = authUser.profileId;
    const { forceRefresh = false, limit = 20, exclude = '' } = req.query;
    const excludeIds = parseObjectIdList(exclude);
    const excludeSet = new Set(excludeIds.map((id) => id.toString()));
    const pageLimit = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
    
    const worker = await User.findById(profileId);
    
    if (!worker) {
      console.log('[DEBUG getRecommendedJobs] User profile not found for profileId:', profileId);
      console.log('[DEBUG getRecommendedJobs] Falling back to PUBLIC jobs');
      return exports.getPublicJobs(req, res);
    }
    
    console.log('[DEBUG getRecommendedJobs] Worker profile found:', {
      id: worker._id,
      name: worker.name,
      job_title: worker.job_title
    });
    
    // Check if we need to recompute recommendations
    const needsRecompute = 
      forceRefresh === 'true' ||
      !worker.cachedRecommendations ||
      worker.cachedRecommendations.length === 0 ||
      worker.hasProfileChanged() ||
      !worker.recommendationsLastUpdated ||
      (Date.now() - worker.recommendationsLastUpdated.getTime()) > 24 * 60 * 60 * 1000;
    
    let recommendedJobs = [];
    let otherJobs = [];
    
    if (needsRecompute) {
      console.log(`[DEBUG getRecommendedJobs] Recomputing recommendations for worker ${profileId}`);
      
      let allJobs = await Job.find(activeStatusQuery);
      
      if (allJobs.length === 0) {
        console.log('[DEBUG getRecommendedJobs] No active jobs found, using all jobs');
        allJobs = await Job.find({});
      }
      
      // STEP 1: Filter jobs into EXACT matches and RELATED matches
      const exactMatches = [];
      const relatedMatches = [];
      
      allJobs.forEach(job => {
        if (isExactCategoryMatch(job, worker)) {
          // This is an EXACT match - goes to recommended
          exactMatches.push({ job, score: calculateJobScore(job, worker) });
        } else if (isRelatedJob(job, worker)) {
          // This is RELATED - goes to "other jobs"
          relatedMatches.push({ job, score: calculateJobScore(job, worker) });
        }
        // Everything else is ignored completely
      });
      
      // STEP 2: Sort both lists by score
      exactMatches.sort((a, b) => b.score - a.score);
      relatedMatches.sort((a, b) => b.score - a.score);
      
      // STEP 3: Take top jobs from each category
      recommendedJobs = exactMatches.slice(0, 20).map(item => item.job);
      otherJobs = relatedMatches.slice(0, 10).map(item => item.job);
      
      console.log(`[DEBUG getRecommendedJobs] Found ${recommendedJobs.length} exact matches, ${otherJobs.length} related jobs`);
      
      // Update worker's cache
      const allRecommendedIds = [
        ...recommendedJobs.map(job => job._id),
        ...otherJobs.map(job => job._id)
      ];
      
      worker.cachedRecommendations = allRecommendedIds;
      worker.recommendationsLastUpdated = new Date();
      worker.profileHash = worker.generateProfileHash();
      await worker.save();
      
    } else {
      console.log(`[DEBUG getRecommendedJobs] Using cached recommendations for worker ${profileId}`);
      
      // Fetch all cached jobs
      const cachedJobs = await Job.find({
        _id: { $in: worker.cachedRecommendations }
      });
      
      // Re-separate them
      cachedJobs.forEach(job => {
        if (isExactCategoryMatch(job, worker)) {
          recommendedJobs.push(job);
        } else {
          otherJobs.push(job);
        }
      });
    }
    
    console.log(`[DEBUG getRecommendedJobs] Returning ${recommendedJobs.length} recommended + ${otherJobs.length} other jobs`);

    // Pagination by exclusion (keeps existing response shape)
    const combined = [...recommendedJobs, ...otherJobs];
    const remainingCombined = combined.filter((job) => !excludeSet.has(job._id.toString()));
    const pageCombined = remainingCombined.slice(0, pageLimit);
    const pageIds = new Set(pageCombined.map((j) => j._id.toString()));
    const pagedRecommendedJobs = recommendedJobs.filter((job) => pageIds.has(job._id.toString()));
    const pagedOtherJobs = otherJobs.filter((job) => pageIds.has(job._id.toString()));
    const hasMore = remainingCombined.length > pageCombined.length;
    
    const pageCombinedWithContacts = await attachJobContacts(pageCombined);
    const pagedRecommendedJobsWithContacts = await attachJobContacts(pagedRecommendedJobs);
    const pagedOtherJobsWithContacts = await attachJobContacts(pagedOtherJobs);

    return res.status(200).json({
      success: true,
      count: pageCombined.length,
      recommendedJobs: pagedRecommendedJobsWithContacts,  // Exact category matches
      otherJobs: pagedOtherJobsWithContacts,              // Related/similar jobs
      jobs: pageCombinedWithContacts,                     // Page combined (for backward compatibility)
      mode: 'recommended',
      cached: !needsRecompute,
      lastUpdated: worker.recommendationsLastUpdated,
      hasMore
    });
    
  } catch (error) {
    console.error('[ERROR getRecommendedJobs]', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch recommendations',
      error: error.message
    });
  }
};

// Controller: Get nearby jobs
exports.getNearbyJobs = async (req, res) => {
  try {
    const authUserId = req.user._id;
    
    console.log('[DEBUG getNearbyJobs] AuthUser ID:', authUserId);
    
    const authUser = await AuthUser.findById(authUserId);
    
    console.log('[DEBUG getNearbyJobs] profileId:', authUser?.profileId);
    
    if (!authUser || !authUser.profileId) {
      console.log('[DEBUG getNearbyJobs] No profile found, falling back to PUBLIC jobs');
      return exports.getPublicJobs(req, res);
    }
    
    const { limit = 20, exclude = '' } = req.query;
    const excludeIds = parseObjectIdList(exclude);
    const excludeSet = new Set(excludeIds.map((id) => id.toString()));
    const pageLimit = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
    
    const worker = await User.findById(authUser.profileId);
    
    if (!worker) {
      console.log('[DEBUG getNearbyJobs] User profile not found, falling back to PUBLIC jobs');
      return exports.getPublicJobs(req, res);
    }
    
    console.log('[DEBUG getNearbyJobs] Worker found:', worker.name);
    
    const workerCoords = parseLocation(worker.address);
    let jobs = [];
    
    if (workerCoords) {
      console.log('[DEBUG getNearbyJobs] Using worker coordinates:', workerCoords);
      
      let allJobs = await Job.find(activeStatusQuery);
      
      if (allJobs.length === 0) {
        console.log('[DEBUG getNearbyJobs] No active jobs found, using all jobs');
        allJobs = await Job.find({});
      }
      
      const ranked = allJobs
        .filter((job) => !excludeSet.has(job._id.toString()))
        .map(job => {
          const jobCoords = parseLocation(job.location);
          if (jobCoords) {
            const distance = calculateDistance(
              workerCoords.lat, workerCoords.lon,
              jobCoords.lat, jobCoords.lon
            );
            return { ...job.toObject(), distance };
          }
          return { ...job.toObject(), distance: 9999 };
        })
        .sort((a, b) => a.distance - b.distance);

      jobs = ranked.slice(0, pageLimit);
      const hasMore = ranked.length > jobs.length;

      console.log('[DEBUG getNearbyJobs] Returning', jobs.length, 'jobs');
      
      return res.status(200).json({
        success: true,
        count: jobs.length,
        jobs,
        mode: 'nearby',
        hasMore
      });
    } else {
      console.log('[DEBUG getNearbyJobs] No coordinates, using random jobs');

      const excludeForAgg = excludeIds;
      
      let randomJobs = await Job.aggregate([
        { $match: withActiveStatus({ _id: { $nin: excludeForAgg } }) },
        { $sample: { size: pageLimit } }
      ]);
      
      if (randomJobs.length === 0) {
        console.log('[DEBUG getNearbyJobs] No active jobs for random sampling, using all jobs');
        randomJobs = await Job.aggregate([
          { $match: { _id: { $nin: excludeForAgg } } },
          { $sample: { size: pageLimit } }
        ]);
      }
      
      jobs = randomJobs;
    }
    
    console.log('[DEBUG getNearbyJobs] Returning', jobs.length, 'jobs');

    const remainingCount = await Job.countDocuments(
      withActiveStatus({ _id: { $nin: excludeIds } })
    );
    const fallbackRemainingCount = remainingCount === 0
      ? await Job.countDocuments({ _id: { $nin: excludeIds } })
      : remainingCount;
    const hasMore = fallbackRemainingCount > jobs.length;
    
    return res.status(200).json({
      success: true,
      count: jobs.length,
      jobs,
      mode: 'nearby',
      hasMore
    });
    
  } catch (error) {
    console.error('[ERROR getNearbyJobs]', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch nearby jobs',
      error: error.message
    });
  }
};

// Controller: Toggle job view mode
exports.toggleJobViewMode = async (req, res) => {
  try {
    const authUserId = req.user._id;
    const { mode } = req.body;
    
    if (!['recommended', 'nearby'].includes(mode)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid mode. Must be "recommended" or "nearby"'
      });
    }
    
    const authUser = await AuthUser.findById(authUserId);
    if (!authUser || !authUser.profileId) {
      return res.status(400).json({
        success: false,
        message: 'Profile required. Please create your profile first to toggle view mode.'
      });
    }
    
    const worker = await User.findByIdAndUpdate(
      authUser.profileId,
      { jobViewMode: mode },
      { new: true }
    );
    
    return res.status(200).json({
      success: true,
      message: 'Job view mode updated',
      mode: worker.jobViewMode
    });
    
  } catch (error) {
    console.error('[ERROR toggleJobViewMode]', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update job view mode',
      error: error.message
    });
  }
};

// Controller: Invalidate recommendations
exports.invalidateRecommendations = async (req, res) => {
  try {
    const authUserId = req.user._id;
    
    const authUser = await AuthUser.findById(authUserId);
    if (!authUser || !authUser.profileId) {
      return res.status(400).json({
        success: false,
        message: 'Profile required. Please create your profile first.'
      });
    }
    
    await User.findByIdAndUpdate(authUser.profileId, {
      cachedRecommendations: [],
      recommendationsLastUpdated: null,
      profileHash: null
    });
    
    return res.status(200).json({
      success: true,
      message: 'Recommendations invalidated. Will be recomputed on next fetch.'
    });
    
  } catch (error) {
    console.error('[ERROR invalidateRecommendations]', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to invalidate recommendations',
      error: error.message
    });
  }
};

module.exports = exports;