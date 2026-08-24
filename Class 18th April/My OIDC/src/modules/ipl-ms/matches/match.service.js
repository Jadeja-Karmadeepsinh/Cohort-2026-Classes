import { ApiError } from "../../../common/utils/api-error.js";
import Match from "./match.model.js";
import Team from "../teams/team.model.js";
import Venue from "../venues/venue.model.js";

export class MatchService {
    static async registerMatch(data) {
        // 1. Check both teams exist
        const [team1, team2] = await Promise.all([
            Team.findById(data.team1),
            Team.findById(data.team2)
        ]);

        if (!team1) {
            throw ApiError.notFound("Team 1 not found");
        }

        if (!team2) {
            throw ApiError.notFound("Team 2 not found");
        }

        // 2. Check venue exists
        const venue = await Venue.findById(data.venue);

        if (!venue) {
            throw ApiError.notFound("Venue not found");
        }

        if(data.team1.toString() === data.team2.toString()) {
            throw ApiError.conflict(
                "A team cannot play against itself"
            );
        }

        // 4. Check duplicate matchup at same date/time
        const existingMatch = await Match.findOne({
            date: data.date,
            $or: [
                {
                    team1: data.team1,
                    team2: data.team2
                },
                {
                    team1: data.team2,
                    team2: data.team1
                }
            ]
        });

        if (existingMatch) {
            throw ApiError.conflict(
                "A match between these teams is already scheduled at this date and time"
            );
        }

        // 5. Create match
        const match = await Match.create(data);

        // 6. Return match
        return match;
    }

    static async getAllMatches() {
        //1. fetch all matches from db
        const matches = await Match.find()
            .populate("team1", "name shortHand")
            .populate("team2", "name shortHand")
            .populate("venue", "name")
            .sort({ date: 1 });
    
        //2. return all matches
        return matches;
    }

    static async getMatchById(id) {
        //1. check if a match with given id exsists in db or not
        const match = await Match.findById(id)
            .populate("team1", "name shortHand")
            .populate("team2", "name shortHand")
            .populate("venue", "name");

        //2. if not then send error not found
        if (!match) {
            throw ApiError.notFound("Match not found");
        }

        //3. if found then return that match 
        return match;
    }

    static async updateMatchById(id, data) {
        // 1. Find existing match
        const match = await Match.findById(id);

        if (!match) {
            throw ApiError.notFound("Match not found");
        }

        // 2. Determine final values after update
        const finalTeam1 = data.team1 ?? match.team1;
        const finalTeam2 = data.team2 ?? match.team2;
        const finalDate = data.date ?? match.date;

        // 3. Make sure teams are not the same
        if(finalTeam1.toString() === finalTeam2.toString()) {
            throw ApiError.conflict(
                "A team cannot play against itself"
            );
        }

        // 4. If team1/team2 is being changed,
        // verify the new teams exist
        if(data.team1 || data.team2) {
            const [team1, team2] = await Promise.all([
                Team.findById(finalTeam1),
                Team.findById(finalTeam2)
            ]);

            if (!team1) {
                throw ApiError.notFound("Team 1 not found");
            }

            if (!team2) {
                throw ApiError.notFound("Team 2 not found");
            }
        }

        // 5. If venue is being changed,
        // verify the new venue exists
        if (data.venue) {

            const venue = await Venue.findById(data.venue);

            if (!venue) {
                throw ApiError.notFound("Venue not found");
            }
        }

        // 6. Check duplicate matchup
        // Exclude the current match itself
        const existingMatch = await Match.findOne({
            _id: { $ne: id },

            date: finalDate,

            $or: [
                {
                    team1: finalTeam1,
                    team2: finalTeam2
                },
                {
                    team1: finalTeam2,
                    team2: finalTeam1
                }
            ]
        });

        if (existingMatch) {
            throw ApiError.conflict(
                "A match between these teams is already scheduled at this date and time"
            );
        }

        // 7. Update match
        Object.assign(match, data);

        await match.save();

        // 8. Return updated match
        return match;
    }

    static async deleteMatchById(id) {
        // 1. Find match
        const match = await Match.findById(id);

        //2. if not than send error not found
        if (!match) {
            throw ApiError.notFound("Match not found");
        }

        //3. delete the match
        await match.deleteOne();
    }
}

