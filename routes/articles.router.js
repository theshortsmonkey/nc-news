const articlesRouter = require('express').Router()
const {
  getArcticles,
  getArticleById,
  getCommentsByArticleId,
  postCommentByArticleId,
  patchArticleById,
} = require('../controllers/articles.controllers')

articlesRouter.get('/', getArcticles)

articlesRouter
  .route('/:article_id')
  .get(getArticleById)
  .patch(patchArticleById)

articlesRouter
  .route('/:article_id/comments')
  .get(getCommentsByArticleId)
  .post(postCommentByArticleId)

module.exports = articlesRouter
