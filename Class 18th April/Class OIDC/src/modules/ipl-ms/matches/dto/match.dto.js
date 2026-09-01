import z from "zod";
import mongoose from "mongoose";

const objectId = z.string().refine(
    (id) => mongoose.Types.ObjectId.isValid(id),
    {
        message: "Invalid MongoDB ObjectId"
    }
);

// Create Match
export const registerMatchSchema = z.object({
    team1: objectId,

    team2: objectId,

    date: z.coerce.date({
        message: "Invalid match date"
    }),

    result: z
        .string()
        .trim()
        .optional()
        .nullable(),

    venue: objectId,

    status: z
        .enum(
            ["scheduled", "live", "completed", "cancelled"],
            {
                message: "Status must be scheduled, live, completed, or cancelled"
            }
        ),
}).refine(
    (data) => data.team1 !== data.team2,
    {
        message: "A team cannot play against itself",
        path: ["team2"]
    }
);

// Update Match
export const updateMatchSchema = z.object({
    team1: objectId.optional(),

    team2: objectId.optional(),

    date: z
        .coerce
        .date({
            message: "Invalid match date"
        })
        .optional(),

    result: z
        .string()
        .trim()
        .optional()
        .nullable(),

    venue: objectId.optional(),

    status: z
        .enum(
            ["scheduled", "live", "completed", "cancelled"],
            {
                message: "Status must be scheduled, live, completed, or cancelled"
            }
        )
        .optional()
}).refine(
    (data) => Object.keys(data).length > 0,
    {
        message: "At least one field is required for update"
    }
).refine(
    (data) => {
        if(data.team1 && data.team2) {
            return data.team1 !== data.team2;
        }

        return true;
    },
    {
        message: "A team cannot play against itself",
        path: ["team2"]
    }
);

// Match ID from params
export const matchIdSchema = z.object({
    matchId: objectId
});


