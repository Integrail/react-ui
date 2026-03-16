/**
 * Plugins — Non-React plugins for OneRingAI agent context.
 *
 * Importing this module auto-registers plugin factories with PluginRegistry.
 * Import via '@everworker/react-ui/plugins' to avoid pulling in React dependencies.
 *
 * @example
 * ```typescript
 * import '@everworker/react-ui/plugins'; // side-effect: registers DynamicUI factory
 *
 * const agent = Agent.create({
 *   context: { features: { dynamicUI: true } }, // auto-initializes!
 * });
 * ```
 */

import { PluginRegistry } from '@everworker/oneringai';
import { DynamicUIPlugin } from './DynamicUIPlugin';

// Auto-register DynamicUI plugin factory when this module is imported
PluginRegistry.register('dynamic_ui', (config) => new DynamicUIPlugin(config), {
  featureKey: 'dynamicUI',
  description: 'Rich side-panel content via InContextMemory showInUI',
  dependencies: ['inContextMemory'],
});

export { DynamicUIPlugin };
