const KnowledgeBase = require("../models/KnowledgeBase.model");
const asyncHandler = require("../utils/asyncHandler");
const ApiResponse = require("../utils/apiResponse");

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
  return res.status(201).json(ApiResponse.success("KB article created", { article }));
});

module.exports = { getAllArticles, createArticle };
