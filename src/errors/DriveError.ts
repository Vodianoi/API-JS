export default class DriveError extends Error {
    message: string;
    code: number;

    constructor(code: number, message: string) {
        super(message);
        this.message = message;
        this.code = code;
    }
}