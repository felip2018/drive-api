import { google } from 'googleapis';

const CLIENT_ID = '468945521540-oknl01dvp4f8o7lkikfqkhb146j9q9q4.apps.googleusercontent.com';
const CLIENT_SECRET = 'JiOrlY2OWpp4mCNPJcHp6TV5';
const REDIRECT_URI = 'https://developers.google.com/oauthplayground';

const REFRESH_TOKEN = '1//04qgvHg7GUZhUCgYIARAAGAQSNwF-L9IrZ24De_GgpQPPNqflUftE43Su4DTY_YN1JL6JS4OA6WBWUzBUp4ZTPN_mEPZ4cVNT8OE';

class AuthenticationService {
    public getOAuth2Client() {
        const oauth2Client = new google.auth.OAuth2(
            CLIENT_ID,
            CLIENT_SECRET,
            REDIRECT_URI
        );
        
        oauth2Client.setCredentials({refresh_token: REFRESH_TOKEN});

        return oauth2Client;
    }
}

const authenticationService = new AuthenticationService();
export default authenticationService;