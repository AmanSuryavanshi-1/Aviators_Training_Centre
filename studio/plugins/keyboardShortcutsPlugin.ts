/**
 * Keyboard Shortcuts Plugin for Sanity Studio
 * Provides configurable keyboard shortcuts with conflict detection
 */

import { definePlugin } from 'sanity';
import { KeyboardShortcutsComponent } from '../components/KeyboardShortcutsComponent';

export interface ShortcutConfig {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
  description: string;
  action: () => void;
  category: 'editing' | 'navigation' | 'system';
}

export interface KeyboardShortcutsPluginConfig {
  shortcuts?: ShortcutConfig[];
  enableHelp?: boolean;
  helpKey?: string;
}

export const keyboardShortcutsPlugin = definePlugin<KeyboardShortcutsPluginConfig>((config = {}) => {
  return {
    name: 'keyboard-shortcuts',
    studio: {
      components: {
        layout: KeyboardShortcutsComponent,
      },
    },
    __internal: {
      config,
    },
  };
});