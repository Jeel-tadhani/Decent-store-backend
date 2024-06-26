import * as express from 'express';
import { authorizeRoles } from '../middleware/verifyToken';
import FileController from '../controllers/FileController';
import { singlefileupload } from '../util/multer';

const fileRoutes = express.Router();

const Controller = new FileController();

fileRoutes.post("/upload", singlefileupload, Controller.singleFileUpload)
fileRoutes.get("/view/:file", Controller.getFile)


export default fileRoutes;