import { Request, Response } from 'express';
import { google } from 'googleapis';
import fs from 'fs';
import authenticationService from '../services/authentication';
import { createFolderService, downloadFileService, getAllFilesService, getResumibleSession, searchFolderService, uploadFileToResumibleSession } from '../services/drive';
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
        const parentFolder = rq.header('parent-folder');
        try {
            const response = await getAllFilesService(auth, parentFolder);
            rs.json({
                status: 200,
                response
            }).end();
        } catch (error) {
            rs.json({
                status: 500,
                error
            }).end();
        }
    }

    public async searchFolder(rq: Request, rs: Response) {
        const sec = await secretsController.getSecrets();
        const secrets = JSON.parse(sec.SecretString);
        const auth = authenticationService.getOAuth2Client(secrets);
        const parentFolder = rq.header('parent-folder');
        const folderName = rq.header('folder-name');
        try {
            const response = await searchFolderService(auth, parentFolder, folderName);
            rs.json({
                status: 200,
                response
            }).end();
        } catch (error) {
            rs.json({
                status: 500,
                error
            }).end();
        }
    }

    public async createFolder(rq: Request, rs: Response) {
        const sec = await secretsController.getSecrets();
        const secrets = JSON.parse(sec.SecretString);
        const auth = authenticationService.getOAuth2Client(secrets);
        const parentFolder = rq.header('parent-folder');
        const folderName = rq.header('folder-name');
        try {
            const response = await createFolderService(auth, folderName, parentFolder);
            rs.json({
                status: 200,
                response
            }).end();
        } catch (error) {
            rs.json({
                status: 500,
                error
            }).end();
        }
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
            rs.status(409).json(error).end();
        }
    }

    public async uploadFileToDrive(rq: Request, rs: Response) {
        const sec = await secretsController.getSecrets();
        const secrets = JSON.parse(sec.SecretString);

        const auth = authenticationService.getOAuth2Client(secrets);
        const accessTokenObj = await auth.getAccessToken();
        
        const parentFolder  = rq.header('parent-folder');
        const folderName    = rq.header('search-folder');

        const form = new multiparty.Form();
        form.parse(rq, async (err, fields, files) => {
            if (err) {
                return rs.status(409).json(err).end();
            }

            if (!files.archivo) {
                return rs.status(204).json({message: 'Seleccione un archivo'}).end();
            }

            const file = files.archivo[0];

            let searchFolder = await searchFolderService(auth, parentFolder, folderName);
            
            if (!searchFolder) {
                searchFolder = await createFolderService(auth, parentFolder, folderName);
            }

            const response = await getResumibleSession(accessTokenObj.token, file, searchFolder.id);
            const upload = await uploadFileToResumibleSession(response.location, accessTokenObj.token, file);
            const result = {
                status:     upload.status,
                data: {
                    session: response.location,
                    id:      upload.data.id,
                    name:    upload.data.name
                }
            };

            return rs.status(result.status).json(result).end();
        });

    }

    public async uploadGroupValidationEvidence(rq: Request, rs: Response) {
        const sec = await secretsController.getSecrets();
        const secrets = JSON.parse(sec.SecretString);

        const auth = authenticationService.getOAuth2Client(secrets);
        const accessTokenObj = await auth.getAccessToken();
        
        const parentFolder  = rq.header('parent-folder');
        const formationName = rq.header('formation-name');
        const groupName     = rq.header('group-name');

        const form = new multiparty.Form();
        form.parse(rq, async (err, fields, files) => {
            if (err) {
                return rs.status(409).json(err).end();
            }

            if (!files.archivo) {
                return rs.status(204).json({message: 'Seleccione un archivo'}).end();
            }

            // Consultar carpeta de accion de formacion
            let formationFolder = await searchFolderService(auth, parentFolder, formationName);
            if (!formationFolder) {
                formationFolder = await createFolderService(auth, parentFolder, formationName);
            }

            // Consultar carpeta de grupo de formacion
            let groupFolder = await searchFolderService(auth, formationFolder.id, groupName);
            if (!groupFolder) {
                groupFolder = await createFolderService(auth, formationFolder.id, groupName);
            }

            for(const item of files.archivo) {
                const response = await getResumibleSession(accessTokenObj.token, item, groupFolder.id);
                await uploadFileToResumibleSession(response.location, accessTokenObj.token, item); 
            }

            const result = await downloadFileService(auth, groupFolder.id);

            rs.status(200).json(result.data).end();
        });
    }
}

const driveController = new DriveController();
export default driveController;