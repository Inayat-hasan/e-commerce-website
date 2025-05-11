import multer from "multer";
import path from "path";
import fs from "fs";

const temp_dir = process.env.TEMP_DIR;

if (!fs.existsSync(temp_dir)) {
  fs.mkdirSync(temp_dir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, temp_dir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 8)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png|gif/;
    const extname = fileTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = fileTypes.test(file.mimetype);

    if (mimetype && extname) return cb(null, true);
    cb(new Error("Only images are allowed"));
  },
});

export default upload;
