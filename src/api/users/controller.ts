import {Request, Response } from 'express'
import {  UserService } from '../../services'  

export const createUser = async (req: Request, res: Response) => {
    const { username, email, password } = req.body;
    await UserService.createUser({username, email, password})
    res.status(201).json({ message: 'user created successfully' })
}
