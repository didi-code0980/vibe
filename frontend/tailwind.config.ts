import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        teal: {
          DEFAULT: '#287393',
          dark: '#1e6280',
          light: 'rgba(40,115,147,0.1)',
        },
        navy: {
          DEFAULT: '#033246',
          light: 'rgba(3,50,70,0.08)',
        },
        accent: '#1ea8cc',
        warm: '#D3D4CE',
        fog: '#F6F6F6',
        ink: '#0d1a20',
        ink2: '#2a3d47',
        muted: '#6b7e87',
        faint: '#e8eced',
        success: '#2a8a5c',
        warning: '#c7892a',
        danger: '#c44b3a',
      },
      borderRadius: {
        card: '14px',
        btn: '8px',
        chip: '20px',
      },
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}

export default config
