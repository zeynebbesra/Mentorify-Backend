class ApiDataSuccess {
    static send(message, statusCode, res, data){
        res.status(statusCode).json({
            success: true,
            data,
            message,
        })
    }
}


module.exports = ApiDataSuccess