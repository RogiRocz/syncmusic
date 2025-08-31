// src/models/SyncJob.js
const Joi = require('joi');

const syncJobSchema = Joi.object({
  id: Joi.string().optional(),
  userId: Joi.string().required().description('ID of user who created the sync job'),
  playlistId: Joi.string().required().description('ID of playlist to sync'),
  sourcePlatform: Joi.string().required(),
  targetPlatforms: Joi.array().items(Joi.string()).min(1).required(),
  status: Joi.string(),
  progress: Joi.number().min(0).max(100).default(0),
  stats: Joi.object({
    totalTracks: Joi.number().integer().min(0).default(0),
    syncedTracks: Joi.number().integer().min(0).default(0),
    failedTracks: Joi.number().integer().min(0).default(0),
    skippedTracks: Joi.number().integer().min(0).default(0)
  }).default({}),
  errors: Joi.array().items(
    Joi.object({
      trackId: Joi.string().optional(),
      platformName: Joi.string().optional(),
      error: Joi.string().required(),
      timestamp: Joi.date().default(Date.now)
    })
  ).default([]),
  startedAt: Joi.date().optional(),
  completedAt: Joi.date().optional(),
  createdAt: Joi.date().default(Date.now)
});

const validateSyncJob = async (syncJob) => {
  try {
    const result = await syncJobSchema.validateAsync(syncJob);
    return result;
  } catch (error) {
    return error;
  }
};

const validateSyncJobUpdate = async (updateData) => {
  const updateSchema = Joi.object({
    status: Joi.string(),
    progress: Joi.number().min(0).max(100),
    stats: Joi.object({
      totalTracks: Joi.number().integer().min(0),
      syncedTracks: Joi.number().integer().min(0),
      failedTracks: Joi.number().integer().min(0),
      skippedTracks: Joi.number().integer().min(0)
    }),
    // Como funcionaria essa parte já que a validação tá sendo feita de maneira assincrona, como ele ia pegar os erros?
    errors: Joi.array().items(
      Joi.object({
        trackId: Joi.string().optional(),
        platform: Joi.string().optional(),
        error: Joi.string().required(),
        timestamp: Joi.date().default(Date.now)
      })
    ),
    completedAt: Joi.date()
  }).min(1);

  return await updateSchema.validateAsync(updateData, { 
    abortEarly: false,
    stripUnknown: true
  });
};

module.exports = {
  syncJobSchema,
  validateSyncJob,
  validateSyncJobUpdate
};