import { bcryptAdapter, JwtAdapter } from "../../config";
import { UserModel } from "../../data";
import { CustomError, LoginUserDto, RegisterUserDto, UserEntity } from "../../domain";

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
            const token = await JwtAdapter.generateToken({id: user.id});

            if(!token) {
                throw CustomError.internalServer('Error generating token.');
            }

            return {
                user: userEntity,
                token: token
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
        const token = await JwtAdapter.generateToken({id: user.id});

        if(!token) {
            throw CustomError.internalServer('Error generating token.');
        }

        return {
            user: userEntity,
            token: token,
        }
    }
}