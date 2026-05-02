const KnowledgeBase = require("../models/KnowledgeBase.model");
const asyncHandler = require("../utils/asyncHandler");
const ApiResponse = require("../utils/apiResponse");
const redis = require("../config/redis");

const getAllArticles = asyncHandler(async (req, res) => {
  const articles = await KnowledgeBase.find({ tenantId: req.tenantId }).sort({ createdAt: -1 });
  return res.status(200).json(ApiResponse.success("KB articles retrieved", { articles }));
});

const createArticle = asyncHandler(async (req, res) => {
  const article = await KnowledgeBase.create({
    tenantId: req.tenantId,
    title: req.body.title,
    content: req.body.content,
    tags: req.body.tags || [],
    createdBy: req.user.id,
  });
  try {
    await redis.del(`tenant:kb:${req.tenantId}`);
  } catch (_err) {}
  return res.status(201).json(ApiResponse.success("KB article created", { article }));
});

const updateArticle = asyncHandler(async (req, res) => {
  const article = await KnowledgeBase.findOneAndUpdate(
    { _id: req.params.id, tenantId: req.tenantId },
    { title: req.body.title, content: req.body.content, tags: req.body.tags },
    { new: true }
  );
  if (!article) return res.status(404).json(ApiResponse.error("Article not found"));
  try {
    await redis.del(`tenant:kb:${req.tenantId}`);
  } catch (_err) {}
  return res.status(200).json(ApiResponse.success("KB article updated", { article }));
});

const deleteArticle = asyncHandler(async (req, res) => {
  const article = await KnowledgeBase.findOneAndDelete({ _id: req.params.id, tenantId: req.tenantId });
  if (!article) return res.status(404).json(ApiResponse.error("Article not found"));
  try {
    await redis.del(`tenant:kb:${req.tenantId}`);
  } catch (_err) {}
  return res.status(200).json(ApiResponse.success("KB article deleted", {}));
});

module.exports = { getAllArticles, createArticle, updateArticle, deleteArticle };
