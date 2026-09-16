Yep. Let's understand Redis **from the ground up**, specifically the methods you're using in this repository. I'll also cover the important Redis methods you'll encounter in Node.js/TypeScript projects.

---

# 1. First: What actually is Redis?

Redis is basically a **very fast in-memory data store**.

Think of it like a giant JavaScript object/database:

```js
{
  "user:123": {
    id: "123",
    name: "Karmadeep",
    email: "abc@gmail.com",
    passwordHash: "...",
    role: "user"
  },

  "user:email:abc@gmail.com": "123"
}
```

But Redis isn't actually one giant JS object. It has different **data types**, and each type has its own commands.

The most important ones are:

* `String`
* `Hash`
* `List`
* `Set`
* `Sorted Set`
* `JSON` (with RedisJSON, depending on setup)
* Streams

Your code currently uses **Strings + Hashes**.

---

# 2. `SET`

Your code:

```ts
await redis.set(
    `user:email:${data.email}`,
    data.id
);
```

This stores a **string value** against a key.

Think:

```text
KEY                         VALUE
------------------------------------------------
user:email:test@gmail.com   12345
```

Equivalent mental model:

```js
redis["user:email:test@gmail.com"] = "12345";
```

### Syntax

```ts
redis.set(key, value)
```

Example:

```ts
await redis.set("name", "Karmadeep");
```

Now Redis contains:

```text
name → Karmadeep
```

---

# 3. `GET`

Your code:

```ts
const userId = await redis.get(
    `user:email:${email}`
);
```

`GET` retrieves a value stored using `SET`.

If Redis contains:

```text
user:email:test@gmail.com → 12345
```

Then:

```ts
const userId = await redis.get("user:email:test@gmail.com");
```

returns:

```ts
"12345"
```

Notice it's a **string**.

If the key doesn't exist:

```ts
await redis.get("something");
```

returns:

```ts
null
```

That's why you have:

```ts
if (!userId) {
    return null;
}
```

---

# 4. `HSET`

This one is extremely important for your code.

You have:

```ts
await redis.hset(`user:${data.id}`, {
    id: data.id,
    name: data.name,
    email: data.email,
    passwordHash: data.passwordHash,
    role: data.role,
});
```

`HSET` stores data inside a **Redis Hash**.

Think of a Hash as a small object.

You can imagine:

```js
"user:123": {
    id: "123",
    name: "Karmadeep",
    email: "test@gmail.com",
    passwordHash: "abc...",
    role: "user"
}
```

So:

```ts
await redis.hset("user:123", {
    name: "Karmadeep",
    email: "test@gmail.com",
    role: "user"
});
```

creates:

```text
user:123
   │
   ├── name → Karmadeep
   ├── email → test@gmail.com
   └── role → user
```

---

# 5. Why use `HSET` instead of `SET`?

You could technically do:

```ts
await redis.set(
    "user:123",
    JSON.stringify({
        id: "123",
        name: "Karmadeep",
        email: "test@gmail.com"
    })
);
```

But then Redis sees the entire object as one string.

With Hash:

```text
user:123
 ├── id
 ├── name
 ├── email
 ├── passwordHash
 └── role
```

You can access individual fields.

For example:

```ts
await redis.hget("user:123", "name");
```

→

```text
Karmadeep
```

---

# 6. `HGET`

Gets **one field** from a Hash.

Suppose:

```text
user:123
 ├── name → Karmadeep
 ├── email → test@gmail.com
 └── role → user
```

Then:

```ts
const name = await redis.hget(
    "user:123",
    "name"
);
```

returns:

```text
"Karmadeep"
```

Another:

```ts
await redis.hget("user:123", "role");
```

returns:

```text
"user"
```

---

# 7. `HGETALL`

You're using this:

```ts
const user = await redis.hgetall(
    `user:${userId}`
);
```

This gets **all fields** from a Hash.

So if Redis has:

```text
user:123

id            → 123
name          → Karmadeep
email         → test@gmail.com
passwordHash  → abc123
role          → user
```

Then:

```ts
await redis.hgetall("user:123");
```

returns something like:

```js
{
    id: "123",
    name: "Karmadeep",
    email: "test@gmail.com",
    passwordHash: "abc123",
    role: "user"
}
```

That's why your code does:

```ts
return user as RedisUser;
```

---

# 8. `HDEL`

Deletes a **field** from a Hash.

Suppose:

```text
user:123
 ├── id
 ├── name
 ├── email
 └── role
```

You can do:

```ts
await redis.hdel("user:123", "role");
```

Now:

```text
user:123
 ├── id
 ├── name
 └── email
```

Only `role` is deleted.

---

# 9. `DEL`

Deletes the **entire key**.

If you have:

```text
user:123
```

then:

```ts
await redis.del("user:123");
```

removes the entire Hash.

This is different from:

```ts
hdel("user:123", "name")
```

which removes only `name`.

---

# 10. `EXISTS`

Checks whether a key exists.

```ts
const exists = await redis.exists("user:123");
```

Returns:

```text
1
```

if it exists.

Returns:

```text
0
```

if it doesn't.

Example:

