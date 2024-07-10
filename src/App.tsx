import { Excalidraw, MainMenu, serializeAsJSON } from '@excalidraw/excalidraw'
import { ClipboardData } from '@excalidraw/excalidraw/types/clipboard'
import {
  AppState,
  ExcalidrawImperativeAPI,
  ExcalidrawInitialDataState,
} from '@excalidraw/excalidraw/types/types'
import { Button, Theme } from '@radix-ui/themes'
import { MathJax, MathJaxContext } from 'better-react-mathjax'
import { KeyboardEventHandler, useCallback, useEffect, useState } from 'react'

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
  const [viewOnly] = useState(false)
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
      updateStrokes({ elements: [] })
      excalidrawAPI?.updateScene({ elements: [] })
    }
  }, [excalidrawAPI, updateStrokes])

  useEffect(() => {
    axiosInstance.get(`/${username}/handwriting`).then((res) => {
      setExcalidrawData(res.data.excalidraw)
      if (!res.data.error) {
        excalidrawAPI?.updateScene({
          appState: res.data.excalidraw.appState,
          elements: res.data.excalidraw.elements,
        })
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
      if (type == 'freedraw' || type == 'eraser' || type == 'selection') {
        setTimeout(() => {
          const elements = excalidrawAPI!.getSceneElements()!
          updateStrokes({ elements })
        })
      }
    }

    const pointerUpCleanup = excalidrawAPI?.onPointerUp(pointerUpHandler)

    return () => {
      canvas?.removeEventListener('contextmenu', handleContextMenu)
      if (pointerUpCleanup) pointerUpCleanup()
    }
  }, [username, updateStrokes, excalidrawAPI])

  const pasteHandler = (data: ClipboardData): boolean => !data.text

  const keyDownHandler: KeyboardEventHandler<HTMLDivElement> = useCallback(
    (event) => {
      // Prevent writing in text boxes
      if (document.activeElement?.nodeName === 'TEXTAREA') {
        event.preventDefault()
        event.stopPropagation()
      }

      // Only allow certain keys to be pressed in the canvas
      // This prevents access to hidden tools e.g. pressing "r" to enter rectangle mode
      if (
        event.code === 'Backspace' ||
        event.code.includes('Arrow') ||
        ((event.ctrlKey || event.metaKey) &&
          ['KeyC', 'KeyV', 'KeyZ', 'KeyY', 'Equal', 'Minus', 'Digit0'].includes(event.code))
      ) {
        setTimeout(() => {
          updateStrokes({ elements: excalidrawAPI?.getSceneElements() })
        })
      } else if (
        !['KeyH', 'KeyE', 'KeyV', 'KeyP', 'Digit1', 'Digit0', 'Digit7'].includes(event.code)
      ) {
        event.preventDefault()
        event.stopPropagation()
      }
    },
    [excalidrawAPI, updateStrokes]
  )

  return (
    <Theme radius="small" appearance="dark">
      <div
        className="excalidraw-container-container"
        onKeyDownCapture={keyDownHandler}
        onDoubleClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
        }}
      >
        <Excalidraw
          zenModeEnabled
          UIOptions={{ tools: { image: false } }}
          gridModeEnabled
          excalidrawAPI={setExcalidrawAPI}
          initialData={excalidrawData}
          onPaste={pasteHandler}
          viewModeEnabled={viewOnly}
        >
          <MainMenu>
            {!viewOnly && (
              <MainMenu.Item onSelect={clearCanvas} icon={<>🧽</>}>
                Clear canvas
              </MainMenu.Item>
            )}
          </MainMenu>
        </Excalidraw>
      </div>
      <MathJaxContext>
        <div className="flex-container">
          <MathJax>{`\\( ${latex} \\)`}</MathJax>
        </div>
      </MathJaxContext>
      <Button onClick={exportSVG}>Save 💾</Button>
      <UserSelector username={username} setUsername={setUsername} />
    </Theme>
  )
}

export default App
