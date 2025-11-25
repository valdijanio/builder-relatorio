import { v4 as uuidv4 } from 'uuid'
import type {
  ReportElement,
  ElementType,
  TextElement,
  NumberElement,
  ListElement,
  ChartElement,
  defaultTextElement,
  defaultNumberElement,
  defaultListElement,
  defaultChartElement,
} from '~/types/report'
import type { CanvasState, HistoryEntry } from '~/types/elements'

// Default element factories
const createDefaultElement = (type: ElementType, position: { x: number; y: number }): ReportElement => {
  const id = uuidv4()

  switch (type) {
    case 'text':
      return {
        id,
        type: 'text',
        position,
        size: { width: 150, height: 30 },
        style: {},
        properties: {
          content: 'Label Text',
          fontFamily: 'Inter',
          fontSize: 14,
          fontWeight: 'normal',
          fontStyle: 'normal',
          textAlign: 'left',
          color: '#1f2937',
        },
      } as TextElement

    case 'number':
      return {
        id,
        type: 'number',
        position,
        size: { width: 100, height: 30 },
        style: {},
        properties: {
          format: '#,##0.00',
          decimalPlaces: 2,
          thousandsSeparator: '.',
          decimalSeparator: ',',
          fontFamily: 'Inter',
          fontSize: 14,
          fontWeight: 'normal',
          color: '#1f2937',
          textAlign: 'right',
        },
      } as NumberElement

    case 'list':
      return {
        id,
        type: 'list',
        position,
        size: { width: 400, height: 200 },
        style: {},
        properties: {
          columns: [],
          showHeader: true,
          headerStyle: {
            backgroundColor: '#f3f4f6',
            color: '#1f2937',
            fontWeight: 'bold',
            fontSize: 12,
          },
          rowStyle: {
            backgroundColor: '#ffffff',
            alternateBackgroundColor: '#f9fafb',
            color: '#374151',
            fontSize: 12,
          },
          borderStyle: 'horizontal',
          borderColor: '#e5e7eb',
        },
        dataSource: {
          sqlQuery: 'SELECT * FROM tabela LIMIT 10',
        },
      } as ListElement

    case 'chart':
      return {
        id,
        type: 'chart',
        position,
        size: { width: 350, height: 250 },
        style: {},
        properties: {
          chartType: 'bar',
          showLegend: true,
          legendPosition: 'bottom',
          colors: ['#d97706', '#3b82f6', '#10b981', '#ef4444', '#8b5cf6'],
          animation: true,
        },
        dataSource: {
          sqlQuery: 'SELECT categoria, SUM(valor) as total FROM tabela GROUP BY categoria',
          labelField: 'categoria',
          valueFields: ['total'],
        },
      } as ChartElement

    default:
      throw new Error(`Unknown element type: ${type}`)
  }
}

export const useCanvas = () => {
  // State
  const elements = useState<ReportElement[]>('canvas-elements', () => [])
  const selectedElementId = useState<string | null>('canvas-selected', () => null)
  const zoom = useState<number>('canvas-zoom', () => 100)
  const gridSize = useState<number>('canvas-grid', () => 10)
  const showGrid = useState<boolean>('canvas-show-grid', () => true)
  const snapToGrid = useState<boolean>('canvas-snap', () => true)

  // History for undo/redo
  const history = useState<HistoryEntry[]>('canvas-history', () => [])
  const historyIndex = useState<number>('canvas-history-index', () => -1)
  const maxHistory = 50

  // Computed
  const selectedElement = computed(() => {
    if (!selectedElementId.value) return null
    return elements.value.find(el => el.id === selectedElementId.value) || null
  })

  const canUndo = computed(() => historyIndex.value > 0)
  const canRedo = computed(() => historyIndex.value < history.value.length - 1)

  // Methods
  const saveToHistory = () => {
    const entry: HistoryEntry = {
      elements: JSON.parse(JSON.stringify(elements.value)),
      timestamp: Date.now(),
    }

    // Remove future entries if we're not at the end
    if (historyIndex.value < history.value.length - 1) {
      history.value = history.value.slice(0, historyIndex.value + 1)
    }

    history.value.push(entry)

    // Limit history size
    if (history.value.length > maxHistory) {
      history.value.shift()
    } else {
      historyIndex.value++
    }
  }

  const undo = () => {
    if (!canUndo.value) return
    historyIndex.value--
    elements.value = JSON.parse(JSON.stringify(history.value[historyIndex.value].elements))
  }

  const redo = () => {
    if (!canRedo.value) return
    historyIndex.value++
    elements.value = JSON.parse(JSON.stringify(history.value[historyIndex.value].elements))
  }

  const addElement = (type: ElementType, position: { x: number; y: number }) => {
    const snappedPosition = snapToGrid.value
      ? {
          x: Math.round(position.x / gridSize.value) * gridSize.value,
          y: Math.round(position.y / gridSize.value) * gridSize.value,
        }
      : position

    const element = createDefaultElement(type, snappedPosition)
    elements.value.push(element)
    selectedElementId.value = element.id
    saveToHistory()
    return element
  }

  const updateElement = (id: string, updates: Partial<ReportElement>) => {
    const index = elements.value.findIndex(el => el.id === id)
    if (index !== -1) {
      elements.value[index] = { ...elements.value[index], ...updates } as ReportElement
      saveToHistory()
    }
  }

  const updateElementPosition = (id: string, position: { x: number; y: number }) => {
    const snappedPosition = snapToGrid.value
      ? {
          x: Math.round(position.x / gridSize.value) * gridSize.value,
          y: Math.round(position.y / gridSize.value) * gridSize.value,
        }
      : position

    updateElement(id, { position: snappedPosition })
  }

  const updateElementSize = (id: string, size: { width: number; height: number }) => {
    const snappedSize = snapToGrid.value
      ? {
          width: Math.round(size.width / gridSize.value) * gridSize.value,
          height: Math.round(size.height / gridSize.value) * gridSize.value,
        }
      : size

    updateElement(id, { size: snappedSize })
  }

  const deleteElement = (id: string) => {
    elements.value = elements.value.filter(el => el.id !== id)
    if (selectedElementId.value === id) {
      selectedElementId.value = null
    }
    saveToHistory()
  }

  const selectElement = (id: string | null) => {
    selectedElementId.value = id
  }

  const clearSelection = () => {
    selectedElementId.value = null
  }

  const duplicateElement = (id: string) => {
    const element = elements.value.find(el => el.id === id)
    if (!element) return

    const newElement = {
      ...JSON.parse(JSON.stringify(element)),
      id: uuidv4(),
      position: {
        x: element.position.x + 20,
        y: element.position.y + 20,
      },
    }

    elements.value.push(newElement)
    selectedElementId.value = newElement.id
    saveToHistory()
    return newElement
  }

  const clearCanvas = () => {
    elements.value = []
    selectedElementId.value = null
    saveToHistory()
  }

  const loadElements = (newElements: ReportElement[]) => {
    elements.value = newElements
    selectedElementId.value = null
    history.value = []
    historyIndex.value = -1
    saveToHistory()
  }

  // Initialize history
  if (history.value.length === 0) {
    saveToHistory()
  }

  return {
    // State
    elements,
    selectedElementId,
    selectedElement,
    zoom,
    gridSize,
    showGrid,
    snapToGrid,

    // History
    canUndo,
    canRedo,
    undo,
    redo,

    // Methods
    addElement,
    updateElement,
    updateElementPosition,
    updateElementSize,
    deleteElement,
    selectElement,
    clearSelection,
    duplicateElement,
    clearCanvas,
    loadElements,
  }
}
