# @everworker/react-ui

Shared React UI components for OneRingAI agent apps.

## Installation

```bash
npm install @everworker/react-ui
```

### Peer Dependencies

The following peer dependencies are **required**:

- `react` >= 18.0.0
- `react-dom` >= 18.0.0
- `react-markdown` >= 9.0.0
- `remark-gfm` >= 4.0.0
- `remark-math` >= 6.0.0
- `rehype-katex` >= 7.0.0
- `katex` >= 0.16.0
- `react-syntax-highlighter` >= 16.0.0
- `lucide-react` >= 0.300.0

**Optional** (for export and visualization features):

- `html2canvas` >= 1.4.0
- `jspdf` >= 2.5.0
- `docx` >= 9.0.0
- `mermaid`, `react-vega`, `vega-lite`, `markmap-lib`, `markmap-view`

## Usage

### Importing Components

```tsx
import { DocumentView, MarkdownRenderer, ChatMessage } from '@everworker/react-ui';
```

### Importing Styles

Import the CSS for each module you use:

```tsx
import '@everworker/react-ui/styles';                // Look Inside panel
import '@everworker/react-ui/styles/markdown';        // Markdown rendering
import '@everworker/react-ui/styles/chat';            // Chat components
import '@everworker/react-ui/styles/thinking';        // Thinking block
import '@everworker/react-ui/styles/context-display'; // Context Display panel
import '@everworker/react-ui/styles/document-view';   // Document View
```

### Importing Plugins

Plugins are exported separately to avoid pulling `@everworker/oneringai` into browser bundles:

```tsx
import { DynamicUIPlugin } from '@everworker/react-ui/plugins';
```

## Components

### Look Inside

Components for inspecting agent internals and execution state.

### Markdown Renderer

Rich markdown rendering with support for GFM, math (KaTeX), syntax highlighting, and optional Mermaid diagrams.

### Chat

Chat UI components for agent conversation interfaces.

### Context Display

`ContextDisplayPanel` shows context entries (with `showInUI: true`) as draggable, editable cards. Supports pinning, ordering, and entering Document Mode.

### Document View

A Word-like, centered document view for reading and editing context entries. Accessed via the "Document" button in the Context Display panel.

```tsx
<DocumentView
  entries={entries}
  onClose={() => setDocMode(false)}
  onSaveEntry={handleSave}
  onExport={handleExport}
  storageKey="my-context-order"
  pinnedKeys={['key1', 'key2']}
  readOnly={false}
/>
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `entries` | `InContextEntry[]` | *required* | All context entries (filtered/ordered internally) |
| `onClose` | `() => void` | *required* | Called when the user exits document mode |
| `onSaveEntry` | `(key: string, newValue: string) => Promise<void>` | — | Called when the user saves an edited block |
| `onExport` | `(format: 'pdf' \| 'docx', ctx: DocumentExportContext) => Promise<void>` | — | Called when the user exports the document |
| `storageKey` | `string` | `'rui-context-order'` | localStorage key for drag-and-drop order persistence |
| `filterEntries` | `(entries: InContextEntry[]) => InContextEntry[]` | — | Custom filter for which entries to display |
| `pinnedKeys` | `string[]` | — | Keys of entries that should always be visible |
| `readOnly` | `boolean` | `false` | When `true`, hides the Edit and Exit buttons for a view-only experience |

### Export Services

PDF and DOCX export utilities used by Document View. Requires the optional `html2canvas`, `jspdf`, and `docx` peer dependencies.

## Development

```bash
npm run dev        # Watch mode
npm run build      # Production build
npm run typecheck  # Type checking
```
