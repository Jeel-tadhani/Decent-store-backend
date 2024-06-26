import multer from "multer"
import fs from "fs";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const filePath = "upload";
        fs.mkdirSync(filePath, { recursive: true })
        cb(null, filePath);

    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname);
    },
});

export const singlefileupload = multer({
    storage: storage,
}).single("file");

export const multiplefile = multer({
    storage: storage,
}).fields([{ name: 'image', maxCount: 5 }])