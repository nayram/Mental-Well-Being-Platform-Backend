import { Request, Response, NextFunction } from 'express'
import { httpStatus } from './utils'
import { isCelebrateError } from 'celebrate'

export const ERROR_TYPES = {
    ERR_MODEL_VALIDATION: 'ModelValidationError',
    ERR_VALIDATION: 'ValidationError',
  }

export const setErrorStatus =
  (errorMap: Record<string, number>) =>
  (error: any, _: Request, res: Response, next: NextFunction) => {
    if(isCelebrateError(error)){
        console.log([...error.details.values()])
        next(error)
    }
    error.status = errorMap[error.name]
    error.message = error.message
    res.format({
      'application/json': () => {
        res.status(error.status).json({
          message: error.message
        })
      }
    })
    next(error)
  }

export const sendError = (error: Error & { status: number },_req: Request , res: Response) => {
    const { status, message } = error
    return res.status(status).json(
        status === 500
          ? { error: { message: 'Internal Server Error' } }
          : {
              error: {
                message
              }
            }
      )
}

export const notFound = (_: Request, _res: Response, next: NextFunction) => {
  next({ status: httpStatus.NOT_FOUND, message: 'Not found' })
}
