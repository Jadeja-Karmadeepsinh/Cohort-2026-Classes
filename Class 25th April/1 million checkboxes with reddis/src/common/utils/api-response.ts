import { HttpStatus } from "../constants/httpStatus.js";
import type { Response } from "express";

export class ApiResponse {
    static ok<T>(
        res: Response,
        message: string,
        data: T | null = null
    ): Response {
        return res.status(HttpStatus.OK).json({
            success: true,
            message,
            data
        });
    }

    static created<T>(
        res: Response,
        message: string,
        data: T | null = null
    ): Response {
        return res.status(HttpStatus.CREATED).json({
            success: true,
            message,
            data
        });
    }

    static noContent(res: Response): Response {
        return res.status(HttpStatus.NO_CONTENT).send();
    }
}



/*

<T> — generic

This is one of the most important TypeScript syntaxes here:

static ok<T>(

T is a generic type parameter.

Think of T as:

"I don't know the type yet. Let whoever calls this function tell me."

For example:

function print<T>(value: T) {
    console.log(value);
}

If you do:

print("hello");

TypeScript figures out:

T = string

If:

print(123);

then:

T = number

If:

print({ name: "John" });

then:

T = { name: string }

*/
