import React, { useCallback, useEffect, useRef, useState } from 'react';
import { produce } from 'immer';
import { TiMediaFastForward, TiMediaPause, TiMediaPlay, TiRefresh, TiZoomIn, TiZoomOut, TiPlus, TiMinus, TiArrowMove } from 'react-icons/ti';
import { FaRandom } from 'react-icons/fa';
import { dragElement } from './dragFunction';

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
  const generateRandomFilledGrid = (value) => Array.from(Array(gridSize), () => Array.from(Array(gridSize), () => Math.random() > value ? 0 : 1));


  const [gridSize, setGridSize] = useState(40)
  const [grid, setGrid] = useState(() => generateEmptyGrid(gridSize));
  const [running, setRunning] = useState(false);
  const [next, setNext] = useState(false);
  const [randomRange, setRandomRange] = useState(0.3);
  const [zoom, setZoom] = useState(1.0);

  const runningRef = useRef(running);
  const nextRef = useRef(next);
  const controlRef = useRef();
  const dragRef = useRef();

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
        setRunning(false);
        return;
      }
    }, [gridSize]);

  useEffect(
    () => {

      dragElement(dragRef.current, controlRef.current)
    },
    [],
  )

  return (
    <>
      <h1><a href="https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life" rel="noreferrer" target='_blank' title='wikipedia link'>Conway's Game of Life</a></h1>
      <div className='controlContainer' id='control' ref={controlRef}>
        <div title='drag to move' className='drag' ref={dragRef}><TiArrowMove size='1.7em' /></div>
        <div className='actionControlsContainer'>
          <div className='controls'>
            {!running ?
              <TiMediaPlay
                size='1.9em'
                title='play'
                className='icons'
                onClick={() => {
                  setRunning(true);
                  setNext(false);
                  nextRef.current = false;
                  runningRef.current = true;
                  runSimulation();
                }} />
              :
              <TiMediaPause
                size='1.9em'
                title='pause'
                className='icons'
                onClick={() => {
                  setRunning(false);
                  setNext(false);
                  nextRef.current = false;
                  runningRef.current = false;
                }} />
            }
            <TiMediaFastForward
              size='1.9em'
              title='next'
              style={{ color: !(running || next) ? '#494949' : undefined, cursor: (running || next) ? 'pointer' : 'not-allowed' }}
              disabled={!(running || next)}
              onClick={(e) => {
                if (!(running || next)) {
                  e.preventDefault();
                  return;
                }
                setNext(true);
                setRunning(true);
                runningRef.current = true;
                nextRef.current = true;
                runSimulation();
              }} />

            <TiRefresh
              title='reset'
              size='1.9em'
              className='icons'
              onClick={() => {
                setRunning(false);
                setNext(false);
                runningRef.current = false;
                nextRef.current = false;
                setGrid(generateEmptyGrid(gridSize));
              }} />

          </div>
          <div
            className='controls'
          >
            <FaRandom
              size='1.3em'
              title='create random alive cells'
              className='icons'
              onClick={() => {
                setGrid(generateRandomFilledGrid(randomRange));
              }} />
            <input
              type='range'
              id='randomRange'
              title='set random alive cell'
              className='slider'
              min={0.1}
              max={0.9}
              step={0.1}
              value={randomRange}
              onChange={(e) => {
                setRunning(false);
                const newValue = parseFloat(e.target.value);
                setRandomRange(newValue);
                setGrid(generateRandomFilledGrid(newValue));
              }} />
          </div>
          <div
            className='controls'
          >
            <TiMinus
              size='1.4em'
              title='reduce grid size'
              className='icons'
              onClick={() => {
                if (!(gridSize < 20)) {
                  gridSize === 40 && setZoom((1.2));
                  gridSize === 50 && setZoom((1));
                  gridSize === 60 && setZoom((0.8));
                  gridSize === 80 && setZoom((0.6));
                  gridSize === 90 && setZoom((0.4));
                  setRunning(false);
                  const newValue = gridSize - 10;
                  setGridSize(newValue);
                  setGrid(generateEmptyGrid(newValue));
                }
              }}
            />
            <span title='grid size'>{gridSize}</span>
            <TiPlus
              size='1.4em'
              title='increase grid size'
              className='icons'
              onClick={() => {
                if (!(gridSize > 90)) {
                  gridSize === 20 && setZoom((1.2));
                  gridSize === 30 && setZoom((1));
                  gridSize === 40 && setZoom((0.8));
                  gridSize === 50 && setZoom((0.6));
                  gridSize === 70 && setZoom((0.4));

                  setRunning(false);
                  const newValue = gridSize + 10;
                  setGridSize(newValue);
                  setGrid(generateEmptyGrid(newValue));
                }
              }}
            />
          </div>
          <div className='controls'>
            <TiZoomOut
              size='1.4em'
              title='zoom out'
              className='icons'
              onClick={() => {
                !(zoom < 0.6) &&
                  setZoom((zoom - 0.2));
              }}
            />
            <span title='zoom value'>{Math.round(zoom * 100)}</span>
            <TiZoomIn
              size='1.4em'
              title='zoom in'
              className='icons'
              onClick={() => {
                !(zoom > 1.8) &&
                  setZoom((zoom + 0.2));
              }}
            />
            <button title='reset zoom' onClick={() => setZoom(1)}>reset</button>
          </div>
        </div>
      </div>
      <div style={{ display: 'grid', justifyContent: 'center', gridTemplateColumns: `repeat(${gridSize},20px)`, zoom: `${zoom}` }}>
        {grid.map((gridRow, i) => gridRow.map((gridItem, j) => {
          return (
            <div
              key={`${i}-${j}`}
              style={{ width: '20px', height: '20px', outline: '1px solid #494949', backgroundColor: gridItem ? 'teal' : undefined }}
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

