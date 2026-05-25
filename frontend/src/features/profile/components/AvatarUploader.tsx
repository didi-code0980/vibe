'use client'

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from 'react'
import { Camera, Trash2, X, Loader2 } from 'lucide-react'
import { useRemoveAvatar, useUploadAvatar } from '@/features/profile/hooks/useProfile'
import { toast } from '@/components/feedback/Toaster'
import { cn } from '@/lib/utils'

const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE = 2 * 1024 * 1024

interface Props {
  initials: string
  currentAvatarUrl?: string | null
  /** Avatar circle size in pixels. Defaults to 72. */
  size?: number
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function validateFile(file: File): string | null {
  if (!ACCEPTED.includes(file.type)) return 'Only JPG, PNG, or WebP allowed.'
  if (file.size > MAX_SIZE) return 'Image must be 2 MB or smaller.'
  return null
}

export function AvatarUploader({ initials, currentAvatarUrl, size = 72 }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const upload = useUploadAvatar()
  const remove = useRemoveAvatar()

  const [pickedFile, setPickedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [dragOver, setDragOver] = useState(false)
  const abortRef = useRef<AbortController | null>(null)
  // dragenter/dragleave fire for every child element, so a single boolean
  // flickers as the cursor moves over the overlay's icon/text. Counting
  // enter/leave events is the standard workaround.
  const dragDepthRef = useRef(0)

  // Revoke the object URL when the preview changes or the component unmounts.
  useEffect(() => {
    if (!previewUrl) return
    return () => {
      URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const pickFile = useCallback((file: File) => {
    const v = validateFile(file)
    if (v) {
      toast.error(v)
      setError(v)
      return
    }
    setError(null)
    setProgress(0)
    setPickedFile(file)
    setPreviewUrl(URL.createObjectURL(file))
  }, [])

  const openPicker = useCallback(() => {
    inputRef.current?.click()
  }, [])

  const onInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      e.target.value = ''
      if (file) pickFile(file)
    },
    [pickFile],
  )

  const onDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      dragDepthRef.current = 0
      setDragOver(false)
      const file = e.dataTransfer.files?.[0]
      if (file) pickFile(file)
    },
    [pickFile],
  )

  const onDragEnter = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    dragDepthRef.current += 1
    if (dragDepthRef.current === 1) setDragOver(true)
  }, [])

  const onDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    // Required for onDrop to fire.
    e.preventDefault()
  }, [])

  const onDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    dragDepthRef.current = Math.max(0, dragDepthRef.current - 1)
    if (dragDepthRef.current === 0) setDragOver(false)
  }, [])

  const closeModal = useCallback(() => {
    if (upload.isPending) return // explicit Cancel handles abort during upload
    setPickedFile(null)
    setPreviewUrl(null)
    setError(null)
    setProgress(0)
  }, [upload.isPending])

  const cancelUpload = useCallback(() => {
    if (upload.isPending && abortRef.current) {
      abortRef.current.abort()
      return
    }
    setPickedFile(null)
    setPreviewUrl(null)
    setError(null)
    setProgress(0)
  }, [upload.isPending])

  const confirmUpload = useCallback(async () => {
    if (!pickedFile) return
    setError(null)
    setProgress(0)
    const controller = new AbortController()
    abortRef.current = controller
    try {
      await upload.mutateAsync({
        file: pickedFile,
        signal: controller.signal,
        onProgress: (loaded, total) => {
          setProgress(total > 0 ? Math.round((loaded / total) * 100) : 0)
        },
      })
      toast.success('Avatar updated.')
      setPickedFile(null)
      setPreviewUrl(null)
      setProgress(0)
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        setProgress(0)
        return
      }
      const msg = err instanceof Error ? err.message : 'Upload failed.'
      setError(msg)
      toast.error(msg)
      setProgress(0)
    } finally {
      abortRef.current = null
    }
  }, [pickedFile, upload])

  async function removeAvatar() {
    setError(null)
    try {
      await remove.mutateAsync()
      toast.success('Avatar removed.')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Could not remove avatar.'
      toast.error(msg)
    }
  }

  const px = `${size}px`

  return (
    <>
      <div
        className="relative inline-block"
        onDragEnter={onDragEnter}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <button
          type="button"
          onClick={openPicker}
          aria-label="Change photo"
          className={cn(
            'group relative rounded-full bg-teal-dark flex items-center justify-center text-white text-2xl font-semibold overflow-hidden border border-faint transition-shadow',
            dragOver && 'ring-2 ring-teal ring-offset-2',
          )}
          style={{ width: px, height: px }}
        >
          {currentAvatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={currentAvatarUrl}
              alt="Current avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            <span>{initials}</span>
          )}

          {/* Hover overlay */}
          <div
            className={cn(
              'absolute inset-0 flex flex-col items-center justify-center gap-0.5 bg-black/55 text-white text-[10.5px] font-medium transition-opacity',
              'opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100',
              dragOver && 'opacity-100',
            )}
          >
            <Camera size={16} aria-hidden="true" />
            <span>{dragOver ? 'Drop photo' : 'Change photo'}</span>
          </div>
        </button>

        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED.join(',')}
          onChange={onInputChange}
          hidden
          data-testid="avatar-file-input"
        />
      </div>

      {currentAvatarUrl && !pickedFile && (
        <button
          type="button"
          onClick={removeAvatar}
          disabled={remove.isPending}
          className="mt-2 inline-flex items-center gap-1 text-[11.5px] text-muted hover:text-danger transition-colors disabled:opacity-60"
        >
          {remove.isPending ? (
            <Loader2 size={11} className="animate-spin" aria-hidden="true" />
          ) : (
            <Trash2 size={11} aria-hidden="true" />
          )}
          Remove photo
        </button>
      )}

      {error && !pickedFile && (
        <p role="alert" className="mt-1 text-[11px] text-danger">
          {error}
        </p>
      )}

      {pickedFile && previewUrl && (
        <PreviewModal
          file={pickedFile}
          previewUrl={previewUrl}
          progress={progress}
          uploading={upload.isPending}
          error={error}
          onCancel={cancelUpload}
          onConfirm={confirmUpload}
          onClose={closeModal}
        />
      )}
    </>
  )
}

