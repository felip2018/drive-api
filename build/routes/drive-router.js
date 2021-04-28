"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const drive_controller_1 = __importDefault(require("../controllers/drive-controller"));
class QueryRouter {
    constructor() {
        this.router = express_1.Router();
        this.config();
    }
    config() {
        this.router.get('/getRootData', drive_controller_1.default.getRootFolderData);
        this.router.get('/getAllFiles', drive_controller_1.default.getAllFiles);
        this.router.post('/createFolder', drive_controller_1.default.createFolder);
        this.router.post('/uploadFile', drive_controller_1.default.uploadFile);
        this.router.post('/downloadFile', drive_controller_1.default.downloadFile);
        this.router.post('/deleteFile', drive_controller_1.default.deleteFile);
    }
}
const queryRouter = new QueryRouter();
exports.default = queryRouter.router;
//# sourceMappingURL=drive-router.js.map