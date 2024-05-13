// const multer = require('multer')


// const FILE_TYPE_MAP = {
//     'image/png': 'png',
//     'image/jpeg': 'jpeg',
//     'image/jpg': 'jpg',
// }

// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//       const isValid = FILE_TYPE_MAP[file.mimetype]
//       let uploadError = new Error('invalid image type')
  
//       if(isValid) {
//         uploadError = null
//       }
  
//       cb(uploadError, 'public/uploads')
//     },
//     filename: function (req, file, cb) {
//         const fileName = file.originalname.split(' ').join('-')
//         const extension = FILE_TYPE_MAP[file.mimetype] 
//         const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
//         cb(null, `${fileName}-${uniqueSuffix}.${extension}`);
//     }
//   })
  
//   const uploadOptions = multer({ storage: storage })

//   module.exports = uploadOptions;

const multer = require('multer');


const FILE_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg',
};

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const isValid = FILE_TYPE_MAP[file.mimetype];
        let uploadError = new Error('invalid image type');

        if (isValid) {
            uploadError = null;
        }

        cb(uploadError, 'public/uploads');
    },
    filename: function (req, file, cb) {
        const fileName = file.originalname.split(' ').join('-');
        const extension = FILE_TYPE_MAP[file.mimetype];
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
        cb(null, `${fileName}-${uniqueSuffix}.${extension}`);
    }
});

const uploadOptions = multer({ storage: storage });

const uploadImage = (req, existingImagePath = null) => {
    const file = req.file;
    if (file) {
        const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;
        return `${basePath}${file.filename}`;
    }
    return existingImagePath;
};

module.exports = { uploadOptions, uploadImage };