/*

Sure bro. This `.refine()` is basically adding a **custom validation rule** that Zod cannot express with just `.string()`, `.enum()`, `.optional()`, etc.

You have:

```js
.refine(
    (data) => data.team1 !== data.team2,
    {
        message: "A team cannot play against itself",
        path: ["team2"]
    }
)
```

Let's break it down.

---

## 1. What is `data`?

When you do:

```js
registerMatchSchema.parse(req.body);
```

Zod first validates all the individual fields.

Suppose the request is:

```json
{
    "team1": "6a870f0cfc46d9e07ae01d44",
    "team2": "6a870f18fc46d9e07ae01d45",
    "date": "2026-08-25T19:30:00.000Z",
    "venue": "6a88151ad8d6e004614dae8b"
}
```

After validating the fields, `.refine()` receives the **entire object** as `data`.

So conceptually:

```js
data = {
    team1: "6a870f0cfc46d9e07ae01d44",
    team2: "6a870f18fc46d9e07ae01d45",
    date: Date,
    venue: "..."
}
```

Therefore you can access:

```js
data.team1
data.team2
```

---

# 2. What does this mean?

```js
(data) => data.team1 !== data.team2
```

This is the actual validation condition.

We're saying:

> "The value of `team1` must NOT be equal to the value of `team2`."

### Valid example

```text
team1 = CSK
team2 = MI
```

So:

```js
data.team1 !== data.team2
```

becomes:

```js
"CSK_ID" !== "MI_ID"
```

which is:

```js
true
```

✅ Validation passes.

---

### Invalid example

Suppose someone sends:

```json
{
    "team1": "6a870f0cfc46d9e07ae01d44",
    "team2": "6a870f0cfc46d9e07ae01d44"
}
```

Now:

```js
data.team1 !== data.team2
```

becomes:

```js
"6a870f0cfc46d9e07ae01d44"
    !==
"6a870f0cfc46d9e07ae01d44"
```

That's:

```js
false
```

❌ Validation fails.

Because you're trying to create:

```text
CSK vs CSK
```

which doesn't make sense for your match model.

---

# 3. What does `message` do?

```js
{
    message: "A team cannot play against itself"
}
```

If the condition returns `false`, Zod generates this validation error.

Instead of some generic error, you get:

```text
A team cannot play against itself
```

So it's basically the error message for this custom rule.

---

# 4. What does `path: ["team2"]` do?

This part is actually pretty useful:

```js
path: ["team2"]
```

It tells Zod:

> "If this validation fails, associate the error with the `team2` field."

So instead of the error being attached to the entire object, Zod can report something conceptually like:

```text
team2: A team cannot play against itself
```

This is useful for frontend forms.

For example, your frontend could display:

```text
Team 1: [ CSK ▼ ]

Team 2: [ CSK ▼ ]
         ↑
    A team cannot play against itself
```

rather than:

```text
Match: A team cannot play against itself
```

---

# Now the UPDATE `.refine()`

This one is slightly different:

```js
.refine(
    (data) => {
        if (data.team1 && data.team2) {
            return data.team1 !== data.team2;
        }

        return true;
    },
    {
        message: "A team cannot play against itself",
        path: ["team2"]
    }
)
```

The reason it's different is because **all fields in your update schema are optional**.

For example:

```js
export const updateMatchSchema = z.object({
    team1: objectId.optional(),
    team2: objectId.optional(),
    date: z.coerce.date().optional(),
    venue: objectId.optional(),
    status: z.enum([...]).optional()
});
```

You can update only one field.

For example:

```json
{
    "status": "completed"
}
```

There is no:

```js
data.team1
```

and no:

```js
data.team2
```

So we **cannot blindly do**:

```js
data.team1 !== data.team2
```

because both could be `undefined`.

---

## Why do we check this?

We do:

```js
if (data.team1 && data.team2) {
```

Meaning:

> "Only perform the team1/team2 comparison if the user provided BOTH teams."

### Case 1 — Both teams provided

```json
{
    "team1": "CSK_ID",
    "team2": "MI_ID"
}
```

Both exist:

```js
data.team1 && data.team2
```

→ `true`

So we check:

```js
data.team1 !== data.team2
```

Different IDs → ✅ valid.

---

### Case 2 — Only team1 provided

```json
{
    "team1": "CSK_ID"
}
```

Here:

```js
data.team1 = "CSK_ID"
data.team2 = undefined
```

The condition:

```js
if (data.team1 && data.team2)
```

is false.

So we go to:

```js
return true;
```

Meaning:

> "That's fine. They're only updating team1, so there's nothing to compare yet."

✅ Valid.

---

### Case 3 — Only team2 provided

```json
{
    "team2": "MI_ID"
}
```

Same thing.

We don't know what the existing `team1` is from the request alone.

So:

```js
return true;
```

✅ Valid.

The **service/database layer** can handle the complete existing match if you want to enforce that final state as well.

---

### Case 4 — Both provided and same

```json
{
    "team1": "CSK_ID",
    "team2": "CSK_ID"
}
```

Both exist, so:

```js
data.team1 !== data.team2
```

becomes:

```js
false
```

❌ Validation fails.

```text
A team cannot play against itself
```

---

# The important difference

### Register

You are creating the **whole match**, so both teams are required:

```js
.refine(
    (data) => data.team1 !== data.team2,
    ...
)
```

Simple.

### Update

You might update only one field, so both teams aren't necessarily present:

```js
.refine(
    (data) => {
        if (data.team1 && data.team2) {
            return data.team1 !== data.team2;
        }

        return true;
    },
    ...
)
```

So the logic is:

```text
                 UPDATE REQUEST
                       │
             Are team1 AND team2
                  provided?
                  /        \
                YES         NO
                 │           │
                 ↓           ↓
           Compare them    Allow it
                 │
          ┌──────┴──────┐
          ↓             ↓
       Different       Same
          │             │
          ↓             ↓
        VALID         ERROR
```

### One important improvement for your project

There is a subtle issue with the **update** version.

Imagine the existing match is:

```text
CSK vs MI
```

Then someone sends:

```json
{
    "team2": "CSK_ID"
}
```

Your DTO sees only `team2`, so it returns `true`.

But after the update, the match would become:

```text
CSK vs CSK
```

So for your application, I would **also enforce the final `team1 !== team2` condition in the service**, after combining the existing match with the update data.

That way:

**DTO → validates the request**

**Service → validates the resulting business state**

That's the safer architecture for your Match module.


*/