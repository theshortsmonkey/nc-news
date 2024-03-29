exports.convertTimestampToDate = ({ created_at, ...otherProperties }) => {
  if (!created_at) return { ...otherProperties }
  return { created_at: new Date(created_at), ...otherProperties }
}

exports.createRef = (arr, key, value) => {
  return arr.reduce((ref, element) => {
    ref[element[key]] = element[value]
    return ref
  }, {})
}

exports.formatComments = (comments, idLookup) => {
  return comments.map(({ created_by, belongs_to, ...restOfComment }) => {
    const article_id = idLookup[belongs_to]
    return {
      article_id,
      author: created_by,
      ...this.convertTimestampToDate(restOfComment),
    }
  })
}

exports.paginateArray = (inputArr, limit, page) => {
  if (!limit && !page) {
    return [...inputArr]
  }
  if (!limit) limit = 10
  if (!page) page = 1
  const startSlice = limit * (page - 1)
  const endSlice = startSlice + Number(limit)
  const outputArr = inputArr.slice(startSlice, endSlice)
  return outputArr
}

exports.filterQueryUpdate = (
  filter,
  value,
  queryString,
  queryVals,
  subQuery,
  likeString
) => {
  const copyQueryVals = [...queryVals]
  if (value) {
    if (subQuery) {
      queryString =
        `SELECT * FROM (` + queryString + `) a${copyQueryVals.length}`
    }
    let whereOperator = '='
    if (likeString) {
      whereOperator = 'LIKE'
      copyQueryVals.push(likeString)
    } else {
      copyQueryVals.push(value)
    }
    if (copyQueryVals.length === 1 || subQuery) {
      queryString += ` WHERE ${filter} ${whereOperator} $${copyQueryVals.length}`
    } else {
      queryString += ` AND ${filter} ${whereOperator} $${copyQueryVals.length}`
    }
  }
  return { queryString, queryVals: copyQueryVals }
}
