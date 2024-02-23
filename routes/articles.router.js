const articlesRouter = require('express').Router()
const {
  getArcticles,
  getArticleById,
  getCommentsByArticleId,
  postCommentByArticleId,
  patchArticleById,
  postArticle,
  deleteArticleById,
} = require('../controllers/articles.controllers')

articlesRouter
  .route('/')
  .get(getArcticles)
  .post(postArticle)

articlesRouter
  .route('/:article_id')
  .get(getArticleById)
  .patch(patchArticleById)
  .delete(deleteArticleById)

articlesRouter
  .route('/:article_id/comments')
  .get(getCommentsByArticleId)
  .post(postCommentByArticleId)

module.exports = articlesRouter
