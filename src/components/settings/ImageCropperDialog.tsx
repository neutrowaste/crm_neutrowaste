import { useState, useRef, useEffect, useCallback } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

export function ImageCropperDialog({
  file,
  open,
  onOpenChange,
  onCrop,
}: {
  file: File | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onCrop: (file: File) => void
}) {
  const [imageSrc, setImageSrc] = useState<string>('')
  const [zoom, setZoom] = useState(1)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imageRef = useRef<HTMLImageElement | null>(null)

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    const img = imageRef.current
    if (!canvas || !img) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const size = Math.min(img.width, img.height)
    const sourceX = (img.width - size) / 2
    const sourceY = (img.height - size) / 2

    const sWidth = size / zoom
    const sHeight = size / zoom
    const sx = sourceX + (size - sWidth) / 2
    const sy = sourceY + (size - sHeight) / 2

    ctx.drawImage(
      img,
      sx,
      sy,
      sWidth,
      sHeight,
      0,
      0,
      canvas.width,
      canvas.height,
    )
  }, [zoom])

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file)
      setImageSrc(url)
      setZoom(1)
      return () => URL.revokeObjectURL(url)
    }
  }, [file])

  useEffect(() => {
    if (!imageSrc) return
    const img = new Image()
    img.onload = () => {
      imageRef.current = img
      draw()
    }
    img.src = imageSrc
  }, [imageSrc]) // intentionally not depending on draw to avoid reload loop

  useEffect(() => {
    if (open) {
      draw()
      const timer = setTimeout(draw, 100)
      return () => clearTimeout(timer)
    }
  }, [open, draw])

  const handleConfirm = () => {
    if (!canvasRef.current || !file) return
    canvasRef.current.toBlob((blob) => {
      if (blob) {
        const croppedFile = new File([blob], file.name, { type: file.type })
        onCrop(croppedFile)
      }
    }, file.type)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ajustar Foto de Perfil</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-4">
          <canvas
            ref={canvasRef}
            width={256}
            height={256}
            className="border rounded-full bg-muted shadow-sm w-48 h-48 object-cover"
          />
          <div className="w-full space-y-2 mt-4">
            <Label>Zoom</Label>
            <input
              type="range"
              min="1"
              max="3"
              step="0.1"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="w-full h-2 bg-secondary rounded-lg cursor-pointer"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm}>Confirmar e Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
