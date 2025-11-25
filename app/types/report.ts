// Report Layout Types

export interface ReportLayout {
  version: string
  pageSettings: PageSettings
  bands: Band[]
}

export interface PageSettings {
  width: number // mm
  height: number // mm
  orientation: 'portrait' | 'landscape'
  margins: {
    top: number
    right: number
    bottom: number
    left: number
  }
  backgroundColor: string
}

export interface Band {
  id: string
  type: 'page-header' | 'detail' | 'page-footer'
  height: number
  elements: ReportElement[]
}

export type ElementType = 'text' | 'number' | 'list' | 'chart'

export interface BaseElement {
  id: string
  type: ElementType
  position: {
    x: number
    y: number
  }
  size: {
    width: number
    height: number
  }
  style: ElementStyle
}

export interface ElementStyle {
  backgroundColor?: string
  borderWidth?: number
  borderColor?: string
  borderStyle?: 'solid' | 'dashed' | 'dotted' | 'none'
  borderRadius?: number
  padding?: number
  opacity?: number
}

// Text Element
export interface TextElement extends BaseElement {
  type: 'text'
  properties: {
    content: string
    fontFamily: string
    fontSize: number
    fontWeight: 'normal' | 'bold'
    fontStyle: 'normal' | 'italic'
    textAlign: 'left' | 'center' | 'right' | 'justify'
    color: string
    lineHeight?: number
  }
  dataBinding?: {
    enabled: boolean
    field?: string
  }
}

// Number Element
export interface NumberElement extends BaseElement {
  type: 'number'
  properties: {
    value?: number
    format: string
    decimalPlaces: number
    thousandsSeparator: string
    decimalSeparator: string
    prefix?: string
    suffix?: string
    fontFamily: string
    fontSize: number
    fontWeight: 'normal' | 'bold'
    color: string
    textAlign: 'left' | 'center' | 'right'
  }
  dataSource?: {
    sqlQuery: string
    field: string
    aggregation?: 'sum' | 'avg' | 'count' | 'min' | 'max'
  }
}

// List/Table Element
export interface ListElement extends BaseElement {
  type: 'list'
  properties: {
    columns: TableColumn[]
    showHeader: boolean
    headerStyle: {
      backgroundColor: string
      color: string
      fontWeight: 'normal' | 'bold'
      fontSize: number
    }
    rowStyle: {
      backgroundColor: string
      alternateBackgroundColor?: string
      color: string
      fontSize: number
    }
    borderStyle: 'none' | 'horizontal' | 'vertical' | 'full'
    borderColor: string
  }
  dataSource: {
    sqlQuery: string
    parameters?: QueryParameter[]
    orderBy?: string
    limit?: number
  }
}

export interface TableColumn {
  id: string
  field: string
  header: string
  width: number | 'auto'
  align: 'left' | 'center' | 'right'
  format?: string
  visible: boolean
}

// Chart Element
export interface ChartElement extends BaseElement {
  type: 'chart'
  properties: {
    chartType: 'bar' | 'line' | 'pie' | 'doughnut' | 'area'
    title?: string
    showLegend: boolean
    legendPosition: 'top' | 'bottom' | 'left' | 'right'
    colors: string[]
    xAxis?: {
      label?: string
      field: string
    }
    yAxis?: {
      label?: string
      field: string
    }
    animation: boolean
  }
  dataSource: {
    sqlQuery: string
    labelField: string
    valueFields: string[]
    parameters?: QueryParameter[]
  }
}

export interface QueryParameter {
  name: string
  type: 'string' | 'number' | 'date' | 'boolean'
  defaultValue?: unknown
  required: boolean
}

export type ReportElement = TextElement | NumberElement | ListElement | ChartElement

// Default values for new elements
export const defaultTextElement: Omit<TextElement, 'id' | 'position'> = {
  type: 'text',
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
}

export const defaultNumberElement: Omit<NumberElement, 'id' | 'position'> = {
  type: 'number',
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
}

export const defaultListElement: Omit<ListElement, 'id' | 'position'> = {
  type: 'list',
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
}

export const defaultChartElement: Omit<ChartElement, 'id' | 'position'> = {
  type: 'chart',
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
}

// Toolbox items configuration
export interface ToolboxItem {
  type: ElementType
  label: string
  icon: string
  description: string
}

export const toolboxItems: ToolboxItem[] = [
  { type: 'text', label: 'Text Label', icon: 'T', description: 'Static text display' },
  { type: 'number', label: 'Number Field', icon: '#', description: 'Numeric value with formatting' },
  { type: 'list', label: 'Data Table', icon: '☰', description: 'Table with SQL data source' },
  { type: 'chart', label: 'Chart', icon: '📊', description: 'Visual chart from SQL data' },
]
