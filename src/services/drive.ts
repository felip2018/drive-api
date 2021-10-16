import fs from 'fs';
import axios from 'axios';
import { google } from 'googleapis';

const getResumibleSession = (token: string, file: any, parentFolder: string): Promise<any> => {
    return new Promise(async (resolve, reject) => {
        try {
            const body = {
                name: file.originalFilename,
                parents: [parentFolder]
            };
    
            const config = {
                headers:{
                    'Authorization': `Bearer ${token}` ,
                    'Content-Type': 'application/json;charset=utf-8',
                    'Content-Length': file.size
                }
            }

            const response = await axios.post('https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable', body, config)
            return resolve(response.headers);
        } catch (error) {
            console.log('[ERROR - getResumibleSession]', error);
            return reject(error);
        }
    });
}

const uploadFileToResumibleSession = (resumibleSession: string, token: string, file: any): Promise<any> => {
    return new Promise(async (resolve, reject) => {
        try {
            const response = await axios.put(resumibleSession, fs.createReadStream(file.path), {
                headers: {
                    'Authorization': `Bearer ${token}` ,
                    'Content-Length': file.size
                },
                maxContentLength: Infinity,
                maxBodyLength: Infinity,
            })
            resolve(response);
        } catch (error) {
            console.log('[ERROR - uploadFileToResumibleSession]', error);
        }
    });
}


const getAllFilesService = (auth: any, parentFolder: string) => {
    return new Promise(async (resolve, reject) => {
        const drive = google.drive({version: 'v3', auth});
        drive.files.list({
            fields: 'nextPageToken, files(id, name, mimeType, trashed, parents)',
            q: `'${parentFolder}' in parents`
        })
        .then(res => resolve(res))
        .catch(err => reject(err))
    });
}

const downloadFileService = (auth: any, objectId: string): Promise<any> => {
    return new Promise(async (resolve, reject) => {
        const drive = google.drive({version: 'v3', auth});
        await drive.permissions.create({
            fileId: objectId,
            requestBody: {
                role: 'reader',
                type: 'anyone'
            }
        });

        const result = await drive.files.get({
            fileId: objectId,
            fields: 'webViewLink, webContentLink'
        })
        .then(res => resolve(res))
        .catch(err => reject(err))
    })
}

const createFolderService = (auth: any,  parentFolder: string, folderName: string): Promise<any> => {
    return new Promise(async (resolve, reject) => {
        const drive = google.drive({version: 'v3', auth});
        drive.files.create({
            fields: 'id',
            requestBody: {
                name: folderName,
                mimeType: 'application/vnd.google-apps.folder',
                parents:[parentFolder]
            }
        }).then((response) => {
            resolve(response.data);
        }).catch((err) => {
            reject(err);
        });
    });
}

const searchFolderService = (auth: any, parentFolder: string, folderName: string): Promise<any> => {
    return new Promise(async (resolve, reject) => {
        const drive = google.drive({version: 'v3', auth});
        drive.files.list({
            fields: 'nextPageToken, files(id, name, mimeType, trashed, parents)',
            q: `'${parentFolder}' in parents`
        })
        .then((res) => {
            const filtered = res.data.files.filter((element) => {
                return element.name === folderName;
            });
            
            resolve(filtered.length > 0 ? filtered[0] : null)
        })
        .catch(err => reject(err))
    });
}

export {
    createFolderService,
    getAllFilesService,
    searchFolderService,
    getResumibleSession,
    uploadFileToResumibleSession,
    downloadFileService
};