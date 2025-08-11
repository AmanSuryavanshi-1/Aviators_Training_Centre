/**
 * Keyboard Shortcuts Component
 * Handles keyboard shortcuts and help overlay for Sanity Studio
 */

import React, { useEffect, useState, useCallback } from 'react';
import { Card, Dialog, Flex, Text, Stack, Badge, Button } from '@sanity/ui';
import { HelpCircleIcon } from '@sanity/icons';

interface ShortcutConfig {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
  description: string;
  action: () => void;
  category: 'editing' | 'navigation' | 'system';
}

interface KeyboardShortcutsComponentProps {
  renderDefault: (props: any) => React.ReactNode;
}

const DEFAULT_SHORTCUTS: ShortcutConfig[] = [
  {
    key: 'x',
    ctrlKey: true,
    shiftKey: true,
    description: 'Clear current field',
    action: () => {
      // This will be handled by the clear field plugin
      const event = new CustomEvent('atc-clear-field');
      document.dispatchEvent(event);
    },
    category: 'editing'
  },
  {
    key: 's',
    ctrlKey: true,
    description: 'Save document',
    action: () => {
      // Trigger Sanity's save action
      const saveButton = document.querySelector('[data-testid="save-button"], [aria-label*="Save"], button[title*="Save"]') as HTMLButtonElement;
      if (saveButton && !saveButton.disabled) {
        saveButton.click();
      }
    },
    category: 'editing'
  },
  {
    key: 'p',
    ctrlKey: true,
    shiftKey: true,
    description: 'Publish document',
    action: () => {
      // Trigger Sanity's publish action
      const publishButton = document.querySelector('[data-testid="publish-button"], [aria-label*="Publish"], button[title*="Publish"]') as HTMLButtonElement;
      if (publishButton && !publishButton.disabled) {
        publishButton.click();
      }
    },
    category: 'editing'
  },
  {
    key: 'k',
    ctrlKey: true,
    description: 'Focus search',
    action: () => {
      // Focus the search input
      const searchInput = document.querySelector('input[placeholder*="Search"], input[aria-label*="Search"]') as HTMLInputElement;
      if (searchInput) {
        searchInput.focus();
        searchInput.select();
      }
    },
    category: 'navigation'
  },
  {
    key: '?',
    ctrlKey: true,
    description: 'Show keyboard shortcuts help',
    action: () => {
      // This will be handled internally
    },
    category: 'system'
  }
];

// Browser shortcuts to avoid conflicts with
const BROWSER_SHORTCUTS = [
  'ctrl+t', 'ctrl+w', 'ctrl+n', 'ctrl+shift+t', 'ctrl+r', 'ctrl+f',
  'ctrl+l', 'ctrl+d', 'ctrl+h', 'ctrl+j', 'ctrl+shift+delete',
  'f5', 'f12', 'ctrl+shift+i', 'ctrl+u', 'alt+left', 'alt+right'
];

// Sanity shortcuts to avoid conflicts with
const SANITY_SHORTCUTS = [
  'ctrl+z', 'ctrl+y', 'ctrl+shift+z', 'ctrl+a', 'ctrl+c', 'ctrl+v', 'ctrl+x'
];

