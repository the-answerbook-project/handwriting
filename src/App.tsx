import { Button, Theme } from '@radix-ui/themes'
import { MathJax, MathJaxContext } from 'better-react-mathjax'
import { useCallback, useEffect, useRef, useState } from 'react'
import { CanvasPath, ReactSketchCanvas, ReactSketchCanvasRef } from 'react-sketch-canvas'

import './App.css'
import UserSelector from './UserSelector'
import axiosInstance from './axios'

const USER = 'hpotter'

let mouseDown = false

document.body.addEventListener('mousedown', () => (mouseDown = true))
document.body.addEventListener('mouseup', () => (mouseDown = false))

function App() {
  const [latex, setLatex] = useState('\\(\\frac{10}{4x} \\approx 2^{12}\\)')
  const [username, setUsername] = useState(USER)
  const [eraseMode, setEraseMode] = useState(false)

  const [currPathId, setCurrPathId] = useState(0)

  const sketchRef = useRef<ReactSketchCanvasRef>(null)

  const exportSVG = () => {
    // @ts-expect-error: sketchRef is not null
    sketchRef.current.exportPaths().then((res) => {
      // api call
      axiosInstance.put(`/${username}/handwriting`, { handwriting: res })
    })
  }

  const toggleEraseMode = useCallback(() => {
    setEraseMode(!eraseMode)
  }, [eraseMode])

  const renderLatex = useCallback(() => {
    // api call
    axiosInstance.get(`/${username}/latex`).then((res) => {
      setLatex(res.data.text)
    })
  }, [username])

  useEffect(() => {
    axiosInstance.get(`/${username}/handwriting`).then((res) => {
      sketchRef.current?.clearCanvas()

      if (!res.data.error) {
        sketchRef.current?.loadPaths(res.data)
        renderLatex()
      }
    })
  }, [username, renderLatex])

  // TODO: useEffect to add and remove event listeners on rerender because eraseMode doesn't update
  const pathEventListenerFactory = (pathId: number) => {
    return () => {
      console.log('event listener called on id', pathId, 'mouseDown is', mouseDown, eraseMode)
      if (mouseDown && eraseMode) {
        // @ts-expect-error: sketchRef is not null
        sketchRef.current.exportPaths().then((res) => {
          res.splice(pathId, 1)

          // @ts-expect-error: sketchRef is not null
          sketchRef.current.loadPaths(res)
        })
      }
    }
  }

  // (path: CanvasPath, isEraser: boolean) => void
  const assignPathEventListener = (e: any) => {
    // console.log("try", `react-sketch-canvas__stroke-group-0__paths__${(currPathId-1)/2}`)

    // TODO: indexing of elements is not consistent
    const path = document.getElementById(
      `react-sketch-canvas__stroke-group-0__paths__${(currPathId - 1) / 2}`
    )
    if (path) {
      path.addEventListener('mouseover', pathEventListenerFactory((currPathId - 1) / 2))
      // console.log("listening on", `react-sketch-canvas__${currPathId} (-1 /2)`)
    }
    setCurrPathId(currPathId + 1)
  }

  return (
    <Theme radius="small" appearance="dark">
      <MathJaxContext>
        <ReactSketchCanvas
          height="50%"
          strokeWidth={4}
          strokeColor="red"
          ref={sketchRef}
          onStroke={assignPathEventListener}
          readOnly={eraseMode}
        />
        <div className="flex-container">
          <MathJax>{latex}</MathJax>
          <Button onClick={renderLatex}>Render Latex 🔎</Button>
        </div>
        <br />
        <Button onClick={toggleEraseMode}>{eraseMode ? 'Use Pen ✏️' : 'Use Eraser 🧼'}</Button>
        <br />
        <br />
        <Button onClick={exportSVG}>Save 💾</Button>
        <UserSelector username={username} setUsername={setUsername} />
      </MathJaxContext>
    </Theme>
  )
}

export default App
