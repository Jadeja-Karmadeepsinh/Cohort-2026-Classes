Absolutely. This is one of the **most important Next.js topics**, and once you understand it properly, a huge chunk of Next.js stops feeling like magic.

The key thing I want you to understand first:

> **CSR, SSR, SSG, and ISR are not four different frameworks. They are four different strategies for deciding *when HTML/data gets generated*.**

I'll build this from zero → mental model → request lifecycle → code → caching → real-world use cases → how Next.js 16 actually does it → how to choose.

---

# 1. First: forget Next.js for 5 minutes

Imagine you visit:

```text
https://example.com/products
```

Your browser needs HTML to display the page.

There are basically different places/times where that HTML can be created.

### CSR

```text
Browser
   ↓
gets mostly empty HTML
   ↓
downloads JavaScript
   ↓
React runs
   ↓
fetch API
   ↓
creates UI
```

### SSR

```text
Browser
   ↓
request
   ↓
Server
   ↓
fetch data
   ↓
generate HTML
   ↓
Browser receives ready HTML
```

### SSG

```text
Build time
   ↓
generate HTML
   ↓
save generated result
   ↓
User requests page
   ↓
already-generated HTML is served
```

### ISR

Think:

```text
Build time
   ↓
generate HTML
   ↓
serve it
   ↓
after some time
   ↓
regenerate in background
   ↓
new HTML gets served
```

That's the entire foundation.

Now let's go deeply into each one.

---

# 2. CSR — Client-Side Rendering

CSR means:

> **The browser renders the page.**

This is the traditional React SPA approach you're already familiar with.

For example:

```jsx
function App() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetch("/api/users")
      .then(res => res.json())
      .then(data => setUsers(data));
  }, []);

  return (
    <div>
      {users.map(user => (
        <p key={user.id}>{user.name}</p>
      ))}
    </div>
  );
}
```

The important part:

```js
useEffect(() => {
  fetch("/api/users")
}, []);
```

The browser has to execute this.

---

# 3. What actually happens in CSR?

Suppose your user visits:

```text
/products
```

The sequence is approximately:

```text
User
 │
 │ GET /products
 ↓
Next.js server
 │
 │ HTML + JS
 ↓
Browser
 │
 │ downloads JS
 ↓
React starts
 │
 │ fetch("/api/products")
 ↓
API
 │
 │ products
 ↓
React
 │
 │ renders products
 ↓
User sees products
```

Initially the browser might receive something like:

```html
<div id="root"></div>
```

Then JavaScript runs:

```js
fetch(...)
```

and React creates:

```html
<div id="root">
  <h1>Products</h1>
  <div>iPhone</div>
  <div>MacBook</div>
</div>
```

---

# 4. CSR in Next.js

You can explicitly make a component client-side using:

```tsx
"use client";
```

Example:

```tsx
"use client";

import { useEffect, useState } from "react";

export default function Products() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch("/api/products")
      .then(res => res.json())
      .then(data => setProducts(data));
  }, []);

  return (
    <div>
      <h1>Products</h1>

      {products.map(product => (
        <p key={product.id}>
          {product.name}
        </p>
      ))}
    </div>
  );
}
```

Now this component needs the browser.

---

# 5. When should you use CSR?

CSR is excellent for things that are highly interactive.

Examples:

```text
Dashboard
Admin panel
Todo app
Chat
Online game
Realtime application
User settings
Drag & drop editor
Complex forms
```

For example:

```text
/dashboard
```

There is usually no reason for Google to index:

```text
John's Dashboard
Balance: ₹42,000
Private transactions...
```

So CSR makes perfect sense.

---

# 6. Problems with CSR

The big problems are:

### SEO

Search engines initially don't necessarily get all your meaningful content immediately.

### Initial loading

The user may see:

```text
Loading...
```

then:

```text
Products
iPhone
MacBook
...
```

### Data fetching happens after JavaScript loads

So there's an extra step.

---

# 7. SSR — Server-Side Rendering

SSR means:

