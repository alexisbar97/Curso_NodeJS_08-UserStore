import { bcryptAdapter } from "../../config";
import { UserModel } from "../../data";
import { CustomError, LoginUserDto, RegisterUserDto, UserEntity } from "../../domain";
import path from 'path';

export class AuthService {
    constructor() {}

    public async registerUser(registerUserDto: RegisterUserDto) {
        const existUser = await UserModel.findOne({ email: registerUserDto.email });

        if (existUser) {
            throw CustomError.badRequest('Email already exists.');
        }

        try {
            const user = new UserModel(registerUserDto);

            // Encriptar Contraseña
            user.password = bcryptAdapter.hash(registerUserDto.password);
            await user.save();

            // Email de Confirmación
            const {password, ...userEntity} = UserEntity.fromObject(user);

            return {
                user: userEntity,
                token: 'ABC'
            };
        } catch (error) {
            throw CustomError.internalServer(`${error}`);
        }
    }

    public async loginUser(loginUserDto: LoginUserDto) {
        const user = await UserModel.findOne({ email: loginUserDto.email });
        
        if(!user) {
            throw CustomError.badRequest('Email not found.');
        }

        const isMatch = bcryptAdapter.compare(loginUserDto.password, user.password);

        if(!isMatch) {
            throw CustomError.badRequest('Password not match.');
        }

        const {password, ...userEntity} = UserEntity.fromObject(user);

        return {
            user: userEntity,
            token: 'ABC'
        }
    }
}