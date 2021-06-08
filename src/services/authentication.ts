import { google } from 'googleapis';

class AuthenticationService {
    public getOAuth2Client(secrets: any) {
        const oauth2Client = new google.auth.OAuth2(
            secrets.CLIENT_ID,
            secrets.CLIENT_SECRET,
            secrets.REDIRECT_URI
        );
        
        oauth2Client.setCredentials({refresh_token: secrets.REFRESH_TOKEN});

        return oauth2Client;
    }
}

const authenticationService = new AuthenticationService();
export default authenticationService;