> **The server generates the HTML when the user requests the page.**

This is fundamentally different.

Imagine:

```text
User requests:

/products
```

Server receives it.

Server:

```text
fetch products
      ↓
generate HTML
      ↓
send HTML
```

Browser gets:

```html
<h1>Products</h1>

<div>iPhone</div>
<div>MacBook</div>
<div>AirPods</div>
```

The user can see the content immediately.

---

# 8. SSR example

In modern Next.js App Router, a Server Component can simply fetch data:

```tsx
export default async function Products() {
  const res = await fetch(
    "https://api.example.com/products"
  );

  const products = await res.json();

  return (
    <div>
      <h1>Products</h1>

      {products.map((product) => (
        <p key={product.id}>
          {product.name}
        </p>
      ))}
    </div>
  );
}
```

Notice something VERY important:

There is no:

```tsx
"use client";
```

And there is no:

```tsx
useEffect()
```

The server executes:

```js
await fetch(...)
```

and generates the page.

---

# 9. SSR request lifecycle

Think:

```text
                SERVER
                  │
User ────────────→│
                  │
            fetch database/API
                  │
                  ↓
             get product data
                  │
                  ↓
             generate HTML
                  │
                  ↓
User ←──────── HTML
                  │
                  ↓
              Browser
```

That's SSR.

---

# 10. Why SSR is useful

SSR is great when data changes frequently.

For example:

```text
News website
Stock prices
Weather
User profile
Order status
Product availability
Personalized pages
```

Imagine Amazon.

You don't want:

```text
Product price from 3 days ago
```

You want current information.

SSR can generate the page using current data when requested.

---

# 11. SSG — Static Site Generation

Now things get interesting.

SSG means:

> **Generate the HTML ahead of time, usually during the build.**

Suppose you have:

```text
/about
```

The content barely changes.

Why should the server generate it every time someone visits?

Instead:

```text
npm run build
```

Next.js generates:

```text
/about → HTML
```

Then when users visit:

```text
/about
```

Next.js can serve the already-generated result.

---

# 12. Think of SSG like printing a webpage

Imagine your website has:

```text
About Us
Contact
Privacy Policy
Terms
```

These pages don't change every second.

So during build:

```text
BUILD
 │
 ├── /about
 ├── /contact
 ├── /privacy
 └── /terms
```

Next.js prepares them.

Then:

```text
User 1 → /about → existing generated page
User 2 → /about → existing generated page
User 3 → /about → existing generated page
```

No need to regenerate it for every request.

---

# 13. SSG example

A simple static page:

```tsx
export default function About() {
  return (
    <main>
      <h1>About Me</h1>

      <p>
        I am a full-stack developer.
      </p>
    </main>
  );
}
```

This doesn't need dynamic data.

Next.js can statically render it.

---

# 14. SSG with data

Suppose you have a blog.

You have:

```text
/blog/hello-world
/blog/nextjs-guide
/blog/react-guide
```

You can generate these pages ahead of time.

For dynamic routes, Next.js provides:

```tsx
generateStaticParams()
```

Example:

```tsx
export async function generateStaticParams() {
  const posts = await getPosts();

  return posts.map((post) => ({
    slug: post.slug,
  }));
}
```

Then:

```tsx
export default async function BlogPost({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const post = await getPost(slug);

  return (
    <article>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
    </article>
  );
}
```

During build Next.js can know:

```text
slug = hello-world
slug = nextjs-guide
slug = react-guide
```

and generate those pages.

---

# 15. ISR — Incremental Static Regeneration

This is probably the one that confuses beginners the most.

ISR is basically:

> **SSG + automatic regeneration after a certain period.**

Imagine you have:

```text
/blog
```

You want it to be fast like a static page.

But your blog gets updated every hour.

You don't want to rebuild your entire application every hour.

That's where ISR comes in.

---

# 16. ISR example

