import React, { useState } from 'react'

const rows = 40;
const cols = 40;

const App = () => {

  const [grid, setGrid] = useState(Array.from(Array(rows), () => Array.from(Array(cols), () => 0))) //setting up 2d array of 50*50

  console.log(grid)
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols},20px)` }}>
      {grid.map((gridRow, i) => gridRow.map((gridItem, j) => {
        return (
          <div
            key={`${i}-${j}`}
            style={{ width: '20px', height: '20px', border: '1px solid black', backgroundColor: gridItem ? 'teal' : undefined }}
          >
          </div>
        )
      }))}
    </div>
  )
}

export default App

