'use client'

import { useState } from 'react'

interface StarRatingProps {
  defaultValue?: number
  onChange?: (value: number) => void
}

export function StarRating({ defaultValue = 0, onChange }: StarRatingProps) {
  const [value, setValue] = useState(defaultValue)
  const [hover, setHover] = useState(0)

  const handleClick = (v: number) => {
    setValue(v)
    onChange?.(v)
  }

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={`text-[18px] transition-transform hover:scale-110 ${
            star <= (hover || value) ? 'text-warning' : 'text-faint'
          }`}
          onClick={() => handleClick(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
        >
          ★
        </button>
      ))}
    </div>
  )
}
