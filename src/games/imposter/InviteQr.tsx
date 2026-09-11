'use client'

import { useEffect, useRef } from 'react'
import QRCode from 'qrcode'

export function InviteQr({ url, alt }: { url: string; alt: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!url || !canvas) return
    void QRCode.toCanvas(canvas, url, {
      width: 240,
      margin: 1,
      errorCorrectionLevel: 'M',
      color: { dark: '#0f172a', light: '#ffffff' },
    }).catch(() => undefined)
  }, [url])

  if (!url) return <div className="imposter-qr imposter-qr-pending" aria-hidden="true" />

  return <canvas ref={canvasRef} className="imposter-qr" role="img" aria-label={alt} />
}
