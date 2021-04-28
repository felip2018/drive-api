"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadFile = void 0;
const fs_1 = __importDefault(require("fs"));
function uploadFile(drive, file, parent) {
    return new Promise(async (resolve, reject) => {
        try {
            let media = {
                mimeType: file.headers["content-type"],
                body: fs_1.default.createReadStream(file.path)
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
        }
        catch (error) {
            console.log('[Error uploadFile]', error);
            reject(error);
        }
    });
}
exports.uploadFile = uploadFile;
//# sourceMappingURL=drive.js.map