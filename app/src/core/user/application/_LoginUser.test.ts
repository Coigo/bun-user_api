import {expect, it} from 'vitest'
import LoginUser from './LoginUser'

import UserCollection from '../adapters/tmp/tmp_UserRepository'
import CreateUser from './CreateUser'
import PassKey from '../adapters/tmp/tmp_PassKey'
import Mailer from '../adapters/tmp/tmp_Mailer'
import UserRepository from '../adapters/tmp/tmp_UserRepository'
import Jwt from '../adapters/tmp/tmp_Jwt'
import type User from '../domain/User'
import  type { error } from '../../shared/Errors'


const clearColection = new UserCollection().clear

const newUser: User = {
    username:'newUser',
    email:'test@test.com'
}

it('Should be possible to login normally', async () => {
    clearColection()

    const create = new CreateUser(new PassKey, new Mailer, new UserRepository)
    const login = new LoginUser(new Mailer, new UserRepository, new Jwt)

    await create.handle(newUser)

    const result = await login.handle({passKey: '123456', email:"test@test.com"})

    expect(result. jwt ).toEqual('jwt')
    expect(result.errors).toEqual([])

})

it('Shold not be possible to login with not created token', async () => {
    clearColection()

    const create = new CreateUser(new PassKey, new Mailer, new UserRepository)
    const login = new LoginUser(new Mailer, new UserRepository, new Jwt)

    await create.handle(newUser)
    const result = await login.handle({passKey: '098765', email:"test@test.com"})

	const errorExpected: error[] = [
		{
            message: "Invalid Token",
			code: 400,
		},
	];
    
    expect(result. jwt ).toBeUndefined()
    expect(result.errors).toEqual(errorExpected)

})

it('Should not be possible to login with a expired token', async () => {
    clearColection()

    const create = new CreateUser(new PassKey, new Mailer, new UserRepository)
    const login = new LoginUser(new Mailer, new UserRepository, new Jwt)

    await create.handle(newUser)

    const result = await login.handle({passKey: '654321', email:"test@test.com"})


	const errorExpected: error[] = [
		{
            message: "Invalid Token",
			code: 400,
		},
	];
    expect(result. jwt ).toBeUndefined()
    expect(result.errors).toEqual(errorExpected);

})

it('Should not be possible to login two times with the same token', async () => {
    clearColection()

    const create = new CreateUser(new PassKey, new Mailer, new UserRepository)
    const login = new LoginUser(new Mailer, new UserRepository, new Jwt)

    await create.handle(newUser)
    await login.handle({passKey: '123456', email:"test@test.com"})

    const result = await login.handle({passKey: '123456', email:"test@test.com"}) 

    const errorExpected: error[] = [
		{
            message: "Invalid Token",
			code: 400,
		},
	];

    expect( result.jwt ).toBeUndefined()
    expect(result.errors).toEqual(errorExpected)
})