```ts
if (await redis.exists(`user:${userId}`)) {
    console.log("User exists");
}
```

---

# 11. `EXPIRE`

Sets an expiration time on a key.

Example:

```ts
await redis.set("otp:123", "8291");

await redis.expire("otp:123", 300);
```

`300` seconds = 5 minutes.

After 5 minutes:

```text
otp:123
```

automatically disappears.

This is VERY useful for:

* OTPs
* temporary tokens
* sessions
* rate limiting
* caching

---

# 12. `SET` with expiration

You don't necessarily need two commands.

Instead of:

```ts
await redis.set("otp:123", "8291");
await redis.expire("otp:123", 300);
```

you can do:

```ts
await redis.set(
    "otp:123",
    "8291",
    "EX",
    300
);
```

Meaning:

```text
SET otp:123 8291
EXPIRE 300 seconds
```

Depending on your ioredis version, you may also see:

```ts
await redis.set(
    "otp:123",
    "8291",
    "EX",
    300
);
```

---

# 13. `TTL`

Tells you how many seconds remain before a key expires.

```ts
await redis.ttl("otp:123");
```

Example:

```text
237
```

means approximately 237 seconds remaining.

Special values:

```text
-1 → key exists but has no expiration
-2 → key doesn't exist
```

---

# 14. `INCR`

Increments a number.

```ts
await redis.set("counter", "10");

await redis.incr("counter");
```

Now:

```text
counter → 11
```

Again:

```ts
await redis.incr("counter");
```

→

```text
12
```

Very useful for:

* counters
* page views
* API rate limits
* login attempts

---

# 15. `DECR`

Opposite of `INCR`.

```ts
await redis.set("stock", "10");

await redis.decr("stock");
```

Now:

```text
stock → 9
```

---

# 16. `MGET`

Get multiple String values at once.

Suppose:

```text
name → Karmadeep
age  → 20
city → Rajkot
```

You can do:

```ts
const values = await redis.mget(
    "name",
    "age",
    "city"
);
```

Result:

```js
[
    "Karmadeep",
    "20",
    "Rajkot"
]
```

---

# 17. `MSET`

Set multiple String values at once.

```ts
await redis.mset(
    "name", "Karmadeep",
    "age", "20",
    "city", "Rajkot"
);
```

---

# 18. `LPUSH` / `RPUSH`

These are for **Lists**.

Imagine:

```text
[]
```

Then:

```ts
await redis.lpush("notifications", "A");
```

becomes:

```text
[A]
```

Then:

```ts
await redis.lpush("notifications", "B");
```

becomes:

```text
[B, A]
```

`LPUSH` adds to the **left/front**.

`RPUSH` adds to the **right/end**.

```ts
await redis.rpush("notifications", "C");
```

Result:

```text
[B, A, C]
```

---

# 19. `LPOP` / `RPOP`

Remove an item from a List.

```ts
await redis.lpop("notifications");
```

removes from the left.

```ts
await redis.rpop("notifications");
```

removes from the right.

---

# 20. `LRANGE`

Get elements from a List.

```ts
await redis.lrange(
    "notifications",
    0,
    -1
);
```

`0` = first item.

`-1` = last item.

So:

```text
[B, A, C]
```

returns:

```js
["B", "A", "C"]
```

---

# 21. `SADD`

Redis **Set**.

Sets contain unique values.

```ts
await redis.sadd(
    "user:123:skills",
    "JavaScript"
);

await redis.sadd(
    "user:123:skills",
    "Java"
);
```

Now:

```text
user:123:skills

JavaScript
Java
```

If you do:

```ts
await redis.sadd(
    "user:123:skills",
    "Java"
);
```

again, it doesn't create a duplicate.

That's the point of a Set.

---

# 22. `SMEMBERS`

Gets everything inside a Set.

```ts
await redis.smembers("user:123:skills");
```

returns:

```js
[
    "JavaScript",
    "Java"
]
```

---

# 23. `SISMEMBER`

Checks whether something exists inside a Set.

```ts
await redis.sismember(
    "user:123:skills",
    "Java"
);
```

returns:

```text
1
```

or:

```text
0
```

---

# 24. Sorted Sets — `ZADD`

Sorted Sets are another very useful Redis structure.

You store:

```text
member + score
```

Example leaderboard:

```ts
await redis.zadd(
    "leaderboard",
    1500,
    "Karmadeep"
);

await redis.zadd(
    "leaderboard",
    1800,
    "Rahul"
);
```

Redis automatically sorts based on the score.

Useful for:

* Leaderboards
* Rankings
* Priority systems
* Time-based queues

---

# 25. `ZRANGE`

Gets members from a sorted set.

```ts
await redis.zrange(
    "leaderboard",
    0,
    -1
);
```

You can also get scores:

```ts
await redis.zrange(
    "leaderboard",
    0,
    -1,
    "WITHSCORES"
);
```

---

# 26. `ZINCRBY`

Increase someone's score.

```ts
await redis.zincrby(
    "leaderboard",
    100,
    "Karmadeep"
);
```

If:

```text
Karmadeep → 1500
```

becomes:

```text
Karmadeep → 1600
```

---

# 27. `KEYS`

