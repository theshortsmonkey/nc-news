const db = require('../db/connection.js')

exports.selectArticleyById = (id) => {
  return db.query(`SELECT * FROM articles
  WHERE article_id = $1`,[id])
  .then(({rows}) => {
    if (!rows.length) {
      return Promise.reject({status:404,customErrMsg:'requested ID not found'})
    }
    return rows[0]
  })
}