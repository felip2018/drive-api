"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const googleapis_1 = require("googleapis");
const authentication_1 = __importDefault(require("../services/authentication"));
const multiparty_1 = __importDefault(require("multiparty"));
const fs_1 = __importDefault(require("fs"));
class DriveController {
    async getRootFolderData(rq, rs) {
        const auth = authentication_1.default.getOAuth2Client();
        const drive = googleapis_1.google.drive({ version: 'v3', auth });
        drive.files.list({
            fields: 'files(id, name, parents)',
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
    async getAllFiles(rq, rs) {
        const auth = authentication_1.default.getOAuth2Client();
        const drive = googleapis_1.google.drive({ version: 'v3', auth });
        drive.files.list({
            fields: 'nextPageToken, files(id, name, mimeType, trashed, parents)',
            q: `'${rq.body.parent}' in parents`
        }, (err, resp) => {
            if (err) {
                rs.json({
                    status: 400,
                    response: err,
                    message: 'Ha ocurrido un error al intentar consultar los elementos de Drive!'
                });
            }
            else {
                const obj = (resp !== null) ? resp.data.files : '';
                rs.json({
                    status: 200,
                    response: obj,
                    message: 'Se ha obtenido el listado de items'
                });
            }
        });
    }
    async createFolder(rq, rs) {
        const auth = authentication_1.default.getOAuth2Client();
        const drive = googleapis_1.google.drive({ version: 'v3', auth });
        drive.files.create({
            fields: 'id',
            requestBody: {
                name: rq.body.name,
                mimeType: 'application/vnd.google-apps.folder',
                parents: [rq.body.parent]
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
    uploadFile(rq, rs) {
        const auth = authentication_1.default.getOAuth2Client();
        const drive = googleapis_1.google.drive({ version: 'v3', auth });
        let form = new multiparty_1.default.Form();
        form.parse(rq, (err, fields, files) => {
            if (err) {
                rs.json({
                    status: 400,
                    message: 'Ha ocurrido un error al cargar el archivo',
                    response: err
                });
            }
            if (files.archivo) {
                let archivosCargados = [];
                let archivosErroneos = [];
                const archivos = files.archivo;
                archivos.map(async (file) => {
                    //let res = await uploadFile(drive, file, fields.parentFolder[0]);
                    //console.log(`Status:: ${res.status}, Data: ${JSON.stringify(res.data)}`);
                    let media = {
                        mimeType: file.headers["content-type"],
                        body: fs_1.default.createReadStream(file.path)
                    };
                    const response = await drive.files.create({
                        requestBody: {
                            parents: [fields.parentFolder[0]],
                            name: file.originalFilename,
                            mimeType: media.mimeType
                        },
                        media
                    });
                    console.log(response.data);
                });
                rs.json({
                    status: 200,
                    message: 'Resultado de cargue archivos!',
                    response: {
                        success: archivosCargados,
                        wrong: archivosErroneos
                    }
                });
            }
            else {
                rs.json({
                    status: 404,
                    message: 'No hay archivos para subir a Drive!',
                    response: err
                });
            }
            /*Object.keys(files).forEach(function(name) {
                console.log('got file named ' + name);
            });*/
        });
    }
    async downloadFile(rq, rs) {
        const auth = authentication_1.default.getOAuth2Client();
        const drive = googleapis_1.google.drive({ version: 'v3', auth });
        try {
            const fileId = rq.body.fileId;
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
            console.log(result.data);
            rs.status(200).json(result.data).end();
        }
        catch (error) {
            console.log(error.message);
            rs.status(error.status).json(error).end();
        }
    }
    async deleteFile(rq, rs) {
        rs.json({
            message: 'deleteFile'
        });
    }
}
const driveController = new DriveController();
exports.default = driveController;
//# sourceMappingURL=drive-controller.js.map