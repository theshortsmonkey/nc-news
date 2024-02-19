exports.handleMissingEndpoints = (req,res,next) => {
  return res.status(404).send({msg:`${req.url} endpoint not found`})
}

exports.handleServerErrors = (err,req,res,next) => {
  console.log(err,'<--- in server error controller')
  return res.status(500).send({msg:'internal error'})
}