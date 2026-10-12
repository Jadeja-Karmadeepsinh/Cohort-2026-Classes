"use client";

import { useState } from 'react';
import { createUserSchema } from "@monorepo-practice/utils"
import axios from 'axios';

export default function Home() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const valid = createUserSchema.safeParse({username: name, email, password})
    console.log('hello')
    const response = await axios.post('http://localhost:3000/register', valid.data, {
      headers: {
        'Content-Type': 'application/json',
      },
    })
    alert(response.data.message)
  }

  return (
    <>
      <form onSubmit={handleSubmit} noValidate={true}>
        <input type="text" placeholder="Username" value={name} onChange={(e) => setName(e.target.value)} />
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button type="submit">Register</button>
      </form>
    </>
  )
}