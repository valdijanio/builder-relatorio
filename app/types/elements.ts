// Canvas state types

export interface CanvasState {
  elements: import('./report').ReportElement[]
  selectedElementId: string | null
  zoom: number
  gridSize: number
  showGrid: boolean
  snapToGrid: boolean
}

export interface DragState {
  isDragging: boolean
  draggedElement: import('./report').ReportElement | null
  dragOffset: { x: number; y: number }
}

export interface ResizeState {
  isResizing: boolean
  resizeHandle: ResizeHandle | null
  initialSize: { width: number; height: number }
  initialPosition: { x: number; y: number }
}

export type ResizeHandle =
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right'
  | 'top'
  | 'bottom'
  | 'left'
  | 'right'

export interface HistoryEntry {
  elements: import('./report').ReportElement[]
  timestamp: number
}

// API response types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

export interface QueryResult {
  columns: string[]
  rows: Record<string, unknown>[]
  rowCount: number
  executionTimeMs: number
}

export interface User {
  id: number
  email: string
  name: string
  role: 'admin' | 'editor' | 'viewer'
}

export interface Report {
  id: number
  userId: number
  title: string
  description?: string
  layout: import('./report').ReportLayout
  settings?: Record<string, unknown>
  isPublished: boolean
  createdAt: string
  updatedAt: string
}
