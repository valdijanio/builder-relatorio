import type { Config } from 'tailwindcss'

export default {
  content: [
    './components/**/*.{js,vue,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
    './app.vue',
    './app/**/*.vue',
  ],
  theme: {
    extend: {
      colors: {
        // Light theme - inspired by Claude.ai light mode
        surface: {
          primary: '#ffffff',
          secondary: '#f9fafb',
          tertiary: '#f3f4f6',
          hover: '#e5e7eb',
          border: '#e5e7eb',
        },
        accent: {
          DEFAULT: '#d97706', // Amber/orange
          hover: '#b45309',
          light: '#fef3c7',
        },
        text: {
          primary: '#1f2937',
          secondary: '#6b7280',
          muted: '#9ca3af',
        },
        canvas: {
          bg: '#f3f4f6',
          grid: '#e5e7eb',
        },
        status: {
          success: '#10b981',
          warning: '#f59e0b',
          error: '#ef4444',
          info: '#3b82f6',
        },
        // Toolbox sidebar (slightly darker)
        sidebar: {
          bg: '#f9fafb',
          hover: '#f3f4f6',
          active: '#e5e7eb',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'soft': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'medium': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        'canvas': '0 4px 24px rgb(0 0 0 / 0.08)',
      },
    },
  },
  plugins: [],
} satisfies Config
