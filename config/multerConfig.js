import multer, { diskStorage} from "multer";
import fs from "fs";
import path from "path";

const storage = diskStorage({
    destination:(req,file,cb)=>{
        try{
            if(!fs.existsSync("uploads/profilePics")){
                fs.mkdirSync("uploads/profilePics")
            }

            cb(null,"uploads/profilePics")
        }catch(err){
            cb(err,null)
        }
    },
    filename:(req,file,cb)=>{
        const ext = path.extname(file.originalname)
        const uniqueSuffix = Date.now()+"-"+Math.round(Math.random()*1E9)
        cb(null,uniqueSuffix+ext)
    }
})

// to accept only images and reject other file types
const fileFilter = (req,file,cb)=>{
    if(file.mimetype.startsWith("image/")){
        cb(null,true) // accept file
    }else{
        cb(new Error("Only images are allowed"),false) //reject file
    }
}

export const uploads = multer({
    storage,
    fileFilter,
    limits:{
        fileSize: 5*1024*1024 // 5MB 
    }
})