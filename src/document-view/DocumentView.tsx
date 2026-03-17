import React, { useCallback, useMemo, useRef, useState } from 'react';
import { X, Upload, Loader2 } from 'lucide-react';
import { DocumentBlock } from './DocumentBlock';
import { useOrderPersistence } from '../context-display/useOrderPersistence';
import { formatValueForDisplay } from '../context-display/utils';
import type { IDocumentViewProps, DocumentExportContext } from './types';

export const DocumentView: React.FC<IDocumentViewProps> = ({
  entries,
  onClose,
  onSaveEntry,
  onExport,
  storageKey = 'rui-context-order',
  filterEntries,
  pinnedKeys,
}) => {
  const [excludedKeys, setExcludedKeys] = useState<Set<string>>(new Set());
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const documentRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const pinnedSet = useMemo(() => new Set(pinnedKeys ?? []), [pinnedKeys]);

  // Filter visible entries (same logic as ContextDisplayPanel)
  const visibleEntries = useMemo(() => {
    if (filterEntries) return filterEntries(entries);
    return entries.filter((e) => e.showInUI || pinnedSet.has(e.key));
  }, [entries, filterEntries, pinnedSet]);

  // Respect drag-and-drop order from ContextDisplayPanel
  const { sortedEntries } = useOrderPersistence(visibleEntries, storageKey);

  const handleToggleExclude = useCallback((key: string) => {
    setExcludedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  // Combined markdown of non-excluded entries
  const combinedMarkdown = useMemo(
    () =>
      sortedEntries
        .filter((e) => !excludedKeys.has(e.key))
        .map((e) => {
          const header = `## ${e.description || e.key}`;
          const priority = e.priority ? ` \`[${e.priority}]\`` : '';
          return `${header}${priority}\n\n${formatValueForDisplay(e.value)}`;
        })
        .join('\n\n---\n\n'),
    [sortedEntries, excludedKeys],
  );

  const handleExport = useCallback(
    async (format: 'pdf' | 'docx') => {
      if (!onExport) return;
      setIsExporting(true);
      setExportDropdownOpen(false);
      try {
        const ctx: DocumentExportContext = {
          element: documentRef.current,
          markdownContent: combinedMarkdown,
        };
        await onExport(format, ctx);
      } catch (err) {
        console.error('Document export failed:', err);
      } finally {
        setIsExporting(false);
      }
    },
    [onExport, combinedMarkdown],
  );

  // Close dropdown on outside click
  React.useEffect(() => {
    if (!exportDropdownOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setExportDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [exportDropdownOpen]);

  const includedCount = sortedEntries.filter((e) => !excludedKeys.has(e.key)).length;

  return (
    <div className="dv-container">
      {/* Top bar */}
      <div className="dv-topbar">
        <div className="dv-topbar__info">
          <span className="dv-topbar__count">
            {includedCount} of {sortedEntries.length} blocks
          </span>
        </div>

        <div className="dv-topbar__actions">
          {onExport && (
            <div className="dv-export" ref={dropdownRef}>
              <button
                className="dv-topbar__btn"
                onClick={() => setExportDropdownOpen((prev) => !prev)}
                disabled={isExporting}
                title="Export document"
              >
                {isExporting ? (
                  <Loader2 size={16} className="dv-spinner" />
                ) : (
                  <Upload size={16} />
                )}
                <span>Export</span>
              </button>
              {exportDropdownOpen && (
                <div className="dv-export__menu" role="menu">
                  <button
                    className="dv-export__item"
                    role="menuitem"
                    onClick={() => handleExport('pdf')}
                  >
                    Export as PDF
                  </button>
                  <button
                    className="dv-export__item"
                    role="menuitem"
                    onClick={() => handleExport('docx')}
                  >
                    Export as DOCX
                  </button>
                </div>
              )}
            </div>
          )}
          <button className="dv-topbar__btn dv-topbar__btn--close" onClick={onClose} title="Exit document mode">
            <X size={16} />
            <span>Exit</span>
          </button>
        </div>
      </div>

      {/* Document body — centered, Word-like */}
      <div className="dv-scroll">
        <div className="dv-document" ref={documentRef}>
          {sortedEntries.map((entry, index) => (
            <React.Fragment key={entry.key}>
              <DocumentBlock
                entry={entry}
                isExcluded={excludedKeys.has(entry.key)}
                onToggleExclude={handleToggleExclude}
                onSaveEntry={onSaveEntry}
              />
              {/* Faint separator between blocks (not after last) */}
              {index < sortedEntries.length - 1 && (
                <hr className="dv-separator" />
              )}
            </React.Fragment>
          ))}

          {sortedEntries.length === 0 && (
            <div className="dv-empty">
              <p>No context entries to display.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
