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

exports.updateCommentById = (commentId,votesInc) => {
  if (!votesInc || typeof votesInc !== 'number') {
    return Promise.reject({
      status: 400,
      customErrMsg: 'invalid vote increment supplied',
    })
  }
  return db.query(`UPDATE comments
  SET votes = votes + $1
  WHERE comment_id = $2 
  RETURNING *;`,
      [votesInc, commentId]
    )
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({status:404,customErrMsg:'requested ID not found'})
      }
      return rows[0]
    })
}