import { google } from 'googleapis';
import { Request } from 'express';
import { buildCredentialsObject } from '../utils/mapper-utils';

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