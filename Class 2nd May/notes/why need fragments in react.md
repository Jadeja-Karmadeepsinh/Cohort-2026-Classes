In React, **Fragments** let you return multiple elements **without adding an unnecessary HTML element to the DOM**.

### The problem

A React component must return **one parent element**:

```jsx
function App() {
  return (
    <h1>Hello</h1>
    <p>Welcome</p>
  );
}
```

❌ This doesn't work because there are two sibling elements.

The usual solution is:

```jsx
function App() {
  return (
    <div>
      <h1>Hello</h1>
      <p>Welcome</p>
    </div>
  );
}
```

This works, but now you've added an unnecessary `<div>` to the DOM.

### Fragment solves this

```jsx
function App() {
  return (
    <>
      <h1>Hello</h1>
      <p>Welcome</p>
    </>
  );
}
```

`<>...</>` is the **short syntax for a React Fragment**.

The resulting DOM is:

```html
<h1>Hello</h1>
<p>Welcome</p>
```

There is **no extra `<div>`**.

---

### Why does that matter?

Sometimes adding a wrapper changes the behavior or structure you need.

For example:

```jsx
<ul>
  <ListItems />
</ul>
```

If `ListItems` does this:

```jsx
function ListItems() {
  return (
    <div>
      <li>Apple</li>
      <li>Banana</li>
    </div>
  );
}
```

You end up with invalid/undesirable structure:

```html
<ul>
  <div>
    <li>Apple</li>
    <li>Banana</li>
  </div>
</ul>
```

With a Fragment:

```jsx
function ListItems() {
  return (
    <>
      <li>Apple</li>
      <li>Banana</li>
    </>
  );
}
```

You get:

```html
<ul>
  <li>Apple</li>
  <li>Banana</li>
</ul>
```

### One important thing

Fragments **can have a key**, but the short syntax `<>` cannot:

```jsx
// ❌ Can't do this
<>
  ...
</>
```

For a keyed Fragment:

```jsx
import { Fragment } from "react";

function App() {
  return (
    <Fragment key={id}>
      <h1>Hello</h1>
      <p>Welcome</p>
    </Fragment>
  );
}
```

So the simple rule to remember is:

> **Fragment = React's invisible wrapper.**

It groups multiple JSX elements together **without creating an actual DOM element**.
