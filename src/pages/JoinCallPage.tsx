import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import DailyIframe, { type DailyCall } from '@daily-co/daily-js'
import { getVideoRoomResponseSchema, type GetVideoRoomResponse } from '../shared'
import { backendClient } from '../lib/backendClient'

export function JoinCallPage() {
  const { slug } = useParams<{ slug: string }>()
  const containerRef = useRef<HTMLDivElement>(null)
  const callFrameRef = useRef<DailyCall | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function join() {
      let data: GetVideoRoomResponse
      try {
        data = await backendClient.get<GetVideoRoomResponse>(`/video-rooms/${slug}`)
      } catch {
        if (!cancelled) setError('No se pudo abrir la sala. Verifica que el link siga vigente.')
        return
      }
      if (cancelled) return

      const parsed = getVideoRoomResponseSchema.safeParse(data)
      if (!parsed.success || !containerRef.current) {
        setError('Respuesta inesperada del servidor.')
        return
      }

      const callFrame = DailyIframe.createFrame(containerRef.current, {
        showLeaveButton: true,
        iframeStyle: { width: '100%', height: '100%', border: '0' },
      })
      callFrameRef.current = callFrame
      await callFrame.join({ url: parsed.data.dailyRoomUrl, token: parsed.data.meetingToken })
    }

    void join()

    return () => {
      cancelled = true
      callFrameRef.current?.destroy()
      callFrameRef.current = null
    }
  }, [slug])

  if (error) {
    return (
      <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-4 text-center">
        <p className="text-red-600">{error}</p>
      </main>
    )
  }

  return <div ref={containerRef} className="h-screen w-screen" />
}
