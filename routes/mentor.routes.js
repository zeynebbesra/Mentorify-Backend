const express = require('express')
const mentorController = require('../controllers/mentor.controller')
const router = express.Router()
const multer = require('multer')


const storage = multer.diskStorage({
    destination: function (req, file, cb){
        cb(null, 'public/uploads')
    },
    filename: function(req, file, cb){
        cb(null, file.fieldname + '-' + Date.now())
    }
})

const upload = multer({storage: storage})


router
    .route('/')
    .get(mentorController.getMentors)

router
    .route('/register')
    .post(upload.single('photo'), mentorController.register)

router
    .route('/login')
    .post(mentorController.login)

router
    .route('/update/:id')
    .put(mentorController.updateMentor)

router
    .route('/delete/:id')
    .delete(mentorController.deleteMentor)

module.exports = router
