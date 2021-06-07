import { Request } from 'express';

export const buildCredentialsObject = (rq: Request) => {
    return {
        clientId: rq.header('client-id'),
        clientSecret: rq.header('client-secret'),
        redirectUri: rq.header('redirect-uri'),
        refreshToken: rq.header('refresh-token')
    }
}
