const { selectArticleyById, selectArticles, selectCommentsByArticleId, insertCommentByArticleId, updateArticleById } = require("../models/articles.models")

exports.getArcticles = (req,res,next) => {
  return selectArticles()
  .then((articles) => {
    res.status(200).send({articles})
  })
  .catch(next)
}

exports.getArticleById = (req,res,next) => {
  const {article_id} = req.params
  return selectArticleyById(article_id)
  .then((article) => {
    return res.status(200).send({article})
  })
  .catch(next)
}

exports.getCommentsByArticleId = (req,res,next) => {
  const {article_id} = req.params
  const promises = [selectCommentsByArticleId(article_id),selectArticleyById(article_id)]
  return Promise.all(promises)
  .then((fulfilledPromises) => {
    comments = fulfilledPromises[0]
    res.status(200).send({comments})
  })
  .catch(next)
}

exports.postCommentByArticleId = (req,res,next) => {
  const {article_id} = req.params
  const {body} = req
  return insertCommentByArticleId(article_id,body)
  .then((postedComment) => {
    res.status(201).send({postedComment})
  })
  .catch(next)
}

exports.patchArticleById = (req,res,next) => {
  const {article_id} = req.params
  const promises = [updateArticleById(article_id,req.body),selectArticleyById(article_id)]

  return Promise.all(promises).then((fulfilledPromises) => {
    updatedArticle = fulfilledPromises[0]
    res.status(200).send({updatedArticle})
  })
  .catch(next)
}