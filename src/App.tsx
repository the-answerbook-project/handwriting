import { Excalidraw, MainMenu, serializeAsJSON } from '@excalidraw/excalidraw'
import {
  ExcalidrawImperativeAPI,
  ExcalidrawInitialDataState,
} from '@excalidraw/excalidraw/types/types'
import { Button, Theme } from '@radix-ui/themes'
import { MathJax, MathJaxContext } from 'better-react-mathjax'
import { useCallback, useEffect, useState } from 'react'

import './App.css'
import UserSelector from './UserSelector'
import axiosInstance from './axios'
import './excalidraw.overrides.css'

const USER = 'hpotter'

function App() {
  const [latex, setLatex] = useState('')
  const [confidence, setConfidence] = useState(0)
  const [username, setUsername] = useState(USER)
  const [excalidrawAPI, setExcalidrawAPI] = useState<ExcalidrawImperativeAPI | null>(null)
  const [excalidrawData, setExcalidrawData] = useState<ExcalidrawInitialDataState | null>(null)

  const exportSVG = () => {
    const asJSON = serializeAsJSON(
      excalidrawAPI!.getSceneElements(),
      excalidrawAPI!.getAppState(),
      excalidrawAPI!.getFiles(),
      'local'
    )

    axiosInstance.put(`/${username}/handwriting`, {
      handwriting: { excalidraw: JSON.parse(asJSON) },
    })
  }

  const renderLatex = useCallback(() => {
    // api call
    axiosInstance.get(`/${username}/latex`).then((res) => {
      setLatex(res.data.text)
      setConfidence(res.data.confidence)
    })
  }, [username])

  useEffect(() => {
    axiosInstance.get(`/${username}/handwriting`).then((res) => {
      setExcalidrawData(res.data.excalidraw)
      if (!res.data.error) {
        excalidrawAPI?.updateScene({
          appState: res.data.excalidraw.appState,
          elements: res.data.excalidraw.elements,
        })
        // renderLatex()
      } else {
        excalidrawAPI?.updateScene({ elements: [] })
      }
    })
  }, [username, renderLatex, excalidrawAPI])

  return (
    <Theme radius="small" appearance="dark">
      <MathJaxContext>
        <div style={{ height: '50vh' }}>
          <Excalidraw
            zenModeEnabled
            UIOptions={{ tools: { image: false } }}
            gridModeEnabled
            excalidrawAPI={setExcalidrawAPI}
            initialData={excalidrawData}
          >
            <MainMenu />
          </Excalidraw>
        </div>
        <div className="flex-container">
          <MathJax>{latex}</MathJax>
          <Button onClick={renderLatex}>Render Latex 🔎</Button>
        </div>
        <div>Confidence: {confidence}</div>
        <br />
        <Button onClick={exportSVG}>Save 💾</Button>
        <UserSelector username={username} setUsername={setUsername} />
      </MathJaxContext>
    </Theme>
  )
}

export default App
