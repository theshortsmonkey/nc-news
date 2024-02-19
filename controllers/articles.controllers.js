const { selectArticleyById, selectArticles, selectCommentsByArticleId } = require("../models/articles.models")

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
  return selectCommentsByArticleId(article_id)
  .then((comments) => {
    res.status(200).send({comments})
  })
  .catch(next)
}