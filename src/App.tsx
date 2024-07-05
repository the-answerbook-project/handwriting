import { Button, Theme } from '@radix-ui/themes'
import { MathJax, MathJaxContext } from 'better-react-mathjax'
import { useRef, useState } from 'react'
import { ReactSketchCanvas } from 'react-sketch-canvas'

import './App.css'

function App() {
  const [latex, setLatex] = useState('')

  const sketchRef = useRef(null)

  const exportSVG = () => {
    // @ts-expect-error: sketchRef is not null
    sketchRef.current.exportPaths().then((res) => {
      const json = JSON.stringify(res)
      // api call
    })
  }

  const renderLatex = () => {
    // api call
  }

  return (
    <Theme radius="small" appearance="dark">
      <MathJaxContext>
        <ReactSketchCanvas
          width="1000"
          height="500"
          strokeWidth={4}
          strokeColor="red"
          ref={sketchRef}
        />
        <Button onClick={renderLatex}>Render Latex</Button>
        <Button onClick={exportSVG}>Save</Button>
        <MathJax>{latex}</MathJax>
      </MathJaxContext>
    </Theme>
  )
}

export default App