/*

Absolutely. This part is confusing at first because we're dealing with a **PATCH update**, where the client may send only *some* fields. The key idea is:

> **Before checking whether the updated match is valid, we need to know what the match will look like AFTER the update.**

Let's go through it from zero.

---

## 1. Imagine your existing match

Suppose MongoDB currently has this match:

```json
{
  "_id": "MATCH123",
  "team1": "CSK_ID",
  "team2": "MI_ID",
  "date": "2026-08-25",
  "venue": "CHEPAUK_ID",
  "status": "scheduled"
}
```

So conceptually:

```text
MATCH123
│
├── team1  → CSK
├── team2  → MI
├── date   → 25 Aug
├── venue  → Chepauk
└── status → scheduled
```

Now suppose the admin wants to change **only the date**.

They send:

```json
{
    "date": "2026-08-30"
}
```

Because this is PATCH, they didn't send:

```json
{
    "team1": "...",
    "team2": "...",
    "date": "...",
    "venue": "...",
    "status": "..."
}
```

They only sent the field they want to change.

So your `data` looks like:

```js
{
    date: "2026-08-30"
}
```

---

# 2. First we find the existing match

```js
const match = await Match.findById(id);

if (!match) {
    throw ApiError.notFound("Match not found");
}
```

Suppose:

```js
id = "MATCH123";
```

MongoDB finds:

```js
match = {
    team1: "CSK_ID",
    team2: "MI_ID",
    date: "2026-08-25",
    venue: "CHEPAUK_ID",
    status: "scheduled"
}
```

So now we have **two things**:

### Existing database document

```js
match
```

### New data sent by user

```js
data
```

For example:

```js
data = {
    date: "2026-08-30"
}
```

---

# 3. Now comes the important part

You wrote:

```js
const finalTeam1 = data.team1 ?? match.team1;
const finalTeam2 = data.team2 ?? match.team2;
const finalDate = data.date ?? match.date;
```

This is basically asking:

> "After this PATCH request finishes, what will team1, team2 and date actually be?"

That's why I call them **final values**.

---

# 4. Understand `??`

This:

```js
data.team1 ?? match.team1
```

means:

> If `data.team1` exists and isn't `null` or `undefined`, use it. Otherwise use the existing `match.team1`.

For example:

```js
data.team1 = "RCB_ID";
```

Then:

```js
data.team1 ?? match.team1
```

becomes:

```js
"RCB_ID"
```

because the user provided a new team1.

But if:

```js
data.team1 = undefined;
```

then:

```js
data.team1 ?? match.team1
```

becomes:

```js
match.team1
```

which is:

```js
"CSK_ID"
```

---

# 5. Let's use the date example

Existing match:

```js
match = {
    team1: "CSK_ID",
    team2: "MI_ID",
    date: "2026-08-25"
}
```

User sends:

```js
data = {
    date: "2026-08-30"
}
```

Therefore:

```js
const finalTeam1 = data.team1 ?? match.team1;
```

Since:

```js
data.team1
```

doesn't exist:

```js
finalTeam1 = match.team1;
```

So:

```js
finalTeam1 = "CSK_ID";
```

---

Then:

```js
const finalTeam2 = data.team2 ?? match.team2;
```

Again, user didn't provide `team2`.

Therefore:

```js
finalTeam2 = "MI_ID";
```

---

And:

```js
const finalDate = data.date ?? match.date;
```

This time the user **did provide a date**:

```js
data.date = "2026-08-30"
```

Therefore:

```js
finalDate = "2026-08-30";
```

---

So now we have:

```js
finalTeam1 = "CSK_ID";
finalTeam2 = "MI_ID";
finalDate  = "2026-08-30";
```

And this represents what the match will look like **after the update**.

---

# 6. Why do we need this?

This is the part that's really important.

Suppose you didn't do this.

You might write:

```js
if (data.team1 === data.team2) {
    throw ApiError.conflict("A team cannot play against itself");
}
```

Looks reasonable, right?

But there's a problem.

Imagine existing match:

```text
CSK vs MI
```

And the admin sends:

```json
{
    "team1": "CSK_ID",
    "date": "2026-08-30"
}
```

Here:

```js
data.team1 = "CSK_ID"
data.team2 = undefined
```

So this:

```js
data.team1 === data.team2
```

becomes:

```js
"CSK_ID" === undefined
```

which is:

```js
false
```

That's okay in this particular case.

But the bigger problem is that `data` is **only the changes**, not the complete match.

For validation, you need to consider the **complete resulting match**.

---

# 7. Here's the important example

Existing:

```text
CSK vs MI
```

Database:

```js
match = {
    team1: "CSK_ID",
    team2: "MI_ID"
}
```

Admin wants to change MI to CSK.

They send:

```json
{
    "team2": "CSK_ID"
}
```

Now:

```js
data = {
    team2: "CSK_ID"
}
```

If you check only:

```js
data.team1 === data.team2
```

you get:

```js
undefined === "CSK_ID"
```

which is:

```js
false
```

Your validation would incorrectly say:

> "Everything is fine."

But look at the resulting match:

```text
CSK vs CSK
```

That's obviously invalid.

---

# 8. That's why we calculate the final values

We do:

```js
const finalTeam1 = data.team1 ?? match.team1;
const finalTeam2 = data.team2 ?? match.team2;
```

Existing:

```js
match.team1 = "CSK_ID";
match.team2 = "MI_ID";
```

Incoming:

```js
data = {
    team2: "CSK_ID"
}
```

Now:

```js
finalTeam1
```

becomes:

```js
data.team1 ?? match.team1
```

Since `data.team1` wasn't provided:

```js
finalTeam1 = match.team1
```

Therefore:

```js
finalTeam1 = "CSK_ID";
```

And:

```js
finalTeam2 = data.team2 ?? match.team2;
```

becomes:

```js
finalTeam2 = "CSK_ID";
```

Now we have:

```text
finalTeam1 = CSK
finalTeam2 = CSK
```

Perfect.

---

# 9. Then we check

```js
if (finalTeam1.toString() === finalTeam2.toString()) {
    throw ApiError.conflict(
        "A team cannot play against itself"
    );
}
```

So:

```js
"CSK_ID" === "CSK_ID"
```

is:

```js
true
```

Therefore:

```text
❌ A team cannot play against itself
```

---

# 10. Why `.toString()`?

This is another important thing.

Mongoose gives you MongoDB ObjectIds.

For example:

```js
match.team1
```

might be:

```js
ObjectId("6a870f0cfc46d9e07ae01d44")
```

while:

```js
data.team2
```

might be a string:

```js
"6a870f0cfc46d9e07ae01d44"
```

These can represent the **same ID**, but their JavaScript types are different.

So:

```js
finalTeam1 === finalTeam2
```

might not behave as you expect.

Converting both to strings:

```js
finalTeam1.toString() === finalTeam2.toString()
```

gives:

```js
"6a870f0cfc46d9e07ae01d44"
===
"6a870f0cfc46d9e07ae01d44"
```

which correctly becomes:

```js
true
```

---

# 11. Now let's understand `finalDate`

Exactly the same concept applies.

Suppose existing match:

```js
match = {
    team1: CSK,
    team2: MI,
    date: "2026-08-25"
}
```

And user sends:

```json
{
    "team2": "RCB_ID"
}
```

They didn't send a new date.

So:

```js
const finalDate = data.date ?? match.date;
```

becomes:

```js
finalDate = match.date;
```

Therefore:

```text
finalDate = 25 Aug
```

Why?

Because after the update, the match is still going to happen on **25 Aug**.

---

# 12. This becomes extremely important for duplicate-match checking

Imagine your database already contains:

```text
CSK vs MI
25 August
```

Now someone tries to update another match:

```text
CSK vs RCB
26 August
```

and sends:

```json
{
    "team2": "MI_ID",
    "date": "2026-08-25"
}
```

The resulting match would become:

```text
CSK vs MI
25 August
```

which already exists.

So before updating, we need to check:

> "Does another match already exist with these final teams and final date?"

That's why we calculate:

```js
const finalTeam1 = data.team1 ?? match.team1;
const finalTeam2 = data.team2 ?? match.team2;
const finalDate = data.date ?? match.date;
```

Then use those values for duplicate checking.

---

# 13. Why don't we calculate `finalVenue` and `finalStatus`?

We can.

If your validation logic needs them, you can absolutely do:

```js
const finalVenue = data.venue ?? match.venue;
const finalStatus = data.status ?? match.status;
```

But if you aren't checking anything involving venue/status, there's no reason to calculate them just for the sake of it.

The purpose is:

> **Calculate final values only for fields that are required for validation/business logic.**

---

# 14. Then we actually update the document

After all validation passes:

```js
Object.assign(match, data);
```

This is where the actual update happens.

Suppose:

```js
match = {
    team1: "CSK_ID",
    team2: "MI_ID",
    date: "2026-08-25",
    status: "scheduled"
}
```

and:

```js
data = {
    team2: "RCB_ID",
    date: "2026-08-30"
}
```

Then:

```js
Object.assign(match, data);
```

essentially does:

```js
match.team2 = data.team2;
match.date = data.date;
```

So now:

```js
match = {
    team1: "CSK_ID",
    team2: "RCB_ID",
    date: "2026-08-30",
    status: "scheduled"
}
```

Fields that weren't provided remain untouched.

Then:

```js
await match.save();
```

actually saves it to MongoDB.

---

# 15. The entire flow

Think of your update service as this:

```text
PATCH /matches/:matchId
          │
          ↓
     Find existing match
          │
          ↓
    Does match exist?
       /       \
     NO         YES
     │           │
  404 error      ↓
          Calculate final values
          │
          ├── finalTeam1
          ├── finalTeam2
          └── finalDate
                    │
                    ↓
          Are team1 and team2 same?
                    │
                 YES → 409
                    │
                   NO
                    ↓
       Does another match already
       exist with final teams/date?
                    │
                 YES → 409
                    │
                   NO
                    ↓
          Object.assign(match, data)
                    │
                    ↓
             await match.save()
                    │
                    ↓
             return match
```

---

## The most important concept

Whenever you see:

```js
const finalTeam1 = data.team1 ?? match.team1;
```

read it in your head as:

> **"If the user is changing team1, use the new team1. Otherwise, keep the old team1."**

And:

```js
const finalTeam2 = data.team2 ?? match.team2;
```

means:

> **"If the user is changing team2, use the new team2. Otherwise, keep the old team2."**

And:

```js
const finalDate = data.date ?? match.date;
```

means:

> **"If the user is changing the date, use the new date. Otherwise, keep the old date."**

Then we validate **that final combination**, because that's what the database will contain after the PATCH.

That's the whole reason for those three lines.


*/