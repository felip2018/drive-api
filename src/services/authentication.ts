import { google } from 'googleapis';
import { Request } from 'express';
import { buildCredentialsObject } from '../utils/mapper-utils';

const CLIENT_ID = '468945521540-oknl01dvp4f8o7lkikfqkhb146j9q9q4.apps.googleusercontent.com';
const CLIENT_SECRET = 'JiOrlY2OWpp4mCNPJcHp6TV5';
const REDIRECT_URI = 'https://developers.google.com/oauthplayground';

const REFRESH_TOKEN = '1//04qgvHg7GUZhUCgYIARAAGAQSNwF-L9IrZ24De_GgpQPPNqflUftE43Su4DTY_YN1JL6JS4OA6WBWUzBUp4ZTPN_mEPZ4cVNT8OE';

class AuthenticationService {
    public getOAuth2Client(request: Request) {
        const credentials = buildCredentialsObject(request);
        const oauth2Client = new google.auth.OAuth2(
            credentials.clientId,
            credentials.clientSecret,
            credentials.redirectUri
        );
        
        oauth2Client.setCredentials({refresh_token: credentials.refreshToken});

        return oauth2Client;
    }
}

const authenticationService = new AuthenticationService();
export default authenticationService;