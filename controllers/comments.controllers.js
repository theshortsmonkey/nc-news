const { removeCommentById, updateCommentById } = require("../models/comments.models")

exports.deleteCommentById = (req,res,next) => {
  const {comment_id} = req.params
  return removeCommentById(comment_id)
  .then(() => {
    res.status(204).send()
  })
  .catch(next)
}

exports.patchCommentById = (req,res,next) => {
  const {comment_id} = req.params
  const {inc_votes} = req.body
  return updateCommentById(comment_id,inc_votes)
  .then((updatedComment) => {
    res.status(200).send({updatedComment})
  })
  .catch(next)
}