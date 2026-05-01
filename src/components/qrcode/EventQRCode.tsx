'use client'

import { useEffect, useState, useRef } from 'react'
import QRCode from 'qrcode'
import { Download, Copy, Share2 } from 'lucide-react'

interface EventQRCodeProps {
  eventCode: string
  eventTitle?: string
}

export function EventQRCode({ eventCode, eventTitle }: EventQRCodeProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>('')
  const [copied, setCopied] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const joinUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/room/${eventCode}`

  useEffect(() => {
    async function generateQR() {
      try {
        const dataUrl = await QRCode.toDataURL(joinUrl, {
          errorCorrectionLevel: 'H',
          type: 'image/png',
          width: 300,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF',
          },
        })
        setQrDataUrl(dataUrl)
      } catch (err) {
        console.error('Failed to generate QR code:', err)
      }
    }

    generateQR()
  }, [joinUrl])

  const handleDownload = () => {
    if (!qrDataUrl) return

    const link = document.createElement('a')
    link.href = qrDataUrl
    link.download = `${eventCode}-qr-code.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(joinUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: eventTitle || 'Join Event',
          text: `Join this event: ${eventTitle || eventCode}`,
          url: joinUrl,
        })
      } catch (err) {
        console.error('Share failed:', err)
      }
    }
  }

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200">
      <h3 className="font-semibold text-gray-900 mb-4">Event QR Code</h3>

      {qrDataUrl && (
        <div className="flex flex-col items-center gap-4">
          {/* QR Code */}
          <div className="p-4 bg-white border-2 border-gray-200 rounded-lg">
            <img src={qrDataUrl} alt="Event QR Code" className="w-64 h-64" />
          </div>

          {/* Join URL */}
          <div className="w-full">
            <p className="text-sm text-gray-600 mb-2">Or visit directly:</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={joinUrl}
                readOnly
                className="flex-1 px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-600 font-mono"
              />
              <button
                onClick={handleCopyUrl}
                className="px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                title="Copy URL"
              >
                <Copy size={18} />
              </button>
            </div>
            {copied && <p className="text-xs text-green-600 mt-1">Copied!</p>}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 w-full">
            <button
              onClick={handleDownload}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              <Download size={16} />
              Download QR
            </button>
            {typeof navigator !== 'undefined' && typeof navigator.share === 'function' && (
              <button
                onClick={handleShare}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
              >
                <Share2 size={16} />
                Share
              </button>
            )}
          </div>

          {/* Instructions */}
          <div className="w-full mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs text-gray-600">
              <strong>Tip:</strong> Display this QR code on your screen or printed materials. Attendees can scan with their phones to instantly join the event.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
