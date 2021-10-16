import AWS from 'aws-sdk'; 

class SecretsController{
    public async getSecrets(): Promise<any> {
        return new Promise((resolve, reject) => {
            try {
                const REGION = process.env.REGION;
                const SECRET_NAME = process.env.SECRET_NAME;
                const client = new AWS.SecretsManager({
                    region: REGION
                });
                client.getSecretValue({SecretId: SECRET_NAME}, (err, data) => {
                    if(err) {
                        throw err;
                    } else {
                        resolve(data);
                    }
                })
            } catch (error) {
                reject(error);
            }
        });        
    }
}

const secretsController = new SecretsController();
export default secretsController;