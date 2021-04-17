import React, { useCallback, useRef, useState } from 'react';
import { produce } from 'immer';

const numRows = 40;
const numCols = 40;

//neighbours of current cell
const neighbours = [
  [-1, -1], //NW
  [-1, 0],  //N
  [-1, 1],  //NE
  [0, -1],  //W
  [0, 1], //E
  [1, -1],  //SW
  [1, 0], //S
  [1, 1], //SW //[0,0] is not there as its the cell itself and we want neighbours
];

//setting up 2d array of numRows*numCols with all dead cell
const generateEmptyGrid = () => Array.from(Array(numRows), () => Array.from(Array(numCols), () => 0));

//setting up 2d array of numRows*numCols with random alive and dead cell
const generateRandomFilledGrid = () => Array.from(Array(numRows), () => Array.from(Array(numCols), () => Math.random() > 0.7 ? 1 : 0));

const App = () => {

  const [grid, setGrid] = useState(() => generateEmptyGrid());
  const [running, setRunning] = useState(false);
  const runningRef = useRef(running);

  runningRef.current = running;

  const runSimulation = useCallback(
    () => {
      if (!runningRef.current) {
        return
      }
      console.log("called")
      setGrid((currGrid) => {
        return produce(currGrid, gridCopy => {
          for (let i = 0; i < numRows; i++) {
            for (let j = 0; j < numCols; j++) {
              let currentCellNeighbours = 0;
              neighbours.forEach(([x, y]) => {
                const newI = i + x;
                const newJ = j + y;
                if (newI >= 0 && newI < numRows && newJ >= 0 && newJ < numCols) { //checking bounds
                  currentCellNeighbours += currGrid[newI][newJ]; //count the number of neighbours it has.
                }
              })
              if (currentCellNeighbours < 2 || currentCellNeighbours > 3) {
                // Any live cell with fewer than two live neighbours dies
                // Any live cell with more than three live neighbours dies
                gridCopy[i][j] = 0;
                //Any live cell with two or three live neighbours lives on to the next generation
                //Nothing as to be done for the above rule
              } else if (currGrid[i][j] === 0 && currentCellNeighbours === 3) {
                //Any dead cell with exactly three live neighbours becomes a live cell
                gridCopy[i][j] = 1;
              }
            }
          }
        })
      })
      setTimeout(runSimulation, 100);
    }, []);


  return (
    <>
      <button onClick={() => {
        setRunning(!running);
        if (!running) {
          runningRef.current = true;
          runSimulation();
        }
      }}>{running ? 'stop' : 'start'}</button>

      <button onClick={() => {
        setRunning(false);
        setGrid(generateEmptyGrid());
      }}>clear</button>

      <button
        onClick={() => {
          setGrid(generateRandomFilledGrid());
        }}>random</button>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${numCols},20px)` }}>
        {grid.map((gridRow, i) => gridRow.map((gridItem, j) => {
          return (
            <div
              key={`${i}-${j}`}
              style={{ width: '20px', height: '20px', border: '1px solid black', backgroundColor: gridItem ? 'teal' : undefined }}
              onClick={() => {
                const newGrid = produce(grid, gridCopy => {
                  gridCopy[i][j] = grid[i][j] ? 0 : 1;
                });
                setGrid(newGrid);
              }}
            >
            </div>
          )
        }))}
      </div>
    </>
  )
}

export default App

