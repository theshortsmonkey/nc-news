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
  RETURNING comments.*, TO_CHAR(comments.created_at,'YYYY-MM-DD HH24:MI:SS') created_at;`,
      [votesInc, commentId]
    )
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({status:404,customErrMsg:'requested ID not found'})
      }
      return rows[0]
    })
}

exports.insertCommentByArticleId = (article_id, comment) => {
  const { username, body } = comment
  return db
    .query(
      `INSERT INTO comments (author,body,article_id)
  VALUES ($1, $2,$3) RETURNING *;`,
      [username, body, article_id]
    )
    .then(({ rows }) => {
      return rows[0]
    })
}

exports.selectCommentsByArticleId = (id) => {
  return db
    .query(
      `SELECT * FROM comments
  WHERE article_id = $1
  ORDER BY comments.created_at DESC;`,
      [id]
    )
    .then(({ rows }) => {
      return rows
    })
}