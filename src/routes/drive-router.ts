import { Router } from 'express';
import driveController from '../controllers/drive-controller';

class QueryRouter {
    public router: Router = Router();

    constructor() {
        this.config();
    }

    private config(): void {
        this.router.get('/get-root-data', driveController.getRootFolderData);
        this.router.get('/get-all-files', driveController.getAllFiles);
        this.router.post('/create-folder', driveController.createFolder);
        this.router.post('/upload-file', driveController.uploadFile);
        this.router.post('/download-file', driveController.downloadFile);
    }
}

const queryRouter = new QueryRouter();
export default queryRouter.router;