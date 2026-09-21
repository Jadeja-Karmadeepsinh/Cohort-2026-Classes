Keys are needed in React mainly when you're rendering a **list of elements**.

Think of a key as an **ID for each item in the list**.

### The problem

Suppose you have:

```jsx
const users = ["Rahul", "Amit", "Raj"];

return (
  <div>
    {users.map((user) => (
      <h2>{user}</h2>
    ))}
  </div>
);
```

React will show:

```text
Rahul
Amit
Raj
```

But React will warn:

> Each child in a list should have a unique "key" prop.

Why?

Because React needs to know **which element is which** when the list changes.

---

### Imagine the list changes

Initially:

```text
Rahul
Amit
Raj
```

Then we add:

```text
Karan
Rahul
Amit
Raj
```

Without keys, React mainly sees:

```text
position 0 → changed Rahul → Karan
position 1 → changed Amit → Rahul
position 2 → changed Raj → Amit
position 3 → new Raj
```

It has to figure out what happened based largely on position.

With keys:

```jsx
const users = [
  { id: 101, name: "Rahul" },
  { id: 102, name: "Amit" },
  { id: 103, name: "Raj" }
];

return (
  <div>
    {users.map((user) => (
      <h2 key={user.id}>{user.name}</h2>
    ))}
  </div>
);
```

Now React sees:

```text
101 → Rahul
102 → Amit
103 → Raj
```

If we add Karan:

```text
104 → Karan
101 → Rahul
102 → Amit
103 → Raj
```

React knows:

> "Oh, these existing elements are still the same. There's just a new element with key 104."

That's the important purpose of keys.

---

### Keys are NOT just for performance

A common beginner explanation is:

> "Keys make React faster."

That's incomplete.

The more important idea is:

> **Keys give React a stable identity for elements between renders.**

This becomes especially important when elements have **state**.

For example, imagine:

```jsx
users.map(user => (
  <input key={user.id} defaultValue={user.name} />
))
```

If the list changes, the keys help React understand which input corresponds to which user, so React can preserve the appropriate component/DOM state.

---

### Why shouldn't we use the array index?

You might see:

```jsx
users.map((user, index) => (
  <h2 key={index}>{user}</h2>
))
```

This is sometimes okay for a **static list that never changes order**, but can cause problems when items are inserted, deleted, or reordered.

For example:

```text
Before:

key 0 → Rahul
key 1 → Amit
key 2 → Raj
```

Remove Rahul:

```text
After:

key 0 → Amit
key 1 → Raj
```

React thinks:

```text
key 0 is still the same element
key 1 is still the same element
```

But actually the **people changed**.

That's why a stable ID is preferable:

```jsx
key={user.id}
```

### Remember this

```text
Fragment → groups elements without adding a DOM element

Key → gives list elements a stable identity
```

So when you see:

```jsx
{users.map(user => (
  <User key={user.id} user={user} />
))}
```

read it as:

> "For every user, render a User component, and tell React which user this component represents."
