import './App.css'
import AvatarCard from './components/AvatarCard.tsx'

interface avatar {
  id: number,
  name: string,
  role: string,
  power: string,
  initials: string
}

const avatars = [
  {
    id: 1,
    name: "Nova",
    role: "Navigator",
    power: "Routing",
    initials: "NV",
  },
  {
    id: 2,
    name: "Flux",
    role: "State Keeper",
    power: "useState",
    initials: "FX",
  },
  {
    id: 3,
    name: "Memo",
    role: "Optimizer",
    power: "Memoization",
    initials: "MM",
  },
];

//props are objects
//if needed any specific things from props then destructure it 
//in destructring props there is one special keyword children
function Shell({title, children}) {
  return (
    <section>
      <h2>Resuable shell</h2>
      <h3>{title}</h3>
      <h3>{children}</h3>
    </section>
  )
}

function App() {
  
  return (
    <>
      <h1>Hello</h1>
      <section>
        {avatars.map((avatar) => (
          <AvatarCard 
          key={avatar.id}
          avatar={avatar}
          level={avatar.id === 1 ? "captain" : undefined}
          />
        ))}
      </section>

      <h1>Children in REACT</h1>
      <section>
        {/* <Shell title="hello" children="this is children" />  we can write children also like this but its not preferable*/}
        <Shell title="how to write children">
          <div>
            <h1>This is children</h1>
            <h1>This is also children</h1>
          </div>
        </Shell>
      </section>
    </>
  )
}

export default App
