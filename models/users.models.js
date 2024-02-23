const db = require('../db/connection.js')
const { paginateArray } = require('../db/utils.js')
const format = require('pg-format')

exports.selectUsers = (sortBy='username',order='asc',limit,p,startsWith) => {
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
  let countQueryString = `SELECT CAST(COUNT(users.username) AS INT) FROM users`
  let queryString = `SELECT * FROM users
  ORDER BY users.${sortBy} ${order}`
  const countQueryVals = []
  const queryVals = []
  if (startsWith) {
    queryString =
      `SELECT * FROM (` +
      queryString +
      `) a 
    WHERE username LIKE $1`
    queryVals.push(startsWith+'%')
    countQueryString += ` WHERE username LIKE $1`
    countQueryVals.push(startsWith+'%')
  }
  console.log(queryString,queryVals)
  console.log(countQueryString,countQueryVals)
  return Promise.all([
    db.query(countQueryString,countQueryVals),
    db.query(queryString,queryVals),
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