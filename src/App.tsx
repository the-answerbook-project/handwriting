import { Button, Theme } from '@radix-ui/themes'
import { useRef } from 'react'
import { ReactSketchCanvas } from 'react-sketch-canvas'

import './App.css'

function App() {
  const sketchRef = useRef(null)

  function exportSVG() {
    // @ts-expect-error: sketchRef is not null
    sketchRef.current.exportPaths().then((res) => {
      console.log(res)
    })
  }

  return (
    <Theme radius="small" appearance="dark">
      <ReactSketchCanvas
        width="1000"
        height="500"
        strokeWidth={4}
        strokeColor="red"
        ref={sketchRef}
      />
      <Button onClick={exportSVG}>Save</Button>
    </Theme>
  )
}

export default App