```tsx
export default async function Blog() {
  const res = await fetch(
    "https://api.example.com/posts",
    {
      next: {
        revalidate: 60,
      },
    }
  );

  const posts = await res.json();

  return (
    <div>
      {posts.map(post => (
        <article key={post.id}>
          <h2>{post.title}</h2>
        </article>
      ))}
    </div>
  );
}
```

The important part:

```js
next: {
  revalidate: 60
}
```

means roughly:

> Keep the cached result fresh by revalidating it on a 60-second interval.

---

# 17. ISR mental model

Imagine this:

```text
10:00
User visits page
        ↓
cached page exists
        ↓
serve cached page
```

Then:

```text
10:01+
```

the cached result is considered stale/revalidation is triggered according to Next.js's caching behavior.

A request can cause Next.js to regenerate the data/page, with the new result becoming available afterward.

So:

```text
Old page
   ↓
still useful
   ↓
regeneration
   ↓
new page
```

The exact request/cache behavior depends on the route and caching configuration, but the important mental model is:

> **Don't regenerate everything on every request, but don't keep the content forever either.**

---

# 18. The four strategies side by side

This table is worth remembering:

|                         | CSR             | SSR           | SSG          | ISR           |
| ----------------------- | --------------- | ------------- | ------------ | ------------- |
| Where rendered?         | Browser         | Server        | Build time   | Server/cache  |
| When generated?         | Browser runtime | Every request | Build        | Revalidation  |
| Fast initial HTML       | ❌               | ✅             | ✅            | ✅             |
| SEO                     | ⚠️              | ✅             | ✅            | ✅             |
| Fresh data              | ✅               | ✅             | ❌            | ✅             |
| Server work per request | Low             | High          | Very low     | Low           |
| Great for               | Dashboards      | Dynamic pages | Static pages | Content sites |

---

# 19. The easiest way to remember

### CSR

```text
CLIENT
```

Browser does the work.

---

### SSR

```text
SERVER
REQUEST → SERVER → HTML
```

Server does the work for each request.

---

### SSG

```text
BUILD
 ↓
HTML
 ↓
USER
```

Build does the work once.

---

### ISR

```text
BUILD
 ↓
HTML
 ↓
USER
 ↓
REGENERATE
 ↓
NEW HTML
```

Static page that can update.

---

# 20. But here's where modern Next.js gets confusing

You will hear people say:

> "Next.js automatically does SSG."

Then someone else says:

> "Next.js automatically does SSR."

Then someone says:

> "Next.js uses caching."

And you're like:

**WHAT THE FUCK IS GOING ON?**

😂

The reason is that modern Next.js App Router isn't simply:

```text
This page = SSR
This page = SSG
```

Instead, **rendering and caching are closely connected**, and Next.js can make static/dynamic decisions based on your code and configuration.

---

# 21. Server Components vs SSR

This distinction is extremely important.

These are **not the same thing**:

```text
Server Component
```

and

```text
SSR
```

A Server Component means:

> This component executes on the server.

SSR means:

> HTML is rendered on the server at request time.

You can have Server Components in statically rendered pages too.

For example:

```tsx
export default async function Page() {
  const data = await getData();

  return <h1>{data.title}</h1>;
}
```

This is a Server Component by default.

But whether its result is generated:

```text
at build time
```

or:

```text
at request time
```

depends on the route/data/cache behavior.

---

# 22. `"use client"` does NOT automatically mean CSR for the entire page

This is another massive beginner misconception.

Suppose:

```tsx
"use client";

export default function Counter() {
  const [count, setCount] = useState(0);

  return (
    <button onClick={() => setCount(count + 1)}>
      {count}
    </button>
  );
}
```

This makes **that component** a Client Component.

It does NOT mean:

```text
Entire Next.js application becomes CSR
```

Next.js can still initially render/pre-render the component's HTML and then hydrate it in the browser.

The important thing is:

> **Client Component ≠ automatically "everything is rendered only in the browser."**

---

# 23. What is hydration?

You'll hear this word constantly in Next.js.

Suppose server sends:

```html
<button>
  Count: 0
</button>
```

The user sees the button.

But currently:

```text
button
```

