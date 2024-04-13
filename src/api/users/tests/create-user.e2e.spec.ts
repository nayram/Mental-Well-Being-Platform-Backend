import http, { Server } from 'http'
import { Application } from 'express'
import supertest from 'supertest'
import * as bcrypt from 'bcrypt'
import { sql } from '@pgkit/client'
import { createApp } from '../../app'
import { closeDb, truncateTable, httpStatus } from '../../../helpers/utils'
import { dbClient } from '../../../lib'
import { UserModel } from '../../../models'

describe('API: POST /api/v1/users', () => {
    let app: Application
    let server: Server

    beforeAll(async () => {
        app = createApp();
        server = http.createServer(app);
    })

    afterEach(async () => {
        await truncateTable(UserModel.UserTableName);
    })

    afterAll(async () => {
        await closeDb();
        server.close();
    })

    describe('Success', () => { 
        test('should create user successfully', async () => {
            const user = {
                username: 'nayram',
                email: 'nayram@me.com',
                password: 'nayram123'
            }
            const res = await supertest(app).post('/api/v1/users').send(user)
            expect(res.statusCode).toBe(201);
            const { rows: [getNewUser]} = await dbClient.query(sql<UserModel.UserSchema>`SELECT * FROM ${sql.identifier([UserModel.UserTableName])} WHERE email = ${user.email} and username = ${user.username}`) 
            expect(getNewUser).toMatchObject({
                email: user.email,
                username: user.username
            })
            expect(await bcrypt.compare(user.password, getNewUser.password)).toBe(
                true,
              );
        })
     })

     describe('Failure', () => {
        test.each([
            ['username'],
            ['email'],
            ['password']
        ])('should fail to create when %s is missing', async (key) => {
            const user: Record<string, string> = {
                'username': 'nayram',
                'email': 'nayram@me.com',
                'password': 'nayram123'
            }
            delete user[key]
            const res = await supertest(app).post('/api/v1/users').send(user)
            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe('Validation failed');
            expect(res.body.validation).toStrictEqual({
                body: {
                    keys: [key],
                    message: `\"${key}\" is required`,
                    source: 'body'
                }
            })
        })

        test.each([
            ['username'],
            ['email'],
            ['password']
        ])('should fail to create when %s is not a string', async (key) => {
            const user: Record<string, any> = {
                'username': 'nayram',
                'email': 'nayram@me.com',
                'password': 'nayram123'
            }
            user[key] = 1232
            const res = await supertest(app).post('/api/v1/users').send(user)
            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe('Validation failed');
            expect(res.body.validation).toStrictEqual({
                body: {
                    keys: [key],
                    message: `\"${key}\" must be a string`,
                    source: 'body'
                }
            })
        })

        test('should fail to create when email is invalid', async () => {
            const user = {
                username: 'nayram',
                email: 'nayram',
                password: 'nayram123'
            }
            const res = await supertest(app).post('/api/v1/users').send(user)
            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe('Validation failed');
            expect(res.body.validation).toStrictEqual({
                body: {
                    keys: ['email'],
                    message: `"email" must be a valid email`,
                    source: 'body'
                }
            })
        })

        test('should fail when username is already taken', async() => {
            const user = {
                username: 'nayram',
                email: 'nayram@me.com',
                password: 'nayram123'
            }
            await UserModel.createUser(user)
            const res = await supertest(app).post('/api/v1/users').send({...user, email: 'nayram2@me.com'})
            expect(res.statusCode).toBe(httpStatus.UN_PROCESSABLE_ENTITY);
            
        })

        test('should fail when email is already taken', async() => {
            const user = {
                username: 'nayram',
                email: 'nayram@me.com',
                password: 'nayram123'
            }
            await UserModel.createUser(user)
            const res = await supertest(app).post('/api/v1/users').send({ ...user, username: 'nayram2'})
            expect(res.statusCode).toBe(httpStatus.UN_PROCESSABLE_ENTITY);
        })
     })
     
})
