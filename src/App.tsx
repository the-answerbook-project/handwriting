import { Excalidraw, MainMenu, Sidebar, serializeAsJSON } from '@excalidraw/excalidraw'
import { ExcalidrawElement } from '@excalidraw/excalidraw/types/element/types'
import { AppState, BinaryFiles, ExcalidrawImperativeAPI } from '@excalidraw/excalidraw/types/types'
import { Button, Theme } from '@radix-ui/themes'
import { MathJax, MathJaxContext } from 'better-react-mathjax'
import { useCallback, useEffect, useRef, useState } from 'react'
import { ReactSketchCanvas, ReactSketchCanvasRef } from 'react-sketch-canvas'

import './App.css'
import UserSelector from './UserSelector'
import axiosInstance from './axios'
import './excalidraw.overrides.css'

const USER = 'hpotter'

function App() {
  const [latex, setLatex] = useState('\\(\\frac{10}{4x} \\approx 2^{12}\\)')
  const [username, setUsername] = useState(USER)
  const [eraseMode, setEraseMode] = useState(false)
  const [excalidrawAPI, setExcalidrawAPI] = useState<ExcalidrawImperativeAPI | null>(null)
  const sketchRef = useRef<ReactSketchCanvasRef>(null)

  const exportSVG = () => {
    // @ts-expect-error: excalidrawAPI is not null
    const asJSON = serializeAsJSON(
      excalidrawAPI?.getSceneElements(),
      excalidrawAPI?.getAppState(),
      excalidrawAPI?.getFiles(),
      'local'
    )
    console.log(excalidrawAPI?.getSceneElements())
  }

  const toggleEraseMode = () => {
    const newEraseMode = !eraseMode
    // @ts-expect-error: sketchRef is not null
    sketchRef.current.eraseMode(newEraseMode)
    setEraseMode(newEraseMode)
  }

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

  // setExcalidrawState({ elements, appState, files, type: "local" })

  return (
    <Theme radius="small" appearance="dark">
      <MathJaxContext>
        <div style={{ height: '50vh' }}>
          <Excalidraw
            zenModeEnabled
            UIOptions={{ tools: { image: false } }}
            gridModeEnabled
            excalidrawAPI={setExcalidrawAPI}
          >
            <MainMenu />
          </Excalidraw>
        </div>
        <div className="flex-container">
          {/* <MathJax>{latex}</MathJax> */}
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
