const { selectTopics, insertTopic } = require("../models/topics.models")

exports.getTopics = (req,res,next) => {
  return selectTopics()
  .then((topics) => {
    return res.status(200).send({topics})
  })
  .catch(next)
}

exports.postTopic = (req,res,next) => {
  return insertTopic(req.body)
  .then((postedTopic) => {
    res.status(201).send({postedTopic})
  })
  .catch(next)
}