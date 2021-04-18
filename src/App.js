import React, { useCallback, useRef, useState } from 'react';
import { produce } from 'immer';

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

const App = () => {


  //setting up 2d array of numRows*numCols with all dead cell
  const generateEmptyGrid = (value) => Array.from(Array(value), () => Array.from(Array(value), () => 0));

  //setting up 2d array of numRows*numCols with random alive and dead cell
  const generateRandomFilledGrid = (value) => Array.from(Array(gridSize), () => Array.from(Array(gridSize), () => Math.random() > value ? 1 : 0));


  const [gridSize, setGridSize] = useState(40)
  const [grid, setGrid] = useState(() => generateEmptyGrid(gridSize));
  const [running, setRunning] = useState(false);
  const [next, setNext] = useState(false);
  const [randomRange, setRandomRange] = useState(0.7);

  const runningRef = useRef(running);
  const nextRef = useRef(next);

  runningRef.current = running;
  nextRef.current = next;

  const runSimulation = useCallback(
    () => {
      if (!runningRef.current) {
        return
      }
      console.log("called");
      let deadCount = 0;
      setGrid((currGrid) => {
        return produce(currGrid, gridCopy => {
          for (let i = 0; i < gridSize; i++) {
            for (let j = 0; j < gridSize; j++) {
              currGrid[i][j] === 0 && deadCount++;
              let currentCellNeighbours = 0;
              neighbours.forEach(([x, y]) => {
                const newI = i + x;
                const newJ = j + y;
                if (newI >= 0 && newI < gridSize && newJ >= 0 && newJ < gridSize) { //checking bounds
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
      if (deadCount === gridSize * gridSize) {
        setRunning(false);
        return;
      }
      if (!nextRef.current) {
        setTimeout(runSimulation, 100);
      } else {
        setNext(false);
        setRunning(false);
        return;
      }
    }, [gridSize]);


  return (
    <>
      <h2>Conway's Game of Life</h2>
      <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: '10px' }}>
        <button onClick={() => {
          setRunning(!running);
          setNext(false);
          if (!running) {
            runningRef.current = true;
            runSimulation();
          }
        }}>{running ? 'stop' : 'start'}</button>
        <button
          onClick={() => {
            setNext(true);
            setRunning(true);
            runningRef.current = true;
            nextRef.current = true;
            runSimulation();
          }}>next</button>

        <button
          onClick={() => {
            setRunning(false);
            setGrid(generateEmptyGrid(gridSize));
          }}>clear</button>


        <div>
          <button
            onClick={() => {
              setGrid(generateRandomFilledGrid(randomRange));
            }}>random</button>

          <input
            type='range'
            id='randomRange'
            min={0.1}
            max={0.9}
            step={0.1}
            value={randomRange}
            onChange={(e) => {
              setRunning(false);
              const newValue = parseFloat(e.target.value);
              setRandomRange(newValue);
              setGrid(generateRandomFilledGrid(newValue));
            }} />{randomRange * 100}
        </div>
        <div>
          <input
            type='number'
            id='gridRange'
            min={10}
            max={100}
            step={10}
            placeholder={'number of rows and columns'}
            value={gridSize}
            onChange={(e) => {
              setRunning(false);
              const newValue = parseFloat(e.target.value);
              setGridSize(parseInt(newValue));
              setGrid(generateEmptyGrid(newValue));
            }} />
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${gridSize},20px)` }}>
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

