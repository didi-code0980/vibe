'use client'

import { useRef, useState, type ChangeEvent } from 'react'
import { useUploadAvatar } from '@/features/profile/hooks/useProfile'

const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE = 2 * 1024 * 1024

interface Props {
  initials: string
  currentAvatarUrl?: string | null
}

export function AvatarUploader({ initials, currentAvatarUrl }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const upload = useUploadAvatar()
  const [error, setError] = useState<string | null>(null)

  function handlePick() {
    inputRef.current?.click()
  }

  async function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setError(null)
    if (!ACCEPTED.includes(file.type)) {
      setError('Only JPG, PNG, or WEBP files are allowed.')
      return
    }
    if (file.size > MAX_SIZE) {
      setError('File must be 2 MB or smaller.')
      return
    }
    try {
      await upload.mutateAsync(file)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    }
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={handlePick}
        disabled={upload.isPending}
        aria-label="Upload new avatar"
        className="w-[72px] h-[72px] rounded-full bg-teal-dark flex items-center justify-center text-white text-2xl font-semibold overflow-hidden border border-faint hover:opacity-90 transition disabled:opacity-60"
      >
        {currentAvatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={currentAvatarUrl} alt="Avatar" className="w-full h-full object-cover" />
        ) : (
          initials
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED.join(',')}
        onChange={handleFile}
        hidden
        data-testid="avatar-file-input"
      />
      {upload.isPending && <p className="text-[11px] text-muted">Uploading…</p>}
      {error && <p className="text-[11px] text-danger">{error}</p>}
    </div>
  )
}