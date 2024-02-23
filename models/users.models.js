const { start } = require('repl')
const db = require('../db/connection.js')
const { paginateArray, filterQueryUpdate } = require('../db/utils.js')

exports.selectUsers = (sortBy='username',order='asc',limit,p,startsWith) => {
  if (limit && !(limit >= 0)) {
      return Promise.reject({
        status: 400,
        customErrMsg: 'invalid query string',
      })
  }
  if (p && !(p >= 0)) {
      return Promise.reject({
        status: 400,
        customErrMsg: 'invalid query string',
      })
  }
  const allowedSortByVals = ['username','name']
  if (!allowedSortByVals.includes(sortBy)) {
    return Promise.reject({ status: 400, customErrMsg: 'invalid sort column' })
  }
  const allowedOrderVals = ['asc', 'desc']
  if (!allowedOrderVals.includes(order)) {
    return Promise.reject({ status: 400, customErrMsg: 'invalid sort order' })
  }
  let baseCountQueryString = `SELECT CAST(COUNT(users.username) AS INT) FROM users`
  const output = filterQueryUpdate('username',startsWith,baseCountQueryString,[],false,startsWith + '%')
  const countQueryString = output.queryString
  const countQueryVals = output.queryVals
  const baseQueryString = `SELECT * FROM users`  
  let {queryString,queryVals} = filterQueryUpdate('username',startsWith,baseQueryString,[],false,startsWith + '%')
  queryString += ` ORDER BY users.${sortBy} ${order}`
  console.log(countQueryString, countQueryVals)
  console.log(queryString, queryVals)
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