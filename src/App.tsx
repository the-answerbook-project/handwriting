import { Button, Theme } from '@radix-ui/themes'
import { MathJax, MathJaxContext } from 'better-react-mathjax'
import { useRef, useState } from 'react'
import { ReactSketchCanvas } from 'react-sketch-canvas'

import './App.css'
import axiosInstance from './axios'

const USER = 'hpotter'

function App() {
  const [latex, setLatex] = useState('\\(\\frac{10}{4x} \\approx 2^{12}\\)')
  const [eraseMode, setEraseMode] = useState(false)

  const sketchRef = useRef(null)

  const exportSVG = () => {
    // @ts-expect-error: sketchRef is not null
    sketchRef.current.exportPaths().then((res) => {
      // api call
      axiosInstance.put('/handwriting', { username: USER, handwriting: res })
    })
  }

  const toggleEraseMode = () => {
    const newEraseMode = !eraseMode
    // @ts-expect-error: sketchRef is not null
    sketchRef.current.eraseMode(newEraseMode)
    setEraseMode(newEraseMode)
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
        <br />
        <Button onClick={toggleEraseMode}>{eraseMode ? 'Use Pen ✏️' : 'Use Eraser 🧼'}</Button>
        <br />
        <br />
        <Button onClick={exportSVG}>Save 💾</Button>
      </MathJaxContext>
    </Theme>
  )
}

export default App
