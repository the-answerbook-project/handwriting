import { Excalidraw, MainMenu, serializeAsJSON } from '@excalidraw/excalidraw'
import { ClipboardData } from '@excalidraw/excalidraw/types/clipboard'
import {
  AppState,
  ExcalidrawImperativeAPI,
  ExcalidrawInitialDataState,
} from '@excalidraw/excalidraw/types/types'
import { Button, Theme } from '@radix-ui/themes'
import { MathJax, MathJaxContext } from 'better-react-mathjax'
import { useCallback, useEffect, useState } from 'react'

import './App.css'
import UserSelector from './UserSelector'
import axiosInstance from './axios'
import './excalidraw.overrides.scss'
import useLiveUpdates from './live-updates.hook'

const USER = 'hpotter'

function App() {
  const [username, setUsername] = useState(USER)
  const [excalidrawAPI, setExcalidrawAPI] = useState<ExcalidrawImperativeAPI | null>(null)
  const [excalidrawData, setExcalidrawData] = useState<ExcalidrawInitialDataState | null>(null)
  const { latex, updateStrokes } = useLiveUpdates(username)

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

  const clearCanvas = useCallback(() => {
    if (confirm('Are you sure you want to clear the board?')) {
      excalidrawAPI?.updateScene({ elements: [] })
    }
  }, [excalidrawAPI])

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

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
    }

    // @ts-expect-error: the element is a canvas
    const canvas: HTMLCanvasElement = document.getElementsByClassName('interactive')[0]

    canvas?.addEventListener('contextmenu', handleContextMenu)

    const pointerUpHandler = ({ type }: AppState['activeTool']): void => {
      if (type == 'freedraw' || type == 'eraser') {
        updateStrokes({ elements: excalidrawAPI?.getSceneElements() })
      }
    }

    excalidrawAPI?.onPointerUp(pointerUpHandler)

    return () => canvas?.removeEventListener('contextmenu', handleContextMenu)
  }, [username, updateStrokes, excalidrawAPI])

  const pasteHandler = (data: ClipboardData): boolean => !data.text

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
            onPaste={pasteHandler}
          >
            <MainMenu>
              <MainMenu.Item onSelect={clearCanvas}>Clear canvas</MainMenu.Item>
            </MainMenu>
          </Excalidraw>
        </div>
        <div className="flex-container">
          <MathJax>{latex}</MathJax>
        </div>
        <Button onClick={exportSVG}>Save 💾</Button>
        <UserSelector username={username} setUsername={setUsername} />
      </MathJaxContext>
    </Theme>
  )
}

export default App
