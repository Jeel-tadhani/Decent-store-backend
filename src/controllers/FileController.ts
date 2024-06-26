import { Response } from "express";
import { CustomRequest } from "../util/Interface/expressInterface";
import fs from 'fs';
import path from 'path';

class FileController {

    public async singleFileUpload(req: CustomRequest, res: Response) {
        try {

            if (!req.file) {
                return res.status(400).json({
                    message: 'No file uploaded',
                    status: false,
                });
            }

            res.status(200).json({
                message: 'File uploaded successfully',
                status: true,
                file: req.file.filename,
            });
        } catch (error) {
            return res.status(500).json({
                message: error.message,
                status: false,
            })
        }
    }

    public async getFile(req: CustomRequest, res: Response) {
        try {
            const file = req.params.file
            console.log(file)
            const fileImage = fs.readFileSync(`./upload/${file}`)
            console.log(fileImage)
            res.send(fileImage)
        } catch (error) {
            return res.status(500).json({
                message: error.message,
                status: false,
            })
        }
    }
}

export default FileController;