import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
  className?: string
}

export function MockDataWrapper({ children, className }: Props) {
  return (
    <div className={`relative${className ? ` ${className}` : ''}`}>
      {children}
      <span className="group/mock absolute top-1.5 right-1.5 z-10 cursor-default">
        <span className="block px-1.5 py-0.5 bg-amber-50 text-amber-500 text-[9px] font-bold tracking-wider uppercase rounded border border-amber-200 leading-none select-none">
          mock
        </span>
        <span className="absolute bottom-full right-0 mb-1 px-2 py-1 bg-gray-800/90 text-white text-[11px] font-normal rounded whitespace-nowrap opacity-0 group-hover/mock:opacity-100 transition-opacity duration-150 pointer-events-none">
          mock-data
        </span>
      </span>
    </div>
  )
}
