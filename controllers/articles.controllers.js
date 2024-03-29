const {
  selectArticleyById,
  selectArticles,
  updateArticleById,
  insertArticle,
  removeArticleById,
} = require('../models/articles.models')
const {
  selectCommentsByArticleId,
  insertCommentByArticleId,
  removeCommentByArticleId,
} = require('../models/comments.models')
const { selectTopicsBySlug } = require('../models/topics.models')
const { selectUserByUsername } = require('../models/users.models')

exports.getArcticles = (req, res, next) => {
  const { topic, author, sort_by, order, limit, p } = req.query
  const promises = [selectArticles(sort_by, order, limit, p, topic, author)]
  if (topic) {
    promises.push(selectTopicsBySlug(topic))
  }
  if (author) {
    promises.push(selectUserByUsername(author))
  }
  return Promise.all(promises)
    .then((fulfilledPromises) => {
      const { total_count, articles } = fulfilledPromises[0]
      if (articles.length === 0) {
        return res.status(204).send()
      }
      return res.status(200).send({ total_count, articles })
    })
    .catch(next)
}

exports.getArticleById = (req, res, next) => {
  const { article_id } = req.params
  return selectArticleyById(article_id)
    .then((article) => {
      return res.status(200).send({ article })
    })
    .catch(next)
}

exports.getCommentsByArticleId = (req, res, next) => {
  const { article_id } = req.params
  const { limit, p } = req.query
  return Promise.all([
    selectCommentsByArticleId(article_id, limit, p),
    selectArticleyById(article_id),
  ])
    .then((fulfilledPromises) => {
      const { total_count, comments } = fulfilledPromises[0]
      if (comments.length === 0) {
        return res.status(204).send()
      }
      return res.status(200).send({ total_count, comments })
    })
    .catch(next)
}

exports.postCommentByArticleId = (req, res, next) => {
  const { article_id } = req.params
  const { body } = req
  return Promise.all([
    insertCommentByArticleId(article_id, body),
    selectArticleyById(article_id),
  ])
    .then((fulfilledPromises) => {
      const postedComment = fulfilledPromises[0]
      res.status(201).send({ postedComment })
    })
    .catch(next)
}

exports.patchArticleById = (req, res, next) => {
  const { article_id } = req.params
  return Promise.all([
    updateArticleById(article_id, req.body),
    selectArticleyById(article_id),
  ])
    .then((fulfilledPromises) => {
      const updatedArticle = fulfilledPromises[0]
      res.status(200).send({ updatedArticle })
    })
    .catch(next)
}

exports.postArticle = (req, res, next) => {
  return insertArticle(req.body)
    .then((postedArticleId) => {
      return selectArticleyById(postedArticleId)
    })
    .then((postedArticle) => {
      res.status(201).send({ postedArticle })
    })
    .catch(next)
}

exports.deleteArticleById = (req, res, next) => {
  const { article_id } = req.params
  return removeCommentByArticleId(article_id)
    .then(() => {
      return removeArticleById(article_id)
    })
    .then(() => {
      res.status(204).send({})
    })
    .catch(next)
}
