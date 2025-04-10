import jwt from 'jsonwebtoken';
import { envs } from './envs';

const JWT_SEED = envs.JWT_SEED;

export class JwtAdapter {
    static async generateToken(payload: any, duration: string = '24h') {
        return new Promise((resolve) => {
            jwt.sign(payload, JWT_SEED, { expiresIn: parseInt(duration) }, (err, token) => {
                if (err) {
                    resolve(null);
                }

                resolve(token);
            })
        })
    }

    static validateToken<T>(token: string): Promise<T | null> {
        return new Promise((resolve) => {
            jwt.verify(token, JWT_SEED, (err, decoded) => {
                if (err) {
                    resolve(null);
                }

                resolve(decoded as T);
            })
        });
    }
}