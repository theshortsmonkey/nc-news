const { selectUsers, selectUserByUsername } = require('../models/users.models')

exports.getUsers = (req, res, next) => {
  const {sort_by,order,limit,p} = req.query
  return selectUsers(sort_by,order,limit,p)
    .then((body) => {
      res.status(200).send(body)
    })
    .catch(next)
}

exports.getUserByUsername = (req, res, next) => {
  const { username } = req.params
  return selectUserByUsername(username)
    .then((user) => {
      res.status(200).send({ user })
    })
    .catch(next)
}
