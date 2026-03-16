/**
 * DynamicUIPlugin — Instruction-only plugin for Dynamic UI side-panel content.
 *
 * Teaches the LLM how to create persistent, rich-content cards in the user's
 * side panel using InContextMemory's `showInUI: true` flag.
 *
 * This plugin has NO tools, NO content, NO state — it only injects instructions
 * into the system prompt. Requires InContextMemory to be enabled.
 *
 * Lives in @everworker/react-ui because it's only useful for UI-enabled agents.
 * Apps register it manually:
 *
 * ```typescript
 * import { DynamicUIPlugin } from '@everworker/react-ui/plugins';
 * ctx.registerPlugin(new DynamicUIPlugin());
 * ```
 */

import type { IContextPluginNextGen } from '@everworker/oneringai';
import type { ToolFunction } from '@everworker/oneringai';

// Simple token estimator (~3.5 chars per token, matching BasePluginNextGen)
const estimateTokens = (text: string): number => Math.ceil(text.length / 3.5);

// ============================================================================
// Instructions
// ============================================================================

const DYNAMIC_UI_INSTRUCTIONS = `## Dynamic UI — Side Panel

You can display **persistent cards** in the user's side panel alongside the chat. These cards remain visible as the conversation continues — use them for content the user needs to reference repeatedly.

**When to use Dynamic UI (side panel) vs chat reply:**
- **Side panel**: Dashboards, live status/progress, analysis results, reference tables, generated charts/diagrams, summaries the user will refer back to
- **Chat reply**: Conversational answers, explanations, one-time information, questions

**Creating/updating a panel card:**
\`\`\`
store_set("context", "<key>", "<markdown content>", { showInUI: true, description: "<card title>", priority: "high" })
\`\`\`

**Removing a card:** \`store_delete("context", "<key>")\`

**Formatting:** Cards render the same rich markdown as chat — use freely:
- **Mermaid** diagrams (\`\`\`mermaid): flowcharts, sequence, state, ER, timeline, pie
- **Vega-Lite** charts (\`\`\`vega-lite): bar, line, scatter, area, heatmap — full JSON spec
- **Markmap** mindmaps (\`\`\`markmap): hierarchical markdown → interactive mindmap
- **LaTeX** math: inline $...$ and block $$...$$
- Tables, code blocks with syntax highlighting, lists, headers

**Best practices:**
- Use descriptive keys: \`"project_status"\`, \`"analysis_chart"\`, \`"api_endpoints"\`
- **Update** existing entries (same key) rather than creating duplicates
- Use \`priority: "high"\` or \`"critical"\` so UI cards survive context compaction
- Keep content focused and scannable — one concept per card
- Provide a clear \`description\` — it becomes the card's header/title
- Remove cards when no longer relevant: \`store_delete("context", "key")\`
- Internal state that should NOT be shown to the user: use \`showInUI: false\` (the default)`;

// ============================================================================
// Plugin Implementation
// ============================================================================

export class DynamicUIPlugin implements IContextPluginNextGen {
  readonly name = 'dynamic_ui';

  private _instructionsTokenCache: number | null = null;

  // Accept optional config for PluginRegistry factory compatibility
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(_config?: Record<string, unknown>) {}

  // --- Instructions (the only thing this plugin provides) ---

  getInstructions(): string {
    return DYNAMIC_UI_INSTRUCTIONS;
  }

  getInstructionsTokenSize(): number {
    if (this._instructionsTokenCache === null) {
      this._instructionsTokenCache = estimateTokens(DYNAMIC_UI_INSTRUCTIONS);
    }
    return this._instructionsTokenCache;
  }

  // --- No content ---

  async getContent(): Promise<null> {
    return null;
  }

  getContents(): null {
    return null;
  }

  getTokenSize(): number {
    return 0;
  }

  // --- Not compactable (no content to compact) ---

  isCompactable(): boolean {
    return false;
  }

  async compact(_targetTokensToFree: number): Promise<number> {
    return 0;
  }

  // --- No tools ---

  getTools(): ToolFunction[] {
    return [];
  }

  // --- No state ---

  getState(): null {
    return null;
  }

  restoreState(_state: unknown): void {
    // No-op: no state to restore
  }

  // --- Cleanup ---

  destroy(): void {
    // No-op: no resources to release
  }
}
