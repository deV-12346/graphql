export class ApiResponse<T> {
    constructor(
        private success: boolean = true,
        private message: string = "Success",
        private data?:T  
    ){
        this.data = data
        this.message = message
        this.success = success
    } // automatic return object
}