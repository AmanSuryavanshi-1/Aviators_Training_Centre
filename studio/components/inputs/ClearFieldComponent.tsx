/**
 * Clear Field Component
 * Input wrapper that adds clear functionality to rich text fields
 * NO schema changes - implemented as inputComponent wrapper
 */

import React, { useState, useCallback } from 'react';
import { 
  Box, 
  Button, 
  Dialog, 
  Card, 
  Stack, 
  Text, 
  Flex,
  Tooltip,
  useToast
} from '@sanity/ui';
import { TrashIcon, UndoIcon } from '@sanity/icons';
import { InputProps, PatchEvent, set, unset } from 'sanity';

interface ClearFieldComponentProps extends InputProps {
  renderDefault: (props: InputProps) => React.ReactElement;
}

export function ClearFieldComponent(props: ClearFieldComponentProps) {
  const { value, onChange, renderDefault, path, readOnly } = props;
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const toast = useToast();

  // Check if field has content
  const hasContent = Boolean(
    value && 
    (
      (Array.isArray(value) && value.length > 0) ||
      (typeof value === 'string' && value.trim().length > 0) ||
      (typeof value === 'object' && Object.keys(value).length > 0)
    )
  );

  // Handle clear field action
  const handleClearField = useCallback(async () => {
    if (!hasContent || readOnly) return;

    setIsClearing(true);
    
    try {
      // Create patch event to unset the field
      const patchEvent = PatchEvent.from(unset());
      onChange(patchEvent);
      
      // Show success toast
      toast.push({
        status: 'success',
        title: 'Field cleared',
        description: 'Content has been cleared. Use Ctrl+Z to undo.',
      });
      
      setShowConfirmDialog(false);
    } catch (error) {
      console.error('Failed to clear field:', error);
      toast.push({
        status: 'error',
        title: 'Failed to clear field',
        description: 'An error occurred while clearing the field.',
      });
    } finally {
      setIsClearing(false);
    }
  }, [hasContent, readOnly, onChange, toast]);

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Ctrl+Shift+X to clear field
    if (event.ctrlKey && event.shiftKey && event.key === 'X') {
      event.preventDefault();
      if (hasContent && !readOnly) {
        setShowConfirmDialog(true);
      }
    }
  }, [hasContent, readOnly]);

  // Add keyboard event listener
  React.useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return (
    <Box>
      {/* Render the default input component */}
      <Box position="relative">
        {renderDefault(props)}
        
        {/* Clear button overlay */}
        {hasContent && !readOnly && (
          <Box
            position="absolute"
            top={2}
            right={2}
            style={{ zIndex: 10 }}
          >
            <Tooltip
              content={
                <Box padding={2}>
                  <Text size={1}>
                    Clear field content
                    <br />
                    <Text muted>Keyboard: Ctrl+Shift+X</Text>
                  </Text>
                </Box>
              }
              placement="left"
            >
              <Button
                icon={TrashIcon}
                mode="ghost"
                tone="critical"
                onClick={() => setShowConfirmDialog(true)}
                disabled={isClearing}
                style={{
                  backgroundColor: 'var(--atc-surface-elevated)',
                  border: '1px solid var(--atc-border)',
                  borderRadius: 'var(--atc-radius)',
                  transition: 'var(--atc-transition-normal)',
                }}
                aria-label="Clear field content"
              />
            </Tooltip>
          </Box>
        )}
      </Box>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <Dialog
          id="clear-field-dialog"
          onClose={() => setShowConfirmDialog(false)}
          zOffset={1000}
        >
          <Card
            padding={4}
            radius={3}
            shadow={3}
            style={{
              backgroundColor: 'var(--atc-surface-elevated)',
              border: '2px solid var(--atc-warning)',
              borderLeft: '4px solid var(--atc-warning)',
              maxWidth: '400px',
            }}
          >
            <Stack space={4}>
              {/* Dialog Header */}
              <Flex align="center" gap={3}>
                <Box
                  style={{
                    backgroundColor: 'var(--atc-warning)',
                    borderRadius: '50%',
                    padding: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <TrashIcon style={{ color: 'white', fontSize: '16px' }} />
                </Box>
                <Text size={2} weight="bold" style={{ color: 'var(--atc-text)' }}>
                  Clear Field Content
                </Text>
              </Flex>

              {/* Dialog Content */}
              <Stack space={3}>
                <Text size={1} style={{ color: 'var(--atc-text)', lineHeight: 1.5 }}>
                  Are you sure you want to clear this field? This action will remove all content.
                </Text>
                
                <Box
                  padding={3}
                  style={{
                    backgroundColor: 'var(--atc-info)',
                    borderRadius: 'var(--atc-radius)',
                    border: '1px solid var(--atc-tertiary)',
                  }}
                >
                  <Flex align="center" gap={2}>
                    <UndoIcon style={{ color: 'var(--atc-background)', fontSize: '14px' }} />
                    <Text size={0} style={{ color: 'var(--atc-background)' }}>
                      You can undo this action with Ctrl+Z
                    </Text>
                  </Flex>
                </Box>
              </Stack>

              {/* Dialog Actions */}
              <Flex gap={2} justify="flex-end">
                <Button
                  text="Cancel"
                  tone="default"
                  onClick={() => setShowConfirmDialog(false)}
                  style={{
                    backgroundColor: 'var(--atc-surface)',
                    border: '1px solid var(--atc-border)',
                    color: 'var(--atc-text)',
                  }}
                />
                <Button
                  text={isClearing ? 'Clearing...' : 'Clear Field'}
                  tone="critical"
                  onClick={handleClearField}
                  disabled={isClearing}
                  style={{
                    backgroundColor: 'var(--atc-error)',
                    border: '1px solid #B91C1C',
                    color: 'white',
                    fontWeight: '600',
                  }}
                />
              </Flex>
            </Stack>
          </Card>
        </Dialog>
      )}
    </Box>
  );
}

// Higher-order component to wrap any input component
export function withClearField<T extends InputProps>(
  WrappedComponent: React.ComponentType<T>
) {
  return function ClearFieldWrapper(props: T) {
    return (
      <ClearFieldComponent
        {...props}
        renderDefault={(defaultProps) => <WrappedComponent {...defaultProps as T} />}
      />
    );
  };
}

export default ClearFieldComponent;