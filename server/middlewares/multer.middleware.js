import path from "path"
import multer from "multer"

const upload =multer({
    dest:"uploads/",
    limits:{ fileSize:50*1024*1024},//50mb
    storage:multer.diskStorage({
    destination:"uploads/" ,
    filename:   (_req,file,cb)=>{
        cb(null,file.originalname)
    },
}),
fileFilter:(_req, file, cb) =>{
    let ext = path.extname(file.originalname);

    if(
        ext !== ".jpg" &&
        ext !== ".png" &&
        ext !== ".jpeg" &&
        ext !== "webp"&&
        ext !== ".mp4"
    ) {
        cb(new Error(`Only image and video files are allowed! ${ext}`),false);
        return;
    }
    cb(null,true);
},
})

export default upload;