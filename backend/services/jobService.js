const mongoose = require("mongoose");

const Job = require("../models/jobModel");
const Skill = require("../models/skillModel");
const User = require("../models/userModel");

const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const validateCompensationForPublication = (compensation) => {
  if (!compensation) {
    throw createError(
      "Compensation information is required before publishing",
      400
    );
  }

  if (!["FIXED", "NEGOTIABLE"].includes(compensation.mode)) {
    throw createError(
      "Compensation mode must be FIXED or NEGOTIABLE",
      400
    );
  }

  if (
    compensation.proposedAmount === undefined ||
    compensation.proposedAmount === null ||
    compensation.proposedAmount <= 0
  ) {
    throw createError(
      "A proposed compensation amount greater than 0 is required",
      400
    );
  }

  if (!compensation.currency) {
    throw createError(
      "Compensation currency is required before publishing",
      400
    );
  }

  if (!compensation.unit) {
    throw createError(
      "Compensation unit is required before publishing",
      400
    );
  }
};

const validateJobForPublication = (job) => {
  if (!job.title || !job.skillId || !job.workersNeeded) {
    throw createError("Job is incomplete", 400);
  }

  if (job.workersNeeded < 1) {
    throw createError(
      "Number of workers needed must be at least 1",
      400
    );
  }

  if (!job.city) {
    throw createError(
      "City is required before publishing",
      400
    );
  }

  validateCompensationForPublication(job.compensation);

  if (job.mode === "EMPLOYMENT" && !job.description) {
    throw createError(
      "Description is required for employment jobs",
      400
    );
  }

  if (job.mode === "MISSION") {
    if (!job.startDate || !job.endDate) {
      throw createError(
        "Start date and end date are required for missions",
        400
      );
    }

    if (job.endDate < job.startDate) {
      throw createError(
        "End date cannot be before start date",
        400
      );
    }
  }

  if (job.mode === "IMMEDIATE") {
    if (
      !job.location ||
      !Array.isArray(job.location.coordinates) ||
      job.location.coordinates.length !== 2
    ) {
      throw createError(
        "A valid location is required for immediate jobs",
        400
      );
    }
  }
};

const createJob = async (employerId, jobData) => {
  const employer = await User.findById(employerId);

  if (!employer) {
    throw createError("Employer not found", 404);
  }

  if (employer.role !== "EMPLOYER") {
    throw createError(
      "Only employers can create jobs",
      403
    );
  }

  if (employer.status !== "ACTIVE") {
    throw createError(
      "Employer account is not active",
      403
    );
  }

  const skill = await Skill.findOne({
    _id: jobData.skillId,
    active: true,
  });

  if (!skill) {
    throw createError(
      "Selected skill does not exist or is inactive",
      400
    );
  }

  const job = await Job.create({
    employerId,
    mode: jobData.mode,
    title: jobData.title,
    skillId: jobData.skillId,
    workersNeeded: jobData.workersNeeded,
    description: jobData.description,

    location: jobData.location,
    city: jobData.city,
    area: jobData.area,

    startDate: jobData.startDate,
    endDate: jobData.endDate,
    startTime: jobData.startTime,
    endTime: jobData.endTime,

    compensation: jobData.compensation,

    importantInformation: jobData.importantInformation,
    conditions: jobData.conditions,

    status: "DRAFT",
  });

  return Job.findById(job._id)
    .populate(
      "employerId",
      "firstName lastName role employerProfile"
    )
    .populate(
      "skillId",
      "name slug active"
    );
};

const publishJob = async (employerId, jobId) => {
  const employer = await User.findById(employerId);

  if (!employer) {
    throw createError("Employer not found", 404);
  }

  if (employer.role !== "EMPLOYER") {
    throw createError(
      "Only employers can publish jobs",
      403
    );
  }

  if (employer.status !== "ACTIVE") {
    throw createError(
      "Employer account is not active",
      403
    );
  }

  const job = await Job.findById(jobId);

  if (!job) {
    throw createError("Job not found", 404);
  }

  if (job.employerId.toString() !== employerId.toString()) {
    throw createError(
      "You are not allowed to publish this job",
      403
    );
  }

  if (job.status !== "DRAFT") {
    throw createError(
      "Only draft jobs can be published",
      400
    );
  }

  const skill = await Skill.findOne({
    _id: job.skillId,
    active: true,
  });

  if (!skill) {
    throw createError(
      "Selected skill does not exist or is inactive",
      400
    );
  }

  validateJobForPublication(job);

  job.status = "PUBLISHED";

  await job.save();

  return Job.findById(job._id)
    .populate(
      "employerId",
      "firstName lastName role employerProfile"
    )
    .populate(
      "skillId",
      "name slug active"
    );
};

const buildPublishedQuery = (filters = {}) => {
  const query = {
    status: "PUBLISHED",
  };

  if (filters.skillId) {
    query.skillId = new mongoose.Types.ObjectId(
      filters.skillId
    );
  }

  if (filters.city) {
    query.city = filters.city;
  }

  if (filters.mode) {
    query.mode = filters.mode;
  }

  return query;
};

