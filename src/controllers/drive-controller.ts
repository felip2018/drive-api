import { Request, Response } from 'express';
import { google } from 'googleapis';
import authenticationService from '../services/authentication';
import {uploadFile} from '../services/drive';
import multiparty from 'multiparty';
import fs from 'fs';

class DriveController {
    
    public async getRootFolderData(rq: Request, rs: Response) {
        const auth = authenticationService.getOAuth2Client(rq);
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
        const auth = authenticationService.getOAuth2Client(rq);
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
        const auth = authenticationService.getOAuth2Client(rq);
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

    public uploadFile(rq: Request, rs: Response) {
        const auth = authenticationService.getOAuth2Client(rq);
        const drive = google.drive({version: 'v3', auth});
        const parentFolder = rq.header('parent-folder');

        let form = new multiparty.Form();
        form.parse(rq, async (err, fields, files) => {
            if(err){ 
                rs.json({
                    status: 400,
                    message: 'Ha ocurrido un error al cargar el archivo',
                    response: err
                }); 
            }

            if(files.archivo) {

                const archivo = files.archivo;
                const response = await uploadFile(drive, archivo[0], parentFolder);

                rs.json({
                    status: response.status,
                    message: response.statusText,
                    response: response.data
                });

            } else {
                rs.json({
                    status: 404,
                    message: 'No hay archivos para subir a Drive!',
                    response: err
                });
            }

        });
    }

    public async downloadFile(rq: Request, rs: Response) {
        const auth = authenticationService.getOAuth2Client(rq);
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

}

const driveController = new DriveController();
export default driveController;