const { selectUsers, selectUserByUsername } = require('../models/users.models')

exports.getUsers = (req, res, next) => {
  const {sort_by,order,limit,p,starts_with} = req.query
  return selectUsers(sort_by,order,limit,p,starts_with)
    .then((body) => {
      const { total_count, users } = body
      if (users.length === 0) {
        return res.status(204).send()
      }
      res.status(200).send({total_count,users})
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
