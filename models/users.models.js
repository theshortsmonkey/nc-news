const db = require('../db/connection.js')
const { paginateArray } = require('../db/utils.js')

exports.selectUsers = (sortBy='username',order='asc',limit,p) => {
  if (limit) {
    if (!(limit >= 0)) {
      return Promise.reject({
        status: 400,
        customErrMsg: 'invalid query string',
      })
    }
  }
  if (p) {
    if (!(p >= 0)) {
      return Promise.reject({
        status: 400,
        customErrMsg: 'invalid query string',
      })
    }
  }
  const allowedSortByVals = ['username','name']
  if (!allowedSortByVals.includes(sortBy)) {
    return Promise.reject({ status: 400, customErrMsg: 'invalid sort column' })
  }
  const allowedOrderVals = ['asc', 'desc']
  if (!allowedOrderVals.includes(order)) {
    return Promise.reject({ status: 400, customErrMsg: 'invalid sort order' })
  }
  const countQueryString = `SELECT CAST(COUNT(users.username) AS INT) FROM users;`
  const queryString = `SELECT * FROM users
  ORDER BY users.${sortBy} ${order}`
  const countQueryVals = []
  const queryVals = []
  return Promise.all([
    db.query(countQueryString),
    db.query(queryString),
  ]).then((fulfilledPromises) => {
    const { count } = fulfilledPromises[0].rows[0]
    const { rows } = fulfilledPromises[1]
    return { total_count: count, users: paginateArray(rows, limit, p) }
  })
}

exports.selectUserByUsername = (username) => {
  return db.query(`SELECT * FROM users
  WHERE username = $1`,[username])
  .then(({rows}) => {
    if (rows.length === 0) {
      return Promise.reject({status:404,customErrMsg:'requested username not found'})
    }
    return rows[0]
  })
} 