You might see:

```ts
await redis.keys("user:*");
```

This finds matching keys.

Example:

```text
user:123
user:456
user:789
```

But **don't use `KEYS` casually in production**.

Why?

Because Redis may scan a huge number of keys and block Redis while doing it.

For production, use:

```ts
SCAN
```

instead.

---

# 28. `SCAN`

Safely iterate through keys.

Conceptually:

```text
SCAN
  ↓
some keys
  ↓
SCAN again
  ↓
more keys
  ↓
...
```

You'll see this when working with large Redis databases.

---

# 29. `PING`

Checks whether Redis is alive.

```ts
await redis.ping();
```

Result:

```text
PONG
```

Very useful for health checks.

---

# 30. `FLUSHDB` ⚠️

Deletes **everything in the current Redis database**.

```ts
await redis.flushdb();
```

Don't randomly run this 😂.

If your Redis has:

```text
user:123
user:456
session:abc
otp:xyz
cache:foo
```

they're all gone.

---

# Now let's understand YOUR repository

This is the important part.

You have:

```ts
createUser(data)
```

When you create:

```js
{
    id: "123",
    name: "Karmadeep",
    email: "test@gmail.com",
    passwordHash: "abc",
    role: "user"
}
```

You execute:

```ts
await redis.hset(`user:${data.id}`, {
    id: data.id,
    name: data.name,
    email: data.email,
    passwordHash: data.passwordHash,
    role: data.role,
});
```

Redis becomes:

```text
user:123
│
├── id            → 123
├── name          → Karmadeep
├── email         → test@gmail.com
├── passwordHash  → abc
└── role          → user
```

Then:

```ts
await redis.set(
    `user:email:${data.email}`,
    data.id
);
```

creates:

```text
user:email:test@gmail.com → 123
```

So you actually have **two Redis keys** representing one user.

---

# Why two keys?

Because your application needs two types of lookup.

### Lookup by ID

You already know:

```text
123
```

So:

```ts
HGETALL user:123
```

is easy.

### Lookup by email

But Redis doesn't automatically know:

> Find the user whose `email` field equals `test@gmail.com`.

So you created an index:

```text
user:email:test@gmail.com → 123
```

Then:

```ts
const userId = await redis.get(
    `user:email:${email}`
);
```

gives:

```text
123
```

Then:

```ts
return findUserById(userId);
```

does:

```text
HGETALL user:123
```

That's actually a very important Redis pattern:

> **Store the object under one key and maintain additional keys as indexes for the lookups you need.**

---

# Your `findUserByEmail()` flow

```ts
export async function findUserByEmail(
    email: string
): Promise<RedisUser | null> {

    const userId = await redis.get(
        `user:email:${email}`
    );

    if (!userId) {
        return null;
    }

    return findUserById(userId);
}
```

Imagine request:

```text
Login:
email = test@gmail.com
```

### Step 1

```ts
GET user:email:test@gmail.com
```

Redis:

```text
→ 123
```

### Step 2

```ts
findUserById("123")
```

### Step 3

```ts
HGETALL user:123
```

Redis:

```js
{
    id: "123",
    name: "Karmadeep",
    email: "test@gmail.com",
    passwordHash: "abc",
    role: "user"
}
```

### Step 4

Return user.

So the whole thing is:

```text
                  Redis
                    │
                    ▼
GET user:email:test@gmail.com
                    │
                    ▼
                   "123"
                    │
                    ▼
           HGETALL user:123
                    │
                    ▼
             User object
```

---

# The Redis commands you should actually remember

Don't try to memorize 100 Redis commands right now.

For your current backend work, learn these first:

| Command     | What it does               |
| ----------- | -------------------------- |
| `SET`       | Store a String             |
| `GET`       | Get a String               |
| `DEL`       | Delete a key               |
| `EXISTS`    | Check key exists           |
| `EXPIRE`    | Give key expiration        |
| `TTL`       | Check remaining expiration |
| `INCR`      | Increase number            |
| `DECR`      | Decrease number            |
| `HSET`      | Store Hash fields          |
| `HGET`      | Get one Hash field         |
| `HGETALL`   | Get entire Hash            |
| `HDEL`      | Delete Hash field          |
| `LPUSH`     | Add to List front          |
| `RPUSH`     | Add to List end            |
| `LPOP`      | Remove List front          |
| `RPOP`      | Remove List end            |
| `LRANGE`    | Get List elements          |
| `SADD`      | Add to Set                 |
| `SMEMBERS`  | Get Set members            |
| `SISMEMBER` | Check Set membership       |
| `ZADD`      | Add to Sorted Set          |
| `ZRANGE`    | Get Sorted Set items       |
| `ZINCRBY`   | Increase Sorted Set score  |
| `SCAN`      | Iterate keys               |
| `PING`      | Check Redis connection     |

And for **your current authentication/backend project**, the most important are:

```text
SET
GET
HSET
HGET
HGETALL
HDEL
DEL
EXPIRE
TTL
INCR
```

Once those make sense, Redis becomes much less scary. The biggest thing to understand isn't memorizing commands—it's understanding **Redis data types + what each command operates on**.
