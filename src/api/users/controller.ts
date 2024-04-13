import {NextFunction, Request, Response } from 'express';
import { UserService } from '../../services';
import { httpStatus } from '../../helpers'
export const createUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { username, email, password } = req.body;
        await UserService.createUser({username, email, password})
        res.status(httpStatus.CREATED).json({ message: 'user created successfully' })
    } catch (error) {
        next(error)
    }
    
}
