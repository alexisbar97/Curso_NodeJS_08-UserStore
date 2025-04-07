import { UserModel } from "../../data";
import { CustomError, RegisterUserDto } from "../../domain";

export class AuthService {
    constructor() {}

    public async registerUser(registerUserDto: RegisterUserDto) {
        const existeUser = await UserModel.findOne({ email: registerUserDto.email });

        if (existeUser) {
            throw CustomError.badRequest('Email already exists.');
        }

        return 'Todo OK.'
    }
}