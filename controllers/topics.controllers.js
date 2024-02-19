const { selectTopics } = require("../models/topics.models")

exports.getTopics = (req,res,next) => {
  return selectTopics()
  .then((topics) => {
    res.status(200).send({topics})
  })
}