doesn't know your React event handler.

The browser downloads JavaScript.

React then connects the component's logic to the existing HTML.

That's:

> **Hydration**

Conceptually:

```text
SERVER

React component
      ↓
HTML
      ↓
Browser


BROWSER

HTML
 +
JavaScript
      ↓
React hydrates
      ↓
Interactive UI
```

So:

```tsx
"use client";

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <button onClick={() => setCount(count + 1)}>
      {count}
    </button>
  );
}
```

can have HTML visible before the component becomes interactive.

---

# 24. CSR vs hydration

Don't mix these up.

### CSR

```text
Browser gets application
        ↓
JavaScript executes
        ↓
React creates UI
```

### Server-rendered Client Component

```text
Server
 ↓
HTML
 ↓
Browser displays HTML
 ↓
JS downloads
 ↓
React hydrates
 ↓
interactive
```

That's a very important distinction.

---

# 25. Let's build a realistic Next.js application

Imagine you're building:

```text
E-commerce website
```

You might have:

```text
/
├── homepage
├── products
├── products/[id]
├── login
├── dashboard
└── cart
```

Different pages can use different strategies.

---

# 26. Homepage → SSG/ISR

Suppose your homepage contains:

```text
Welcome
Featured products
Popular categories
```

You could cache/revalidate product data:

```tsx
export default async function Home() {
  const res = await fetch(
    "https://api.example.com/products",
    {
      next: {
        revalidate: 300,
      },
    }
  );

  const products = await res.json();

  return (
    <main>
      <h1>Welcome</h1>

      {products.map(product => (
        <div key={product.id}>
          {product.name}
        </div>
      ))}
    </main>
  );
}
```

The page doesn't need to be regenerated for every visitor.

---

# 27. Product page → ISR

Imagine:

```text
/products/iphone-17
```

Price and stock change occasionally.

You could use:

```tsx
const product = await fetch(
  `https://api.example.com/products/${id}`,
  {
    next: {
      revalidate: 60,
    },
  }
);
```

This is a classic ISR-like use case.

---

# 28. User dashboard → dynamic/server rendering

Suppose:

```text
/dashboard
```

depends on:

```text
current logged-in user
```

You probably don't want to generate one public static page.

You need user-specific information.

So you use server-side dynamic behavior and/or client-side fetching depending on your architecture.

For example, server-side:

```tsx
export default async function Dashboard() {
  const user = await getCurrentUser();

  return (
    <main>
      <h1>Hello {user.name}</h1>
    </main>
  );
}
```

---

# 29. Chat application → CSR

Chat needs:

```text
WebSocket
Socket.IO
messages
typing indicators
online status
```

That's highly interactive.

You'd typically have a Client Component:

```tsx
"use client";

export default function Chat() {
  // socket logic
  // state
  // event listeners

  return <div>...</div>;
}
```

CSR/client-side interactivity is appropriate here.

---

# 30. Blog → SSG/ISR

A blog post:

```text
/blog/how-nextjs-works
```

doesn't change every second.

So:

```text
SSG
```

or:

```text
ISR
```

is usually ideal.

---

# 31. Now let's understand `fetch()` caching

This is where modern Next.js becomes much more important.

You might see:

```tsx
const data = await fetch(url);
```

Then:

```tsx
const data = await fetch(url, {
  next: {
    revalidate: 60,
  },
});
```

Or:

```tsx
const data = await fetch(url, {
  cache: "no-store",
});
```

These affect how Next.js handles the data.

---

# 32. `cache: "no-store"`

Example:

```tsx
const res = await fetch(
  "https://api.example.com/products",
  {
    cache: "no-store",
  }
);
```

You're basically saying:

> Don't use a cached result for this fetch; get fresh data.

This is useful for highly dynamic information.

For example:

```text
current account balance
current order status
real-time-ish information
```

---

# 33. `revalidate`

Example:

```tsx
const res = await fetch(url, {
  next: {
    revalidate: 60,
  },
});
```

Think:

```text
Cache this
+
keep it fresh
+
revalidate approximately every 60 seconds
```

This is where ISR-style behavior comes from.

---

# 34. Static

If your data is static/cacheable:

```tsx
const res = await fetch(url);
```

Next.js can cache/render it according to its current caching/rendering model.

The important lesson isn't:

> "`fetch()` always means SSG."

Don't memorize that.

Instead ask:

> **Is this data cached? Is this route dynamic? When should this data become stale?**

That's the modern Next.js mindset.

---

# 35. Dynamic rendering

You can also explicitly tell Next.js:

```tsx
export const dynamic = "force-dynamic";
```

Meaning:

> Render this route dynamically.

Example:

```tsx
export const dynamic = "force-dynamic";

