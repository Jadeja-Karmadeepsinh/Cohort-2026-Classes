import z from "zod";
import mongoose from "mongoose";

export const playerIdSchema = z.object({
    playerId: z.string().refine(
        (id) => mongoose.Types.ObjectId.isValid(id),
        {
            message: "Invalid player ID"
        }
    )
});

export const playerRegisterSchema = z.object({
    name: z.string().trim().min(5, "Name must be at least 10 characters").max(100, "Name cannot exceed 100 characters"),
    age: z.number().int().min(10, "Player must be at least 10 years old"),
    nationality: z.string().trim().min(3).max(50),
    role: z.enum(["batter", "bowler", "all-rounder", "wicket-keeper"]),
    team: playerIdSchema.nullable().optional()
});

export const updatePlayerSchema = z.object({
    name: z.string().trim().min(10, "Name must be at least 10 characters").max(100, "Name cannot exceed 100 characters").optional(),
    age: z.number().int().min(10, "Player must be at least 10 years old").optional(),
    nationality: z.string().trim().min(3).max(50).optional(),
    role: z.enum(["batter", "bowler", "all-rounder", "wicket-keeper"]).optional(),
    team: playerIdSchema.nullable().optional()
}).refine(
    (data) => Object.keys(data).length > 0,
    {
        message: "At least one field is required for update"
    }
);

/*

Then .refine()
.refine(...)

lets you add a custom validation condition.

The first argument is:

(id) => mongoose.Types.ObjectId.isValid(id)

This is just a function.

You can think of it as:

function (id) {
    return mongoose.Types.ObjectId.isValid(id);
}

Zod will give the actual value to this function.

For example:

id = "68a4f7c9e12b3a5d8c901234"

Then:

mongoose.Types.ObjectId.isValid(id)

might return:

true

So Zod says:

✅ Custom validation passed.

3. What if it's invalid?

Suppose:

id = "123"

Then:

mongoose.Types.ObjectId.isValid("123")

returns:

false

So refine() says:

❌ Custom validation failed.

And Zod produces the error:

{
    message: "Invalid player ID"
}

because you specified:

{
    message: "Invalid player ID"
}

*/