export const KeyboardShortcutsComponent: React.FC<KeyboardShortcutsComponentProps> = ({ renderDefault, ...props }) => {
  const [showHelp, setShowHelp] = useState(false);
  const [shortcuts] = useState<ShortcutConfig[]>(DEFAULT_SHORTCUTS);

  const formatShortcut = useCallback((shortcut: ShortcutConfig): string => {
    const parts: string[] = [];
    if (shortcut.ctrlKey) parts.push('Ctrl');
    if (shortcut.shiftKey) parts.push('Shift');
    if (shortcut.altKey) parts.push('Alt');
    if (shortcut.metaKey) parts.push('Cmd');
    parts.push(shortcut.key.toUpperCase());
    return parts.join(' + ');
  }, []);

  const isInputFocused = useCallback((): boolean => {
    const activeElement = document.activeElement;
    if (!activeElement) return false;
    
    const tagName = activeElement.tagName.toLowerCase();
    const isContentEditable = activeElement.getAttribute('contenteditable') === 'true';
    const isInput = ['input', 'textarea', 'select'].includes(tagName);
    
    return isInput || isContentEditable;
  }, []);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Don't interfere when user is typing in input fields
    if (isInputFocused() && event.key !== '?') {
      return;
    }

    for (const shortcut of shortcuts) {
      const ctrlMatch = !!shortcut.ctrlKey === (event.ctrlKey || event.metaKey);
      const shiftMatch = !!shortcut.shiftKey === event.shiftKey;
      const altMatch = !!shortcut.altKey === event.altKey;
      const keyMatch = shortcut.key.toLowerCase() === event.key.toLowerCase();

      if (ctrlMatch && shiftMatch && altMatch && keyMatch) {
        // Special handling for help shortcut
        if (shortcut.key === '?' && shortcut.ctrlKey) {
          event.preventDefault();
          setShowHelp(true);
          return;
        }

        // Prevent default for our custom shortcuts
        event.preventDefault();
        event.stopPropagation();
        
        try {
          shortcut.action();
        } catch (error) {
          console.warn('Keyboard shortcut action failed:', error);
        }
        return;
      }
    }
  }, [shortcuts, isInputFocused]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = [];
    }
    acc[shortcut.category].push(shortcut);
    return acc;
  }, {} as Record<string, ShortcutConfig[]>);

  const categoryLabels = {
    editing: 'Content Editing',
    navigation: 'Navigation',
    system: 'System'
  };

  return (
    <>
      {renderDefault(props)}
      
      {showHelp && (
        <Dialog
          id="keyboard-shortcuts-help"
          onClose={() => setShowHelp(false)}
          header="Keyboard Shortcuts"
          width={1}
          __unstable_autoFocus={false}
        >
          <Card padding={4}>
            <Stack space={4}>
              <Flex align="center" gap={2}>
                <HelpCircleIcon />
                <Text size={2} weight="semibold">
                  Available Keyboard Shortcuts
                </Text>
              </Flex>
              
              {Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => (
                <Stack key={category} space={3}>
                  <Text size={1} weight="semibold" style={{ color: '#075E68' }}>
                    {categoryLabels[category as keyof typeof categoryLabels]}
                  </Text>
                  
                  <Stack space={2}>
                    {categoryShortcuts.map((shortcut, index) => (
                      <Flex key={index} justify="space-between" align="center">
                        <Text size={1}>{shortcut.description}</Text>
                        <Badge
                          mode="outline"
                          tone="primary"
                          style={{
                            fontFamily: 'monospace',
                            fontSize: '11px',
                            backgroundColor: '#f0f9ff',
                            color: '#075E68',
                            border: '1px solid #075E68'
                          }}
                        >
                          {formatShortcut(shortcut)}
                        </Badge>
                      </Flex>
                    ))}
                  </Stack>
                </Stack>
              ))}
              
              <Card padding={3} tone="caution" style={{ backgroundColor: '#fef3c7', border: '1px solid #f59e0b' }}>
                <Text size={1}>
                  <strong>Note:</strong> Shortcuts are disabled when typing in text fields to avoid conflicts.
                  Press <Badge mode="outline" style={{ fontFamily: 'monospace' }}>Ctrl + ?</Badge> anytime to show this help.
                </Text>
              </Card>
              
              <Flex justify="flex-end">
                <Button
                  text="Close"
                  tone="primary"
                  onClick={() => setShowHelp(false)}
                  style={{
                    backgroundColor: '#075E68',
                    color: 'white'
                  }}
                />
              </Flex>
            </Stack>
          </Card>
        </Dialog>
      )}
    </>
  );
};