export default async function Page() {
  const res = await fetch(
    "https://api.example.com/current-data"
  );

  const data = await res.json();

  return <h1>{data.value}</h1>;
}
```

---

# 36. Force static

You can also explicitly tell Next.js:

```tsx
export const dynamic = "force-static";
```

Meaning:

> Treat this route as static.

This is useful when you know exactly what behavior you want.

---

# 37. ISR can also be done with route-level revalidation

For example:

```tsx
export const revalidate = 60;

export default async function Page() {
  const data = await getData();

  return (
    <div>{data.title}</div>
  );
}
```

This says:

```text
revalidate this route's cached result every 60 seconds
```

Compare that to:

```tsx
fetch(url, {
  next: {
    revalidate: 60,
  },
});
```

The second one controls caching for that particular fetch.

---

# 38. On-demand ISR

You don't always want to wait 60 seconds.

Imagine you have:

```text
Admin publishes blog post
```

You want:

```text
Blog page
```

to update immediately.

Next.js provides APIs such as:

```tsx
revalidatePath()
```

and:

```tsx
revalidateTag()
```

For example:

```tsx
import { revalidatePath } from "next/cache";

export async function publishPost() {
  // save post

  revalidatePath("/blog");
}
```

Conceptually:

```text
Admin publishes
       ↓
database updated
       ↓
revalidatePath("/blog")
       ↓
cached blog becomes stale/revalidated
       ↓
new content appears
```

This is extremely useful in real applications.

---

# 39. `revalidateTag()`

Tags are useful when multiple pages use the same data.

For example:

```tsx
fetch("https://api.example.com/products", {
  next: {
    tags: ["products"],
  },
});
```

Then:

```tsx
revalidateTag("products");
```

You can invalidate/revalidate data associated with that tag.

Think:

```text
products
   ↓
used by:
   ├── homepage
   ├── products page
   ├── category page
   └── search
```

Instead of manually thinking about every page, you can invalidate the shared data.

---

# 40. SSR vs SSG with a simple example

Imagine:

```text
/products
```

### SSR

User A:

```text
Request
 ↓
Server fetches products
 ↓
HTML
```

User B:

```text
Request
 ↓
Server fetches products AGAIN
 ↓
HTML
```

---

### SSG

Build:

```text
Build
 ↓
fetch products
 ↓
generate HTML
```

Then:

```text
User A → existing HTML
User B → existing HTML
User C → existing HTML
```

---

### ISR

Build:

```text
Build
 ↓
generate HTML
```

Then:

```text
Users
 ↓
cached HTML
 ↓
after revalidation period
 ↓
regenerate
 ↓
new cached HTML
```

---

### CSR

```text
User
 ↓
HTML/JS
 ↓
browser executes React
 ↓
fetch products
 ↓
render products
```

---

# 41. Performance comparison

Very roughly:

```text
                 Initial HTML      Freshness
