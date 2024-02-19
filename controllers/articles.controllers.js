const { selectArticleyById } = require("../models/articles.models")

exports.getArticleById = (req,res,next) => {
  const {article_id} = req.params
  return selectArticleyById(article_id)
  .then((article) => {
    return res.status(200).send({article})
  })
  .catch(next)
}