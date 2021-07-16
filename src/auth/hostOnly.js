import createError from 'http-errors'

export const hostOnly = (req, res, next) => {
  if(req.user.role === "host") { // if role is admin we can proceed to the request handler
    next()
  } else { // we trigger a 403 error
    next(createError(403, "Hosts only!"))
  }
}