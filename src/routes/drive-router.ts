import { Router } from 'express';
import driveController from '../controllers/drive-controller';

class QueryRouter {
    public router: Router = Router();

    constructor() {
        this.config();
    }

    private config(): void {
        this.router.get('/getRootData', driveController.getRootFolderData);
        this.router.get('/getAllFiles', driveController.getAllFiles);
        this.router.post('/createFolder', driveController.createFolder);
        this.router.post('/uploadFile', driveController.uploadFile);
        this.router.post('/downloadFile', driveController.downloadFile);
        this.router.post('/deleteFile', driveController.deleteFile);
    }
}

const queryRouter = new QueryRouter();
export default queryRouter.router;