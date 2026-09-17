import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { ApiError } from "../utils/api-error.js";

const isObject = (
    val: unknown
): val is Record<string, unknown> => {
    return typeof val === "object" && val !== null;
}

export const errorHandler = (
    err: unknown,
    _req: Request,
    res: Response,
    _next: NextFunction
): void => {
    let statusCode = 500;
    let message = "Internal Server Error";

    // 1. Zod validation errors
    if (err instanceof ZodError) {
        statusCode = 400;
        message = err.issues
            .map((e) => `${e.path.join(".")}: ${e.message}`)
            .join(", ");
        res.status(statusCode).json({ success: false, error: message });
        return;
    }

    // 2. Custom ApiErrors
    if (err instanceof ApiError) {
        statusCode = err.statusCode;
        message = err.message;
        if (statusCode >= 500) console.error("[ApiError 5xx]:", err);
        res.status(statusCode).json({ success: false, error: message });
        return;
    }

    // 3. Fallback
    console.error("[Unhandled Error]:", err);
    res.status(statusCode).json({ success: false, error: message });
}

/*

1. This isObject syntax

You have:

const isObject = (val: unknown): val is Record<string, unknown> =>
    typeof val === "object" && val !== null;

At first glance this looks horrible 😂, but it's actually just a normal arrow function + a TypeScript type predicate.

Let's break it apart.

Part 1: val: unknown
(val: unknown)

means:

This function accepts a value called val, and its type is unknown.

Why unknown?

Because your err is:

err: unknown

An error in JavaScript can technically be anything:

throw "hello";

throw 123;

throw { code: "23505" };

throw new Error("Something failed");

So TypeScript doesn't let you safely do:

err.code

when:

err: unknown

because maybe err is a string.

That's why you're creating isObject().

2. Record<string, unknown>

This:

Record<string, unknown>

basically means:

An object whose properties have string keys and whose values can be anything.

For example:

{
    code: "23505",
    message: "duplicate key",
    detail: "..."
}

fits:

Record<string, unknown>

because:

code    → string
message → string
detail  → string

The values don't all have to be the same type.

For example, this is also valid:

{
    code: "23505",
    retryable: false,
    attempts: 3
}

because:

key → string
value → unknown
3. The weird part: val is Record<string, unknown>

This is called a type predicate.

val is Record<string, unknown>

doesn't mean the function returns an object.

It means:

If this function returns true, TypeScript should treat val as a Record<string, unknown> from that point onward.

That's the important part.

Without isObject

Imagine:

function isObject(val: unknown) {
    return typeof val === "object" && val !== null;
}

Then:

if (isObject(err)) {
    console.log(err.code);
}

TypeScript may still complain because it doesn't necessarily know that your isObject() function guarantees a particular type.

With the type predicate
const isObject = (
    val: unknown
): val is Record<string, unknown> =>
    typeof val === "object" && val !== null;

Now TypeScript understands:

if (isObject(err)) {
    err.code
}

because inside the if, TypeScript knows:

err: Record<string, unknown>
4. Why typeof val === "object" isn't enough

This is a small JavaScript gotcha.

typeof null

is:

"object"

🤦 JavaScript historical weirdness.

So:

typeof val === "object"

would allow:

null

Therefore you need:

&& val !== null

So:

typeof val === "object" && val !== null

means:

Is this actually a non-null object?

5. So read the whole thing like this
const isObject =
    (val: unknown)
    : val is Record<string, unknown>
    =>
    typeof val === "object" && val !== null;

In English:

Create an arrow function called isObject. It accepts anything. It returns a boolean, but more specifically, if it returns true, TypeScript should consider the value to be an object with string keys.

*/