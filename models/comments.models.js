const db = require('../db/connection.js')
const { paginateArray } = require('../utils/utils.js')

exports.removeCommentById = (id) => {
  return db
    .query(
      `DELETE FROM comments
      WHERE comment_id = $1
      RETURNING *;`,
      [id]
    )
    .then((res) => {
      if (res.rowCount === 0) {
        return Promise.reject({
          status: 404,
          customErrMsg: 'requested ID not found',
        })
      }
    })
}

exports.updateCommentById = (commentId, votesInc) => {
  if (!votesInc || typeof votesInc !== 'number') {
    return Promise.reject({
      status: 400,
      customErrMsg: 'invalid vote increment supplied',
    })
  }
  return db
    .query(
      `UPDATE comments
      SET votes = votes + $1
      WHERE comment_id = $2 
      RETURNING comments.*, TO_CHAR(comments.created_at,'YYYY-MM-DD HH24:MI:SS') created_at;`,
      [votesInc, commentId]
    )
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({
          status: 404,
          customErrMsg: 'requested ID not found',
        })
      }
      return rows[0]
    })
}

exports.insertCommentByArticleId = (articleId, comment) => {
  const { username, body } = comment
  return db
    .query(
      `INSERT INTO comments (author,body,article_id)
  VALUES ($1, $2,$3) RETURNING *;`,
      [username, body, articleId]
    )
    .then(({ rows }) => {
      return rows[0]
    })
}

exports.selectCommentsByArticleId = (id, limit, p) => {
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
  let countQueryString = `SELECT CAST(COUNT(comments.comment_id) AS INT) FROM comments
  WHERE article_id = $1`
  let queryString = `SELECT comments.comment_id, comments.body,comments.article_id,comments.author,comments.votes, TO_CHAR(comments.created_at,'YYYY-MM-DD HH24:MI:SS') created_at FROM comments
  WHERE article_id = $1
  ORDER BY comments.created_at DESC`
  const countQueryVals = [id]
  const queryVals = [id]
  return Promise.all([
    db.query(countQueryString, countQueryVals),
    db.query(queryString, queryVals),
  ]).then((fulfilledPromises) => {
    const { count } = fulfilledPromises[0].rows[0]
    const { rows } = fulfilledPromises[1]
    return { total_count: count, comments: paginateArray(rows, limit, p) }
  })
}

exports.removeCommentByArticleId = (articleId) => {
  return db
    .query(
      `DELETE FROM comments
  WHERE article_id = $1
  RETURNING *;`,
      [articleId]
    )
    .then((response) => {
      return response.rowCount
    })
}
