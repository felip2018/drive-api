import fs from 'fs';

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
            resolve(response);
        } catch (error) {
            console.log('[Error uploadFile]', error);
            reject(error);
        }    
    });
}

export {
    uploadFile
};