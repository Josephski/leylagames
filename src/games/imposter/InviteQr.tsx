'use client'

import { useEffect, useState } from 'react'
import QRCode from 'qrcode'

export function InviteQr({ url, alt }: { url: string; alt: string }) {
  const [src, setSrc] = useState('')

  useEffect(() => {
    if (!url) return
    let active = true
    void QRCode.toDataURL(url, {
      width: 360,
      margin: 1,
      color: { dark: '#0f172a', light: '#ffffff' },
    }).then((dataUrl) => {
      if (active) setSrc(dataUrl)
    })
    return () => {
      active = false
    }
  }, [url])

  if (!src) return <div className="imposter-qr imposter-qr-pending" aria-hidden="true" />

  return <img className="imposter-qr" src={src} alt={alt} />
}