CSR              ❌/late           ✅
SSR              ✅                ✅
SSG              ✅                ❌
ISR              ✅                ✅
```

But performance isn't just about rendering strategy.

You also need to consider:

```text
JavaScript bundle
API latency
database latency
caching
CDN
images
fonts
hydration
network
```

Don't fall into:

> "SSG is always faster."

Usually static content is extremely fast, but real-world performance depends on the whole system.

---

# 42. SEO comparison

Generally:

### CSR

```text
⚠️ Can be less ideal
```

### SSR

```text
✅ Excellent
```

### SSG

```text
✅ Excellent
```

### ISR

```text
✅ Excellent
```

Why?

Because SSR/SSG/ISR can provide meaningful HTML to crawlers and users without requiring the whole UI to be created only after browser JavaScript executes.

---

# 43. A real-world architecture

Let's say you're making your portfolio.

### Homepage

```text
SSG
```

Because:

```text
doesn't change frequently
```

### Projects

```text
SSG / ISR
```

### Blog

```text
ISR
```

### Contact form

```text
Client interaction
+
Server/API
```

### Admin panel

```text
dynamic + client components
```

### GitHub stats

Could be:

```text
ISR
```

because you don't need to call GitHub for every visitor.

---

# 44. A real-world Netflix-style app

Suppose:

```text
Netflix clone
```

### Landing page

```text
SSG / ISR
```

### Movie catalog

```text
ISR
```

### Movie detail

```text
ISR
```

### Search

Could be:

```text
CSR
```

### User profile

```text
Dynamic server rendering
```

### Video player

```text
Client Component
```

### Watchlist

```text
Client + server
```

So a **single Next.js application can use all of them.**

This is the most important point.

---

# 45. Don't think "my whole Next.js app is SSR"

That's a beginner mistake.

You can have:

```text
Next.js application

├── SSG page
├── ISR page
├── dynamically rendered page
├── Client Component
├── Server Component
└── interactive Client Component
```

all inside the same application.

---

# 46. Example project

Imagine:

```text
app/
│
├── page.tsx
│
├── about/
│   └── page.tsx
│
├── blog/
│   ├── page.tsx
│   └── [slug]/
│       └── page.tsx
│
├── dashboard/
│   └── page.tsx
│
└── chat/
    └── page.tsx
```

You might design it like:

```text
/              → SSG/ISR
/about         → SSG
/blog          → ISR
/blog/[slug]   → SSG/ISR
/dashboard     → Dynamic
/chat          → Client
```

That's a perfectly normal Next.js architecture.

---

# 47. The biggest misconception about SSG

You might think:

> "If I use SSG, the page can NEVER change."

No.

The **generated output** doesn't magically update by itself.

But you can rebuild the application:

```text
new build
 ↓
new HTML
```

Or use ISR:

```text
old generated page
 ↓
revalidate
 ↓
new generated page
```

So:

```text
SSG = static until next build
ISR = static + regeneration
```

That's a very good mental shortcut.

---

# 48. The biggest misconception about SSR

You might think:

> "SSR means there is no JavaScript."

No.

SSR generates HTML on the server.

You can still have:

```tsx
"use client";
```

interactive components inside the page.

For example:

```text
Server-rendered product page

┌───────────────────────────┐
│ Product information       │ ← Server
│ Price                     │ ← Server
│ Description               │ ← Server
│                           │
│ [ - ] 1 [ + ]             │ ← Client
│                           │
│ [ Add to cart ]           │ ← Client
└───────────────────────────┘
```

This is one of the biggest strengths of Next.js.

---

# 49. Server Component + Client Component

Example:

```tsx
// ProductPage.tsx

import AddToCart from "./AddToCart";

export default async function ProductPage() {
  const product = await getProduct();

  return (
    <div>
      <h1>{product.name}</h1>

      <p>₹{product.price}</p>

      <AddToCart productId={product.id} />
    </div>
  );
}
```

And:

```tsx
// AddToCart.tsx

"use client";

import { useState } from "react";

export default function AddToCart({
  productId,
}: {
  productId: string;
}) {
  const [added, setAdded] = useState(false);

  return (
    <button onClick={() => setAdded(true)}>
      {added ? "Added" : "Add to cart"}
    </button>
  );
}
```

Now you get:

```text
Server
 ├── product data
 ├── product name
 └── price

Client
 └── AddToCart interaction