const paginateAggregationResult = async (
  pipeline,
  page,
  limit
) => {
  const skip = (page - 1) * limit;

  pipeline.push({
    $facet: {
      jobs: [
        {
          $skip: skip,
        },
        {
          $limit: limit,
        },
      ],

      totalCount: [
        {
          $count: "count",
        },
      ],
    },
  });

  const aggregationResult = await Job.aggregate(pipeline);

  const result = aggregationResult[0] || {
    jobs: [],
    totalCount: [],
  };

  let jobs = result.jobs || [];

  const totalJobs =
    result.totalCount.length > 0
      ? result.totalCount[0].count
      : 0;

  const totalPages =
    totalJobs === 0
      ? 0
      : Math.ceil(totalJobs / limit);

  jobs = await Job.populate(jobs, [
    {
      path: "employerId",
      select:
        "firstName lastName role employerProfile",
    },
    {
      path: "skillId",
      select: "name slug active",
    },
  ]);

  return {
    jobs,

    pagination: {
      page,
      limit,
      totalJobs,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
};

const getPublishedJobs = async (filters = {}) => {
  const page = Number(filters.page) || 1;
  const limit = Number(filters.limit) || 10;

  const hasGps =
    filters.lat !== undefined &&
    filters.lng !== undefined;

  const latitude = hasGps
    ? Number(filters.lat)
    : null;

  const longitude = hasGps
    ? Number(filters.lng)
    : null;

  /*
   * Si scope n'est pas envoyé :
   *
   * GPS présent  -> NEARBY
   * GPS absent   -> ALL
   *
   * Cela garde la compatibilité avec nos anciennes requêtes.
   */
  const scope =
    filters.scope?.toUpperCase() ||
    (hasGps ? "NEARBY" : "ALL");

  const publishedQuery =
    buildPublishedQuery(filters);

  /*
   * ==================================================
   * MODE NEARBY
   * ==================================================
   */
  if (scope === "NEARBY") {
    if (!hasGps) {
      throw createError(
        "Latitude and longitude are required for NEARBY scope",
        400
      );
    }

    const radiusKm =
      filters.radius !== undefined
        ? Number(filters.radius)
        : 10;

    if (radiusKm < 1 || radiusKm > 200) {
      throw createError(
        "Radius must be between 1 and 200 kilometers",
        400
      );
    }

    const pipeline = [
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [
              longitude,
              latitude,
            ],
          },

          key: "location",

          distanceField: "distanceMeters",

          maxDistance: radiusKm * 1000,

          spherical: true,

          query: publishedQuery,
        },
      },

      {
        $addFields: {
          distanceKm: {
            $round: [
              {
                $divide: [
                  "$distanceMeters",
                  1000,
                ],
              },
              2,
            ],
          },
        },
      },
    ];

    const result =
      await paginateAggregationResult(
        pipeline,
        page,
        limit
      );

    return {
      ...result,

      geo: {
        enabled: true,
        scope: "NEARBY",
        latitude,
        longitude,
        radiusKm,
      },
    };
  }

  /*
   * ==================================================
   * MODE ALL + GPS
   *
   * Tous les Jobs PUBLISHED.
   *
   * Jobs avec GPS :
   * → distance calculée
   * → tri proche vers loin
   *
   * Jobs sans GPS :
   * → restent visibles
   * → distanceKm = null
   * → placés après les Jobs géolocalisés
   * ==================================================
   */
  if (scope === "ALL" && hasGps) {
    const jobsCollection =
      Job.collection.name;

    const missingLocationQuery = {
      ...publishedQuery,

      $or: [
        {
          location: {
            $exists: false,
          },
        },
        {
          location: null,
        },
        {
          "location.coordinates": {
            $exists: false,
          },
        },
      ],
    };

    const pipeline = [
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [
              longitude,
              latitude,
            ],
          },

          key: "location",

          distanceField: "distanceMeters",

          spherical: true,

          query: publishedQuery,
        },
      },

      {
        $addFields: {
          distanceKm: {
            $round: [
              {
                $divide: [
                  "$distanceMeters",
                  1000,
                ],
              },
              2,
            ],
          },

          _sortDistance:
            "$distanceMeters",
        },
      },

      {
        $unionWith: {
          coll: jobsCollection,

          pipeline: [
            {
              $match:
                missingLocationQuery,
            },

            {
              $addFields: {
                distanceMeters: null,
                distanceKm: null,

                _sortDistance:
                  999999999999,
              },
            },
          ],
        },
      },

      {
        $sort: {
          _sortDistance: 1,
          createdAt: -1,
        },
      },

      {
        $unset: "_sortDistance",
      },
    ];

    const result =
      await paginateAggregationResult(
        pipeline,
        page,
        limit
      );

    return {
      ...result,

      geo: {
        enabled: true,
        scope: "ALL",
        latitude,
        longitude,
        radiusKm: null,
      },
    };
  }

  /*
   * ==================================================
   * MODE ALL SANS GPS
   *
   * Tous les Jobs PUBLISHED.
   * Tri par date.
   * Pas de distance disponible.
   * ==================================================
   */

  const classicQuery = {
    status: "PUBLISHED",
  };

  if (filters.skillId) {
    classicQuery.skillId =
      filters.skillId;
  }

  if (filters.city) {
    classicQuery.city =
      filters.city;
  }

  if (filters.mode) {
    classicQuery.mode =
      filters.mode;
  }

  const skip =
    (page - 1) * limit;

  const [jobs, totalJobs] =
    await Promise.all([
      Job.find(classicQuery)
        .populate(
          "employerId",
          "firstName lastName role employerProfile"
        )
        .populate(
          "skillId",
          "name slug active"
        )
        .sort({
          createdAt: -1,
        })
        .skip(skip)
        .limit(limit),

      Job.countDocuments(
        classicQuery
      ),
    ]);

  const totalPages =
    totalJobs === 0
      ? 0
      : Math.ceil(totalJobs / limit);

  return {
    jobs,

    pagination: {
      page,
      limit,
      totalJobs,
      totalPages,
      hasNextPage:
        page < totalPages,
      hasPreviousPage:
        page > 1,
    },

    geo: {
      enabled: false,
      scope: "ALL",
      latitude: null,
      longitude: null,
      radiusKm: null,
    },
  };
};

module.exports = {
  createJob,
  publishJob,
  getPublishedJobs,
};