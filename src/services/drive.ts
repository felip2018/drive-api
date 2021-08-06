import fs from 'fs';
import axios from 'axios';

function uploadFile(drive: any, file: any, parent: string): Promise<any> {
    return new Promise(async (resolve, reject) => {
        try {
            let media = {
                mimeType: file.headers["content-type"],
                body: fs.createReadStream(file.path)
            };
            let response = await drive.files.create({
                requestBody: {
                    name: file.originalFilename,
                    parents: [parent]
                },
                media: media,
                fields: 'id, name',
            });
            return resolve(response);
        } catch (error) {
            console.log('[Error uploadFile]', error);
            return reject(error);
        }    
    });
}

function getResumibleSession(token: string, file: any, parentFolder: string): Promise<any>{
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

function uploadFileToResumibleSession(resumibleSession: string, token: string, file: any): Promise<any> {
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
            return resolve(response);
        } catch (error) {
            console.log('[ERROR - uploadFileToResumibleSession]', error);
        }
    });
}

export {
    uploadFile,
    getResumibleSession,
    uploadFileToResumibleSession
};