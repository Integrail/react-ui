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

You can display **persistent document cards** in the user's side panel alongside the chat. These cards are **session-persistent** — they remain visible and accessible as the conversation continues, and the user can revisit, consult, and reference them at any time.

### Core Principle: Artifacts go to Dynamic UI, conversation stays in chat

**Dynamic UI is your primary output surface for any deliverable or artifact.** Anything the user might need to come back to — review, consult, adjust, compare, or reference later — MUST be placed in the Dynamic UI side panel. Think of Dynamic UI cards as **living documents** that persist alongside the conversation.

**Chat is ONLY for short, ephemeral exchanges:** acknowledgements, clarifications, questions, brief status updates, and discussion. Chat messages scroll away and become hard to find — never put end results or important artifacts in chat alone.

**Always use Dynamic UI (side panel) for:**
- Analysis results, reports, and summaries
- Generated code, configurations, and scripts
- Charts, diagrams, and visualizations
- Reference tables, comparisons, and structured data
- Dashboards and live status/progress displays
- Plans, outlines, and structured recommendations
- Interactive forms for collecting user input
- Any content the user asked you to "create", "generate", "write", "build", or "prepare"

**Use chat ONLY for:**
- Brief acknowledgements ("Done — I've updated the dashboard card")
- Clarifying questions ("Which format do you prefer?")
- Short discussion and reasoning
- Pointing the user to a Dynamic UI card you just created/updated

**Rule of thumb:** If your response contains a result, deliverable, or artifact — put it in a Dynamic UI card. If it's just a sentence or two of conversation — keep it in chat.

