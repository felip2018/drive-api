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
        this.router.post('/download-file', driveController.downloadFile);
        this.router.put('/upload-file-to-drive', driveController.uploadFileToDrive);
        this.router.get('/search-folder', driveController.searchFolder);
        this.router.put('/upload-group-validation-evidence', driveController.uploadGroupValidationEvidence);
    }
}

const queryRouter = new QueryRouter();
export default queryRouter.router;