```

This is the Next.js architecture you should aim to understand.

---

# 50. What happens during a request?

Let's make this extremely concrete.

User requests:

```text
/products/123
```

Server Component:

```tsx
export default async function Product() {
  const product = await getProduct(123);

  return (
    <div>
      <h1>{product.name}</h1>
    </div>
  );
}
```

Server:

```text
Request
  ↓
execute component
  ↓
getProduct(123)
  ↓
product data
  ↓
render React
  ↓
HTML / RSC payload
  ↓
browser
```

If the result is cached/static, some of those steps can be reused rather than repeated.

That's why caching is such a huge part of Next.js.

---

# 51. So what should YOU actually remember?

Forget the complicated terminology for a moment.

Ask:

### Question 1

**Does this need browser interactivity?**

If yes:

```text
Client Component
```

Maybe:

```tsx
"use client";
```

---

### Question 2

**Does the content need to be generated fresh for every request?**

If yes:

```text
Dynamic rendering / SSR-style
```

---

### Question 3

**Does the content barely change?**

Use:

```text
Static generation
```

---

### Question 4

**Does the content change occasionally but doesn't need a request every time?**

Use:

```text
ISR / revalidation
```

---

# 52. Your cheat sheet

Memorize this:

```text
CSR
↓
Browser renders
↓
Interactive apps
```

```text
SSR
↓
Server renders per request
↓
Fresh/personalized data
```

```text
SSG
↓
Build renders
↓
Mostly static content
```

```text
ISR
↓
Static + revalidation
↓
Content changes occasionally
```

---

# 53. The practical Next.js code cheat sheet

### Client-side interactive component

```tsx
"use client";

import { useState } from "react";

export default function Counter() {
  const [count, setCount] = useState(0);

  return (
    <button onClick={() => setCount(count + 1)}>
      {count}
    </button>
  );
}
```

---

### Dynamic/server-rendered data

```tsx
export const dynamic = "force-dynamic";

export default async function Page() {
  const data = await fetch(url, {
    cache: "no-store",
  });

  const result = await data.json();

  return <div>{result.name}</div>;
}
```

---

### Static

```tsx
export default function About() {
  return <h1>About Me</h1>;
}
```

---

### ISR

```tsx
export const revalidate = 60;

export default async function Page() {
  const data = await fetch(url);

  const result = await data.json();

  return <div>{result.name}</div>;
}
```

Or:

```tsx
const data = await fetch(url, {
  next: {
    revalidate: 60,
  },
});
```

---

# 54. One final diagram

If you remember **only one diagram**, remember this:

```text
                     NEXT.JS
                        │
        ┌───────────────┼────────────────┐
        │               │                │
        ↓               ↓                ↓
     SERVER           BUILD           BROWSER
        │               │                │
        │               │                │
        │               │                │
       SSR             SSG              CSR
        │               │                │
        │               │                │
        │               └──────┐         │
        │                      │         │
        │                    ISR         │
        │                      │         │
        │                      ↓         │
        └──────────────────────┴─────────┘
```

And conceptually:

```text
CSR
Browser → fetch → render


SSR
Request → Server → fetch → render → HTML


SSG
Build → fetch → render → HTML → serve


ISR
Build → render → cache
                 ↓
             revalidate
                 ↓
             regenerate
```

---

## The one thing I want you to be careful about

Older Next.js tutorials often teach a very simple model:

> `getServerSideProps` = SSR
> `getStaticProps` = SSG
> `getStaticPaths` = dynamic SSG
> `revalidate` = ISR

That is the **Pages Router** mental model.

You're learning modern **Next.js App Router**, so don't blindly copy those tutorials.

With App Router, you need to understand these concepts together:

```text
Server Components
       +
Client Components
       +
fetch caching
       +
revalidation
       +
dynamic rendering
       +
static rendering
```

Once those six things click, **CSR / SSR / SSG / ISR become much easier**, rather than being four isolated things you memorize.

And for the Next.js version you're learning, I'd focus heavily on **App Router**, not the old `getServerSideProps/getStaticProps` approach.
