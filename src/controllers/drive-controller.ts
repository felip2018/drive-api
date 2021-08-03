import { Request, Response } from 'express';
import { google } from 'googleapis';
import fs from 'fs';
import authenticationService from '../services/authentication';
import { getResumibleSession, uploadFileToResumibleSession } from '../services/drive';
import multiparty from 'multiparty';
import secretsController from './secrets-controller';

class DriveController {
    
    public async getRootFolderData(rq: Request, rs: Response) {

        const sec = await secretsController.getSecrets();
        const secrets = JSON.parse(sec.SecretString);

        const auth = authenticationService.getOAuth2Client(secrets);
        const drive = google.drive({version: 'v3', auth});

        drive.files.list({
            fields:'files(id, name, parents)',
            q: "'root' in parents",
        })
        .then((data) => {
            rs.json({
                status: 200,
                response: data,
                message: 'Se ha obtenido la información del folder principal!'
            });
        })
        .catch((error) => {
            rs.json({
                status: error.code,
                response: error.data,
                message: 'Ha ocurrido un error al intentar consultar la informacion de la carpeta principal!'
            });
        });
    }

    public async getAllFiles(rq: Request, rs: Response) {
        const sec = await secretsController.getSecrets();
        const secrets = JSON.parse(sec.SecretString);

        const auth = authenticationService.getOAuth2Client(secrets);
        const drive = google.drive({version: 'v3', auth});
        const parentFolder = rq.header('parent-folder');
        drive.files.list({
            fields: 'nextPageToken, files(id, name, mimeType, trashed, parents)',
            q: `'${parentFolder}' in parents`
        }, (err, resp) => {
            if (err) {
                rs.json({
                    status: 400,
                    response: err,
                    message: 'Ha ocurrido un error al intentar consultar los elementos de Drive!'
                });
            } else {
                const obj = (resp !== null) ? resp.data.files : '';
                rs.json({
                    status: 200,
                    response: obj,
                    message: 'Se ha obtenido el listado de items'
                });
            }
        });
    }

    public async createFolder(rq: Request, rs: Response) {
        const sec = await secretsController.getSecrets();
        const secrets = JSON.parse(sec.SecretString);

        const auth = authenticationService.getOAuth2Client(secrets);
        const drive = google.drive({version: 'v3', auth});
        const parentFolder = rq.header('parent-folder');
        const folderName = rq.header('folder-name');
        drive.files.create({
            fields: 'id',
            requestBody: {
                name: folderName,
                mimeType: 'application/vnd.google-apps.folder',
                parents:[parentFolder]
            }
        }).then((file) => {
            console.log('Folder Id: ', file.data.id);
            rs.json({
                status: 200,
                message: 'La carpeta ha sido creada!',
                response: file.data
            });
        }).catch((err) => {
            rs.json({
                status: 400,
                message: 'Ha ocurrido un error al crear la carpeta',
                response: err
            });
        });
    }

    public async downloadFile(rq: Request, rs: Response) {
        const sec = await secretsController.getSecrets();
        const secrets = JSON.parse(sec.SecretString);

        const auth = authenticationService.getOAuth2Client(secrets);
        const drive = google.drive({version: 'v3', auth});
        
        try {
            const fileId = rq.header('file-id');;
            await drive.permissions.create({
                fileId: fileId,
                requestBody: {
                    role: 'reader',
                    type: 'anyone'
                }
            });
    
            const result = await drive.files.get({
                fileId: fileId,
                fields: 'webViewLink, webContentLink'
            });

            rs.status(200).json(result.data).end();
    
        } catch (error) {
            console.log(error.message);
            rs.status(error.status).json(error).end();
        }
    }

    public async uploadFileToDrive(rq: Request, rs: Response) {
        const sec = await secretsController.getSecrets();
        const secrets = JSON.parse(sec.SecretString);

        const auth = authenticationService.getOAuth2Client(secrets);
        const accessTokenObj = await auth.getAccessToken();
        
        const parentFolder = rq.header('parent-folder');

        const form = new multiparty.Form();
        form.parse(rq, async (err, fields, files) => {
            if (err) {
                return rs.status(409).json(err).end();
            }

            if (!files.archivo) {
                return rs.status(204).json({message: 'Seleccione un archivo'}).end();
            }

            const file = files.archivo[0];

            const response = await getResumibleSession(accessTokenObj.token, file, parentFolder);

            const upload = await uploadFileToResumibleSession(response.location, accessTokenObj.token, file);

        });

    }
}

const driveController = new DriveController();
export default driveController;