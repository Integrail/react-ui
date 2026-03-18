import type { InContextEntry } from '@everworker/oneringai';

/** Sections to persist when saving a document */
export interface SaveDocumentInput {
  title: string;
  description?: string;
  sections: Array<{
    key: string;
    value: string;
    description?: string;
    sortOrder: number;
  }>;
}

/** Metadata prefilled by LLM (optional) */
export interface PrefillMetadata {
  title: string;
  description?: string;
}

export interface IDocumentViewProps {
  /** All context entries (will be filtered/ordered internally) */
  entries: InContextEntry[];
  /** Called when user closes document mode */
  onClose: () => void;
  /** Called when user saves an edited block */
  onSaveEntry?: (key: string, newValue: string) => Promise<void>;
  /** Called when user exports the document */
  onExport?: (format: 'pdf' | 'docx', ctx: DocumentExportContext) => Promise<void>;
  /** localStorage key for order persistence (shared with ContextDisplayPanel) */
  storageKey?: string;
  /** Custom filter (same as ContextDisplayPanel) */
  filterEntries?: (entries: InContextEntry[]) => InContextEntry[];
  /** Currently pinned entry keys */
  pinnedKeys?: string[];
  /** If true, hides the Edit and Exit buttons (view-only mode) */
  readOnly?: boolean;

  // ─── Document persistence callbacks ────────────────────────────────────
  /** Called when user saves the current entries as a persistent document. App provides storage logic. */
  onSaveDocument?: (input: SaveDocumentInput) => Promise<void>;
  /** Called when user wants to load a saved document. App returns sections to populate. */
  onLoadDocument?: () => Promise<Array<{ key: string; value: string; description?: string; sortOrder: number }> | null>;
  /** Optional LLM-powered prefill for title/description. Called with current sections. */
  onPrefillMetadata?: (sections: SaveDocumentInput['sections']) => Promise<PrefillMetadata>;
}

export interface DocumentExportContext {
  /** DOM element containing the full document (for screenshot/capture) */
  element: HTMLElement | null;
  /** Combined markdown content of all visible (non-excluded) entries */
  markdownContent: string;
}

export interface IDocumentBlockProps {
  entry: InContextEntry;
  /** Whether this block is excluded from the document */
  isExcluded: boolean;
  /** Toggle exclude state */
  onToggleExclude: (key: string) => void;
  /** Called when user saves edited content */
  onSaveEntry?: (key: string, newValue: string) => Promise<void>;
  /** If true, hides the Edit button (view-only mode) */
  readOnly?: boolean;
}
