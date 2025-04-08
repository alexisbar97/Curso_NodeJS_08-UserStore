import jwt from 'jsonwebtoken';
import { envs } from './envs';

const JWT_SEED = envs.JWT_SEED;

export class JwtAdapter {
    static async generateToken(payload: any, duration: string = '2h') {
        return new Promise((resolve) => {
            jwt.sign(payload, JWT_SEED, { expiresIn: parseInt(duration) }, (err, token) => {
                if (err) {
                    resolve(err);
                }

                resolve(token);
            })
        })
    }

    static valuidateToken(token: string) {
        throw new Error('Method not implemented.');
        return;
    }
}