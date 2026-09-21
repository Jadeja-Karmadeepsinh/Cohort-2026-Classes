`AbortController` is a **Web API that lets you cancel an ongoing operation**.

The easiest way to understand it:

> **AbortController = a remote control for cancelling certain async operations.**

The most common use is cancelling a `fetch()` request.

---

## 1. The problem

Suppose you do:

```js
const response = await fetch("/api/users");
```

The request starts:

```text
Browser
   |
   |------ request ------> Server
   |
   |    waiting...
   |
   |    waiting...
```

But maybe the user navigates away, closes a search, or starts another request.

You might want to say:

> "I don't need this request anymore. Cancel it."

That's what `AbortController` is for.

---

# 2. Basic usage

```js
const controller = new AbortController();

fetch("/api/users", {
  signal: controller.signal
});

controller.abort();
```

There are two important things:

```js
controller.signal
```

and:

```js
controller.abort()
```

Think of it like:

```text
AbortController
      |
      |--- signal ───────> fetch()
      |
      |--- abort() ──────> CANCEL
```

---

# 3. What is `signal`?

When you create:

```js
const controller = new AbortController();
```

you get:

```js
controller.signal
```

The signal is basically the **communication channel** between the controller and the operation.

You give that signal to `fetch()`:

```js
fetch("/api/users", {
  signal: controller.signal
});
```

Now `fetch()` knows:

> "If this signal gets aborted, I should stop."

Then:

```js
controller.abort();
```

sends the cancellation signal.

---

# 4. Complete example

```js
const controller = new AbortController();

fetch("https://example.com/data", {
  signal: controller.signal
})
  .then(response => response.json())
  .then(data => {
    console.log(data);
  })
  .catch(error => {
    console.log(error);
  });

controller.abort();
```

When `abort()` happens, the fetch is rejected with an abort-related error.

Usually you'll see:

```text
AbortError
```

---

# 5. Why is this useful in React?

This is where you'll commonly encounter it.

Imagine:

```jsx
useEffect(() => {
  fetch("/api/users")
    .then(res => res.json())
    .then(data => setUsers(data));
}, []);
```

Suppose the component disappears before the request finishes.

The request might still be running.

You can use `AbortController`:

```jsx
useEffect(() => {
  const controller = new AbortController();

  fetch("/api/users", {
    signal: controller.signal
  })
    .then(res => res.json())
    .then(data => setUsers(data))
    .catch(error => {
      if (error.name !== "AbortError") {
        console.error(error);
      }
    });

  return () => {
    controller.abort();
  };
}, []);
```

Now the lifecycle is:

```text
Component mounts
      ↓
create controller
      ↓
start fetch
      ↓
Component unmounts
      ↓
useEffect cleanup runs
      ↓
controller.abort()
      ↓
fetch cancelled
```

---

# 6. Why cleanup?

Remember that `useEffect` can return a cleanup function:

```js
useEffect(() => {

  // setup

  return () => {
    // cleanup
  };

}, []);
```

So:

```js
return () => {
  controller.abort();
};
```

means:

> "When this effect is no longer needed, cancel the request."

---

# 7. Very common example: search

Imagine a search box:

```text
User types:

R
Re
Rea
Reac
React
```

You might accidentally send:

```text
fetch("...search=R")
fetch("...search=Re")
fetch("...search=Rea")
fetch("...search=Reac")
fetch("...search=React")
```

Now imagine the responses return in an unexpected order:

```text
React response     → 100ms
Reac response      → 500ms
Rea response       → 300ms
```

You could end up displaying an older result.

AbortController can cancel the previous request when a new search starts.

Conceptually:

```text
Search "R"
   ↓
Request A

Search "Re"
   ↓
Abort A
   ↓
Request B

Search "Rea"
   ↓
Abort B
   ↓
Request C
```

---

# 8. `AbortController` isn't only for fetch

This is important.

`AbortController` itself doesn't know anything about HTTP.

It's a general cancellation mechanism.

An API that supports `AbortSignal` can listen to:

```js
signal
```

and respond when:

```js
controller.abort()
```

happens.

`fetch()` is simply the most common example.

---

# 9. You can check whether it was aborted

A signal has:

```js
signal.aborted
```

For example:

```js
const controller = new AbortController();

console.log(controller.signal.aborted);
// false

controller.abort();

console.log(controller.signal.aborted);
// true
```

So:

```text
Before abort:
signal.aborted → false

After abort:
signal.aborted → true
```

---

# 10. Important: aborting doesn't mean "undo"

This is a common misunderstanding.

Suppose you send:

```text
POST /api/payment
```

Calling:

```js
controller.abort();
```

does **not necessarily mean the server undid the operation**.

It means the client-side operation was cancelled/aborted.

For example:

```text
Browser                 Server

POST payment  -------->

controller.abort()
       ↓
client stops waiting

                         Server may already
                         have processed it
```

So cancellation is **not the same thing as rollback**.

---

# 11. The mental model

Think of it like this:

```text
             AbortController
                  |
             controller
                  |
          ┌───────┴────────┐
          ↓                ↓
       signal            abort()
          ↓                ↓
       fetch()          CANCEL
```

Or in one sentence:

> **You create an `AbortController`, give its `signal` to an async operation that supports cancellation, and call `abort()` when you want that operation cancelled.**

For React, the pattern you'll use most often is:

```jsx
useEffect(() => {
  const controller = new AbortController();

  fetch("/api/data", {
    signal: controller.signal
  });

  return () => {
    controller.abort();
  };
}, []);
```

That pattern is worth remembering.