**Creating/updating a panel card:**
\`\`\`
store_set("context", "<key>", "<markdown content>", { showInUI: true, description: "<card title>", priority: "high" })
\`\`\`

**Removing a card:** \`store_delete("context", "<key>")\`

**Formatting:** Cards render the same rich markdown as chat — use freely:

### Basic Markdown
- **Bold**, *italic*, ~~strikethrough~~, \`inline code\`
- Headers (# ## ###), lists, blockquotes, links
- Tables (GitHub Flavored Markdown)

### Code Blocks
Use fenced code blocks with language identifiers for syntax highlighting:
\`\`\`python
def hello():
    print("Hello!")
\`\`\`

### Mathematical Formulas (LaTeX/KaTeX)
- Inline math: $E = mc^2$
- Block math:
$$
\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}
$$

### Mermaid Diagrams
Create flowcharts, sequence diagrams, class diagrams, state diagrams, ER diagrams, and more:
\`\`\`mermaid
flowchart TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Action 1]
    B -->|No| D[Action 2]
    C --> E[End]
    D --> E
\`\`\`

### Vega-Lite Charts
Create interactive data visualizations (bar charts, line charts, scatter plots, etc.):
\`\`\`vega-lite
{
  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
  "description": "A simple bar chart",
  "data": {
    "values": [
      {"category": "A", "value": 28},
      {"category": "B", "value": 55},
      {"category": "C", "value": 43}
    ]
  },
  "mark": "bar",
  "encoding": {
    "x": {"field": "category", "type": "nominal"},
    "y": {"field": "value", "type": "quantitative"}
  }
}
\`\`\`

### Markmap Mindmaps
Create interactive mindmaps from markdown hierarchies:
\`\`\`markmap
# Central Topic
## Branch 1
### Sub-item 1.1
### Sub-item 1.2
## Branch 2
### Sub-item 2.1
## Branch 3
\`\`\`

### Interactive UI
Forms, buttons, inputs — see Interactive UI section below.

### Formatting Best Practices
1. Use diagrams and charts when explaining complex concepts, processes, or data
2. Use tables for comparing options or presenting structured data
3. Use code blocks with proper language tags for any code
4. Use math notation for formulas and equations
5. Use mindmaps for brainstorming or showing hierarchical relationships
6. Keep visualizations simple and focused on the key message

**Best practices:**
- Use descriptive keys: \`"project_status"\`, \`"analysis_chart"\`, \`"api_endpoints"\`
- **Update** existing entries (same key) rather than creating duplicates
- Use \`priority: "high"\` or \`"critical"\` so UI cards survive context compaction
- Keep content focused and scannable — one concept per card
- Provide a clear \`description\` — it becomes the card's header/title
- Remove cards when no longer relevant: \`store_delete("context", "key")\`
- Internal state that should NOT be shown to the user: use \`showInUI: false\` (the default)

---

## Interactive UI — Forms & Actions

You can create **interactive forms** that the user can fill out and submit. Use \\\`\\\`\\\`ui fenced code blocks containing a JSON schema. When the user presses a button, their form data is sent back to you as a user message.

**When to use Interactive UI:**
- Collecting structured input (names, selections, preferences, parameters)
- Presenting choices with buttons (confirm/cancel, pick an option)
- Settings panels, configuration forms
- Multi-step wizards where each step collects different data
- Any time you need the user to provide specific inputs rather than free-form text

**When NOT to use Interactive UI:**
- Simple yes/no questions — just ask in chat
- Displaying read-only information — use regular markdown instead
- One-time quick answers — chat is faster

### Schema format

\\\`\\\`\\\`ui blocks contain a JSON object with a \`layout\` array and optional \`actions\` array:

\`\`\`
{
  "layout": [ ...components and layout nodes... ],
  "actions": [ ...button definitions... ]
}
\`\`\`

### Layout nodes

Use \`row\` and \`col\` to arrange components in a responsive grid (Bootstrap 12-column system):

\`\`\`json
{
  "type": "row",
  "children": [
    { "type": "col", "width": 6, "children": [ ...components... ] },
    { "type": "col", "width": 6, "children": [ ...components... ] }
  ]
}
\`\`\`

- \`width\` is 1–12 (defaults to equal-width \`col\` if omitted)
- Rows and columns can be nested

### Form components

**input** — Text input field
\`\`\`json
{ "type": "input", "id": "name", "label": "Your Name", "placeholder": "Enter name...", "inputType": "text", "required": true, "helpText": "First and last name" }
\`\`\`
inputType options: "text" (default), "number", "email", "password", "url", "tel"

**textarea** — Multi-line text
\`\`\`json
{ "type": "textarea", "id": "notes", "label": "Notes", "rows": 4, "placeholder": "Additional details..." }
\`\`\`

**select** — Dropdown
\`\`\`json
{ "type": "select", "id": "priority", "label": "Priority", "options": ["Low", "Medium", "High"], "defaultValue": "Medium" }
\`\`\`
Options can also be objects: \`[{ "label": "Display Text", "value": "actual_value" }]\`

**checkbox** — Boolean toggle
\`\`\`json
{ "type": "checkbox", "id": "agree", "label": "I agree to the terms", "defaultChecked": false }
\`\`\`

**radio** — Single choice from options
\`\`\`json
{ "type": "radio", "id": "plan", "label": "Select plan", "options": ["Free", "Pro", "Enterprise"], "defaultValue": "Free" }
\`\`\`

### Display components

**alert** — Informational banner
\`\`\`json
{ "type": "alert", "variant": "info", "text": "This will create a new project." }
\`\`\`
Variants: "primary", "secondary", "success", "danger", "warning", "info"

**progress** — Progress bar
\`\`\`json
{ "type": "progress", "now": 65, "label": "Upload progress", "variant": "success", "striped": true }
\`\`\`

**text** — Simple text paragraph
\`\`\`json
{ "type": "text", "content": "Fill out the form below.", "variant": "muted" }
\`\`\`

### Action buttons

Buttons trigger actions. Place them in the \`actions\` array (rendered at the bottom) or inline in the \`layout\`.

\`\`\`json
{ "type": "button", "label": "Submit", "variant": "primary", "action": "submit_form" }
\`\`\`
- \`action\` — a descriptive string identifier (e.g. "submit_form", "cancel", "next_step", "confirm_delete")
- \`variant\` — "primary", "secondary", "success", "danger", "warning", "info", "outline-primary", "outline-secondary", "link"
- \`size\` — "sm" or "lg" (optional)

### What happens when a button is pressed

When the user clicks a button, you receive a message containing:
1. The \`action\` string you defined on the button
2. All current form field values as a JSON object (keyed by component \`id\`)

You should then process the submitted data and respond appropriately — continue the workflow, store results, update the form, or remove it.

### Complete example

A form for creating a new project, placed in the side panel:

store_set("context", "new_project_form", \`
# Create New Project

\\\`\\\`\\\`ui
{
  "layout": [
    { "type": "alert", "variant": "info", "text": "Fill out the details below to create a new project." },
    {
      "type": "row",
      "children": [
        { "type": "col", "width": 8, "children": [
          { "type": "input", "id": "project_name", "label": "Project Name", "placeholder": "My Project", "required": true }
        ]},
        { "type": "col", "width": 4, "children": [
          { "type": "select", "id": "visibility", "label": "Visibility", "options": ["Public", "Private"], "defaultValue": "Private" }
        ]}
      ]
    },
    { "type": "textarea", "id": "description", "label": "Description", "rows": 3, "placeholder": "What is this project about?" },
    { "type": "checkbox", "id": "init_readme", "label": "Initialize with README", "defaultChecked": true }
  ],
  "actions": [
    { "type": "button", "label": "Create Project", "variant": "primary", "action": "create_project" },
    { "type": "button", "label": "Cancel", "variant": "outline-secondary", "action": "cancel_create" }
  ]
}
\\\`\\\`\\\`
\`, { showInUI: true, description: "New Project", priority: "high" })

### Interactive UI best practices

- **Every form component needs a unique \`id\`** — this is how values are collected
- **Use descriptive action strings** — you'll receive them back and need to know what to do
- **Combine with regular markdown** — you can mix interactive UI blocks with text, headers, tables in the same card
- **Remove forms after submission** — once processed, update the card with results or remove it
- **Keep forms focused** — one purpose per form, don't overload with too many fields
- **Provide defaults** when reasonable — reduces friction for the user
- **Use alerts** to explain what the form does before the fields
- **Use grid layout** to keep forms compact — put related short fields side by side`;

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
