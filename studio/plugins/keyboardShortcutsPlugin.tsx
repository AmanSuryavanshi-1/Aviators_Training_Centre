/**
 * Keyboard Shortcuts Plugin for Sanity Studio
 * Configurable keyboard shortcuts with conflict detection
 */

import React, { useEffect, useState, useCallback } from 'react';
import { definePlugin } from 'sanity';
import { Dialog, Stack, Text, Flex, Box, Card, Button, Code } from '@sanity/ui';
import { HelpCircleIcon, ControlsIcon } from '@sanity/icons';

// Keyboard shortcut configuration
interface KeyboardShortcut {
  id: string;
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  description: string;
  action: () => void;
  enabled: boolean;
  conflictsWith?: string[];
}

// Default shortcuts configuration
const DEFAULT_SHORTCUTS: Omit<KeyboardShortcut, 'action'>[] = [
  {
    id: 'clear-field',
    key: 'X',
    ctrlKey: true,
    shiftKey: true,
    description: 'Clear current field content',
    enabled: true,
    conflictsWith: []
  },
  {
    id: 'save-document',
    key: 's',
    ctrlKey: true,
    description: 'Save current document',
    enabled: true,
    conflictsWith: ['browser-save']
  },
  {
    id: 'publish-document',
    key: 'p',
    ctrlKey: true,
    shiftKey: true,
    description: 'Publish current document',
    enabled: true,
    conflictsWith: ['browser-print']
  },
  {
    id: 'help-shortcuts',
    key: '?',
    ctrlKey: true,
    description: 'Show keyboard shortcuts help',
    enabled: true,
    conflictsWith: []
  },
  {
    id: 'focus-search',
    key: 'k',
    ctrlKey: true,
    description: 'Focus search field',
    enabled: true,
    conflictsWith: []
  }
];

// Browser shortcuts that might conflict
const BROWSER_SHORTCUTS = [
  { key: 's', ctrlKey: true, description: 'Browser save page' },
  { key: 'p', ctrlKey: true, description: 'Browser print' },
  { key: 'f', ctrlKey: true, description: 'Browser find' },
  { key: 'r', ctrlKey: true, description: 'Browser refresh' },
  { key: 't', ctrlKey: true, description: 'Browser new tab' },
  { key: 'w', ctrlKey: true, description: 'Browser close tab' },
];

// Keyboard shortcuts help dialog
const KeyboardShortcutsHelp: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  shortcuts: KeyboardShortcut[];
}> = ({ isOpen, onClose, shortcuts }) => {
  if (!isOpen) return null;

  const formatShortcut = (shortcut: KeyboardShortcut) => {
    const keys = [];
    if (shortcut.ctrlKey) keys.push('Ctrl');
    if (shortcut.shiftKey) keys.push('Shift');
    if (shortcut.altKey) keys.push('Alt');
    keys.push(shortcut.key.toUpperCase());
    return keys.join(' + ');
  };

  return (
    <Dialog
      id="keyboard-shortcuts-help"
      header="Keyboard Shortcuts"
      onClose={onClose}
      zOffset={1000}
      width={2}
    >
      <Box padding={4}>
        <Stack space={4}>
          <Text size={2} weight="semibold">
            Available Keyboard Shortcuts
          </Text>
          
          <Stack space={3}>
            {shortcuts
              .filter(s => s.enabled)
              .map((shortcut) => (
                <Card key={shortcut.id} padding={3} border>
                  <Flex justify="space-between" align="center">
                    <Text size={1}>
                      {shortcut.description}
                    </Text>
                    <Code size={1}>
                      {formatShortcut(shortcut)}
                    </Code>
                  </Flex>
                </Card>
              ))}
          </Stack>
          
          <Text size={1} muted>
            Note: Some shortcuts may override browser defaults. Use with caution.
          </Text>
          
          <Flex justify="flex-end">
            <Button text="Close" onClick={onClose} />
          </Flex>
        </Stack>
      </Box>
    </Dialog>
  );
};

