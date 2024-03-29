exports.handleCustomErrors = (err, req, res, next) => {
  if (err.status && err.customErrMsg) {
    return res.status(err.status).send({ msg: err.customErrMsg })
  }
  next(err)
}

exports.handlePsqlErrors = (err, req, res, next) => {
  switch (err.code) {
    case '22P02':
      return res.status(400).send({ msg: 'invalid id supplied' })
    case '23502':
      const missingField = err.column
      return res.status(400).send({ msg: `body missing required field: "${missingField}"` })
    case '23503':
      if (err.constraint.includes('author_fkey')) {
        return res.status(404).send({msg: 'supplied username does not exist in database'})
      }
      if (err.constraint.includes('topic_fkey')) {
        return res.status(404).send({msg: 'supplied topic does not exist in database'})
      }
      return res.status(404).send({ msg: 'requested ID not found' })
      case '23505':
        if (err.constraint.includes('topics_pkey')) {
          return res.status(422).send('requested topic already exists in database')
        }
        return res.status(422).send({msg: 'requested key already exists in database'})
    default:
      next(err)
  }
}

exports.handleServerErrors = (err, req, res, next) => {
  console.log(err, '<--- in server error controller')
  return res.status(500).send({ msg: 'internal error' })
}
