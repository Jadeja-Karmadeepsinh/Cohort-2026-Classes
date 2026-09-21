Exactly — **your current `App.tsx` barely uses any TypeScript.** That's why it looks almost identical to `App.jsx`.

The important thing is:

> `.tsx` doesn't mean "this file must visibly contain TypeScript." It means **the file is allowed to contain TypeScript + JSX**.

### Compare them

Your current code:

```tsx
const [posts, setPosts] = useState([]);
const [status, setStatus] = useState("idle");
const [seconds, setSeconds] = useState(10);
```

All of this is valid TypeScript, but you're letting **TypeScript infer the types automatically**.

For example:

```tsx
const [seconds, setSeconds] = useState(10);
```

TypeScript understands:

```text
seconds → number
setSeconds → function that accepts a number
```

You don't have to explicitly write:

```tsx
const [seconds, setSeconds] = useState<number>(10);
```

Both work.

---

## Where would you actually see TypeScript?

Let's say your API returns posts.

In plain JSX/JavaScript:

```jsx
const [posts, setPosts] = useState([]);
```

You don't tell React what a post looks like.

In TypeScript:

```tsx
type Post = {
  id: number;
  title: string;
  body: string;
  userId: number;
};

const [posts, setPosts] = useState<Post[]>([]);
```

Now you're explicitly saying:

> `posts` must be an array of `Post` objects.

And TypeScript knows:

```tsx
posts.map((post) => (
  <p key={post.id}>{post.body}</p>
))
```

So this would be caught:

```tsx
post.whatever
```

because `whatever` isn't part of `Post`.

---

## Another obvious example: props

JavaScript:

```jsx
function User({ name, age }) {
  return <h1>{name} - {age}</h1>;
}
```

TypeScript:

```tsx
type UserProps = {
  name: string;
  age: number;
};

function User({ name, age }: UserProps) {
  return <h1>{name} - {age}</h1>;
}
```

Now:

```tsx
<User name="Rahul" age={20} />
```

✅

But:

```tsx
<User name="Rahul" age="20" />
```

❌ TypeScript complains because `age` should be a `number`.

---

## Your `App.tsx` could become more TypeScript-y

For your API example:

```tsx
type Post = {
  id: number;
  userId: number;
  title: string;
  body: string;
};

function App() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [status, setStatus] = useState<string>("idle");
  const [seconds, setSeconds] = useState<number>(10);

  // ...
}
```

Although even:

```tsx
const [status, setStatus] = useState<string>("idle");
```

isn't particularly useful because TypeScript can already infer that it's a string.

You could make it better:

```tsx
type Status = "idle" | "loading" | "done" | "error";

const [status, setStatus] = useState<Status>("idle");
```

Now this:

```tsx
setStatus("loading");
```

✅

But:

```tsx
setStatus("hello");
```

❌

---

# `.tsx` vs `.jsx`

Think of it this way:

```text
.jsx
 ↓
JavaScript + JSX

.tsx
 ↓
TypeScript + JSX
```

The JSX part is basically the same:

```tsx
return (
  <div>
    <h1>Hello</h1>
  </div>
);
```

The **TypeScript part appears when you start adding types**:

```tsx
type Post = {
  id: number;
  title: string;
};

const [posts, setPosts] = useState<Post[]>([]);
```

---

### One more important thing

TypeScript isn't something that React uses **at runtime**.

It mainly helps you **while writing/building the application**.

For example:

```tsx
const age: number = "hello";
```

TypeScript says:

```text
❌ Type 'string' is not assignable to type 'number'
```

After your project is built, TypeScript's type information is removed and the resulting code is JavaScript.

So your intuition is correct:

> **Your current `App.tsx` is basically JavaScript + JSX with TypeScript available, but you're not taking much advantage of TypeScript yet.**

That's very normal in a fresh Vite React TypeScript project.