interface PreviewModalProps {
  file: File
  previewUrl: string
  progress: number
  uploading: boolean
  error: string | null
  onCancel: () => void
  onConfirm: () => void
  onClose: () => void
}

function PreviewModal({
  file,
  previewUrl,
  progress,
  uploading,
  error,
  onCancel,
  onConfirm,
  onClose,
}: PreviewModalProps) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && !uploading) onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose, uploading])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Avatar preview"
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/40 px-4"
      onClick={(e) => {
        if (e.target === e.currentTarget && !uploading) onClose()
      }}
    >
      <div className="w-full max-w-[360px] bg-white rounded-card shadow-lg border border-faint">
        <header className="flex items-center justify-between px-4 py-3 border-b border-faint">
          <h3 className="text-[14px] font-semibold text-ink">Preview avatar</h3>
          <button
            type="button"
            onClick={onClose}
            disabled={uploading}
            aria-label="Close"
            className="text-muted hover:text-ink transition-colors disabled:opacity-60"
          >
            <X size={16} />
          </button>
        </header>

        <div className="px-4 py-5 flex flex-col items-center gap-3">
          <div className="w-[160px] h-[160px] rounded-full overflow-hidden border border-faint bg-fog">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewUrl} alt="Avatar preview" className="w-full h-full object-cover" />
          </div>
          <p className="text-[12px] text-muted text-center truncate max-w-full" title={file.name}>
            {file.name} · {formatBytes(file.size)}
          </p>

          {(uploading || progress > 0) && (
            <div className="w-full" aria-label="Upload progress">
              <div className="h-1.5 w-full bg-fog rounded-full overflow-hidden">
                <div
                  className="h-full bg-teal transition-[width] duration-150 ease-linear"
                  style={{ width: `${progress}%` }}
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={progress}
                />
              </div>
              <p className="mt-1 text-[11px] text-muted text-center">
                {uploading ? `Uploading… ${progress}%` : `${progress}%`}
              </p>
            </div>
          )}

          {error && (
            <p role="alert" className="text-[12px] text-danger text-center">
              {error}
            </p>
          )}
        </div>

        <footer className="px-4 py-3 border-t border-faint flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 rounded-btn border border-faint text-[13px] text-ink2 hover:bg-fog transition-colors"
          >
            {uploading ? 'Cancel upload' : 'Cancel'}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={uploading}
            aria-busy={uploading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-btn bg-teal text-white text-[13px] font-medium hover:bg-teal-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {uploading && <Loader2 size={13} className="animate-spin" aria-hidden="true" />}
            <span>{uploading ? 'Uploading…' : 'Upload'}</span>
          </button>
        </footer>
      </div>
    </div>
  )
}
