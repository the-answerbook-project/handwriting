import { ExcalidrawFreeDrawElement } from '@excalidraw/excalidraw/types/element/types'
import { SceneData } from '@excalidraw/excalidraw/types/types'
import axios, { AxiosError } from 'axios'
import { useCallback, useEffect, useState } from 'react'

import axiosInstance from './axios'

type Strokes = {
  elements: SceneData['elements']
}

interface LiveUpdateHook {
  latex: string
  updateStrokes: React.Dispatch<React.SetStateAction<Strokes>>
}

interface Token {
  app_token: string
  strokes_session_id: string
}

const transformStrokesForAPI = (strokes: Strokes): Record<string, number[][]> => {
  const apiStrokes: Record<string, number[][]> = {
    x: [],
    y: [],
  }

  for (const element of strokes.elements ?? []) {
    const newStrokeX: number[] = []
    const newStrokeY: number[] = []
    for (const [x, y] of (element as ExcalidrawFreeDrawElement).points) {
      newStrokeX.push(x + element.x)
      newStrokeY.push(y + element.y)
    }

    apiStrokes.x.push(newStrokeX)
    apiStrokes.y.push(newStrokeY)
  }

  return apiStrokes
}

const getLatexFromStrokes = (token: Token, strokes: Strokes, abortController: AbortController) => {
  return axios.post(
    `https://api.mathpix.com/v3/strokes`,
    {
      strokes: {
        strokes: transformStrokesForAPI(strokes),
      },
    },
    {
      signal: abortController.signal,
      headers: {
        app_token: token.app_token,
        strokes_session_id: token.strokes_session_id,
      },
    }
  )
}

const useLiveUpdates = (username: string): LiveUpdateHook => {
  const [latex, setLatex] = useState('')
  const [token, setToken] = useState<Token>({
    app_token: '',
    strokes_session_id: '',
  })
  const [strokes, setStrokes] = useState<Strokes>({ elements: [] })

  const getToken = useCallback(() => {
    axiosInstance.get(`/hpotter/mathpix-token`).then((res) => {
      setToken(res.data)
    })
  }, [])

  useEffect(() => {
    if (strokes.elements?.length === 0) return
    const abortController = new AbortController()

    const latexFetch = getLatexFromStrokes(token, strokes, abortController)
    latexFetch
      .then(({ data }) => setLatex(data.text))
      .catch((error: Error | AxiosError) => {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          getToken()
        } else {
          console.error(error)
        }
      })

    return () => {
      abortController.abort('strokes changed')
    }
  }, [strokes, token, getToken])

  useEffect(getToken, [getToken])

  useEffect(() => {
    const abortController = new AbortController()

    axiosInstance.get(`/${username}/latex`, { signal: abortController.signal }).then((res) => {
      setLatex(res.data.text)
    })

    return () => abortController.abort('Unmounted')
  }, [username])

  return {
    latex,
    updateStrokes: setStrokes,
  }
}

export default useLiveUpdates
