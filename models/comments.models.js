const db = require('../db/connection.js')

exports.removeCommentById = (id) => {
  return db.query(`DELETE FROM comments
  WHERE comment_id = $1
  RETURNING *;`,[id])
  .then((res) => {
    if (res.rowCount === 0) {
      return Promise.reject({status:404,customErrMsg:'requested ID not found'})
    }
  })
}