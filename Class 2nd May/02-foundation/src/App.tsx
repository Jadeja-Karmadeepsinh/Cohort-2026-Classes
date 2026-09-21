import './App.css'

const shows = [
  {
    id: 1,
    title: "The Component Returns",
    time: "10:00 AM",
    hall: "Hall A",
  },
  {
    id: 2,
    title: "Attack of the Re-render",
    time: "12:30 PM",
    hall: "Hall B",
  },
  {
    id: 3,
    title: "Virtual DOM Nights",
    time: "04:00 PM",
    hall: "Hall C",
  },
];

function App() {

  return (
    <>
      <div>Shows</div>
      <section>
        {shows.map((show) => (
          <>
            <h3>{show.title}</h3>
            <h4>{show.hall}</h4>
            <h5>{show.time}</h5>
          </>
        ))}
      </section>
    </>
  )
}

export default App
