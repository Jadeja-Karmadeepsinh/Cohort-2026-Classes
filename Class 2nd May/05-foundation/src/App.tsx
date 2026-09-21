import { useState, useEffect } from 'react'
import heroImg from './assets/hero.png'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import './App.css'

function App() {
  const [posts, setPosts] = useState([]);
  const [status, setStatus] = useState("idle");
  const [seconds, setSeconds] = useState(10);

  useEffect(() => {

    const timerId = setInterval(() => {
      setSeconds((curr) => Math.max(curr - 1, 0));
    }, 1000);

    return () => {
      //this is for cleanup code
      clearInterval(timerId);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function loadPosts() {
      setStatus("loading");
      const response = await fetch(`https://jsonplaceholder.typicode.com/posts?_limit=5`, {
        signal: controller.signal
      });
      const data = await response.json();
      console.log(data);
      setPosts(data);
      setStatus("done");
    }

    loadPosts();

    return () => {
      controller.abort();
    }
  }, []);

  return (
    <>
      <h1>useEffect</h1>
      <div>{seconds}</div>

      <h1>Api Call</h1>
      <p>{status}</p>
      <section>
        {posts.map((post) => (
          <p key={post.id}>{post.body}</p>
        ))}
      </section>
    </>
  )
}

export default App
