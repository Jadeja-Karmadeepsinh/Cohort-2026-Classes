import { useState } from 'react'
import './App.css'
import ManualForm from './ManualForm'
import HookForm from './HookForm'

function App() {
  const [tab, setTab] = useState("manual")
  //topics conditional rendering
  // tabs
  return (
    <>
      <div>
        <div className="shell">
          <h1>Job Application</h1>
          <p>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Animi, rerum!</p>
        </div>
        <div className="tab">
          <button onClick={() => setTab("manual")}>Manual</button>
          <button onClick={() => setTab("hook")}>Hook</button>
        </div>
        <h1>Getting started with react</h1>
        {tab === "manual" ? <ManualForm /> : <HookForm />}
        {/* <ManualForm /> */}
        {/* <HookForm /> */}
      </div>
    </>
  )
}

export default App
