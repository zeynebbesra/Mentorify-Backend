// class ApiError extends Error {
//     constructor(message, statusCode){
//         super(message)
//         this.statusCode = statusCode
//     }

//     toJSON(){
//         return{
//             error: {
//                 message: this.message || "Something went wrong"
//             },
//             success: false,
//             statusCode: this.statusCode
//         }
//     }
// }

// module.exports = ApiError


class ApiError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
    }

    toJSON() {
        return {
            message: this.message,
            statusCode: this.statusCode,
            success: false,
        };
    }
}

module.exports = ApiError;