// Keyboard shortcuts manager component
const KeyboardShortcutsManager: React.FC = () => {
  const [shortcuts, setShortcuts] = useState<KeyboardShortcut[]>([]);
  const [showHelp, setShowHelp] = useState(false);

  // Initialize shortcuts
  useEffect(() => {
    const initialShortcuts: KeyboardShortcut[] = DEFAULT_SHORTCUTS.map(shortcut => ({
      ...shortcut,
      action: () => {
        switch (shortcut.id) {
          case 'clear-field':
            // This will be handled by the clear field plugin
            console.log('Clear field shortcut triggered');
            break;
          case 'save-document':
            // Trigger save action
            const saveButton = document.querySelector('[data-testid="save-button"], [aria-label*="Save"]');
            if (saveButton instanceof HTMLElement) {
              saveButton.click();
            }
            break;
          case 'publish-document':
            // Trigger publish action
            const publishButton = document.querySelector('[data-testid="publish-button"], [aria-label*="Publish"]');
            if (publishButton instanceof HTMLElement) {
              publishButton.click();
            }
            break;
          case 'help-shortcuts':
            setShowHelp(true);
            break;
          case 'focus-search':
            // Focus search field
            const searchInput = document.querySelector('[data-ui="SearchBox"] input, input[type="search"]');
            if (searchInput instanceof HTMLInputElement) {
              searchInput.focus();
            }
            break;
          default:
            console.log(`Shortcut ${shortcut.id} triggered`);
        }
      }
    }));
    
    setShortcuts(initialShortcuts);
  }, []);

  // Handle keyboard events
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Don't trigger shortcuts when typing in inputs (except for specific cases)
    const target = event.target as HTMLElement;
    const isInputField = target.tagName === 'INPUT' || 
                        target.tagName === 'TEXTAREA' || 
                        target.contentEditable === 'true';
    
    // Allow help shortcut even in input fields
    const isHelpShortcut = event.ctrlKey && event.key === '?';
    
    if (isInputField && !isHelpShortcut) {
      return;
    }

    // Find matching shortcut
    const matchingShortcut = shortcuts.find(shortcut => {
      if (!shortcut.enabled) return false;
      
      return (
        shortcut.key.toLowerCase() === event.key.toLowerCase() &&
        !!shortcut.ctrlKey === event.ctrlKey &&
        !!shortcut.shiftKey === event.shiftKey &&
        !!shortcut.altKey === event.altKey
      );
    });

    if (matchingShortcut) {
      // Check for conflicts with browser shortcuts
      const hasConflict = BROWSER_SHORTCUTS.some(browserShortcut =>
        browserShortcut.key.toLowerCase() === event.key.toLowerCase() &&
        !!browserShortcut.ctrlKey === event.ctrlKey
      );

      if (hasConflict) {
        console.warn(`Keyboard shortcut conflict detected: ${matchingShortcut.id}`);
      }

      event.preventDefault();
      matchingShortcut.action();
    }
  }, [shortcuts]);

  // Add keyboard event listener
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return (
    <>
      <KeyboardShortcutsHelp
        isOpen={showHelp}
        onClose={() => setShowHelp(false)}
        shortcuts={shortcuts}
      />
    </>
  );
};

// Help button component
const KeyboardShortcutsHelpButton: React.FC = () => {
  const [showHelp, setShowHelp] = useState(false);
  const [shortcuts] = useState<KeyboardShortcut[]>(
    DEFAULT_SHORTCUTS.map(shortcut => ({
      ...shortcut,
      action: () => {}
    }))
  );

  return (
    <>
      <Button
        icon={ControlsIcon}
        mode="ghost"
        onClick={() => setShowHelp(true)}
        title="Keyboard shortcuts (Ctrl + ?)"
        aria-label="Show keyboard shortcuts help"
      />
      <KeyboardShortcutsHelp
        isOpen={showHelp}
        onClose={() => setShowHelp(false)}
        shortcuts={shortcuts}
      />
    </>
  );
};

// Plugin definition
export const keyboardShortcutsPlugin = definePlugin({
  name: 'keyboard-shortcuts',
  title: 'Keyboard Shortcuts',
  
  studio: {
    components: {
      // Add keyboard shortcuts manager to the studio
      layout: (props) => {
        return (
          <>
            {props.renderDefault(props)}
            <KeyboardShortcutsManager />
          </>
        );
      },
      
      // Add help button to navbar
      navbar: (props) => {
        return (
          <Flex align="center" gap={2}>
            {props.renderDefault(props)}
            <KeyboardShortcutsHelpButton />
          </Flex>
        );
      }
    }
  }
});

export default keyboardShortcutsPlugin;