import { Button, Theme } from '@radix-ui/themes'
import { MathJax, MathJaxContext } from 'better-react-mathjax'
import { useRef, useState } from 'react'
import { ReactSketchCanvas } from 'react-sketch-canvas'

import './App.css'
import axiosInstance from './axios'

const USER = 'hpotter'

function App() {
  const [latex, setLatex] = useState('\\(\\frac{10}{4x} \\approx 2^{12}\\)')

  const sketchRef = useRef(null)

  const exportSVG = () => {
    // @ts-expect-error: sketchRef is not null
    sketchRef.current.exportPaths().then((res) => {
      // api call
      axiosInstance.put('/handwriting', { username: USER, handwriting: res })
    })
  }

  const renderLatex = () => {
    // api call
  }

  return (
    <Theme radius="small" appearance="dark">
      <MathJaxContext>
        <ReactSketchCanvas height="50%" strokeWidth={4} strokeColor="red" ref={sketchRef} />
        <div className="flex-container">
          <MathJax>{latex}</MathJax>
          <Button onClick={renderLatex}>Render Latex 🔎</Button>
        </div>
        <Button onClick={exportSVG}>Save 💾</Button>
      </MathJaxContext>
    </Theme>
  )
}

export default App
