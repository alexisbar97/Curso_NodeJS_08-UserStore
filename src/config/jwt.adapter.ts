import jwt from 'jsonwebtoken';
import { parse } from 'path';

export class JwtAdapter {
    static async generateToken(payload: any, duration: string = '2h') {
        return new Promise((resolve) => {
            jwt.sign(payload, "SEED", { expiresIn: parseInt(duration) }, (err, token) => {
                if (err) {
                    resolve(err);
                }

                resolve(token);
            })
        })
    }

    static valuidateToken(token: string) {
        
    }
}