export class ApiError extends Error {

    constructor(
        public message:string = "Something Went Wrong",
        public statusCode: number,
        public success?: boolean ,
        public stack?:string 
    ){
        super(message) // calling parent constructor and passed message 
        this.statusCode = statusCode
        this.success = success ?? false
        this.stack = stack
        if(stack){
            this.stack = stack
            console.log(stack)
        }else {
            Error.captureStackTrace(this,this.constructor)
        }
    }
}