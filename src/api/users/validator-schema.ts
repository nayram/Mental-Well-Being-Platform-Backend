import joi from 'joi'
import { celebrate, Segments } from 'celebrate'

const userJoiSchema =  {
    username: joi.string().min(4).required(),
    email: joi.string().email().required(),
    password: joi.string().alphanum().min(8).required(),
}

export const validateCreateUserRequest = celebrate({
    [Segments.BODY]: joi.object().keys(userJoiSchema)
})
