import { bcryptAdapter, envs, JwtAdapter } from "../../config";
import { UserModel } from "../../data";
import { CustomError, LoginUserDto, RegisterUserDto, UserEntity } from "../../domain";
import { EmailService } from "./email.service";

export class AuthService {
    constructor(
        private readonly emailService: EmailService
    ) {}

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
            await this.sendEmailValidationLink(user.email);
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

    private sendEmailValidationLink = async (email: string) => {
        const token = await JwtAdapter.generateToken({ email });

        if(!token) {
            throw CustomError.internalServer('Error generating token.');
        }

        const link = `${envs.WEBSERVICE_URL}/auth/validate-email/${token}`;
        const html = `
            <h1>Validate your email</h1>
            <p>Click on the following link to validate your email: </p>
            <a href="${link}">Validate your email: ${email}</a>
        `

        const options = {
            to: email,
            subject: 'Validate your email',
            htmlBody: html
        }

        const isSent = await this.emailService.sendEmail(options);

        if(!isSent) {
            throw CustomError.internalServer('Error sending email.');
        }

        return true;
    }

    public validateEmail = async (token: string) => {
        const payload = await JwtAdapter.validateToken(token);

        if(!payload) {
            throw CustomError.unauthorized('Invalid token.');
        }

        const { email } = payload as { email: string };

        if (!email) {
            throw CustomError.internalServer('Error validating email.');
        }

        const user = await UserModel.findOne({ email });

        if(!user) {
            throw CustomError.internalServer('Email not found.');
        }

        user.emailValidated = true;
        await user.save();

        return true;
    }
}