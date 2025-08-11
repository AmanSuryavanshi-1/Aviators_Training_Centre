/**
 * Clear Field Plugin for Sanity Studio
 * Adds clear functionality to rich text fields via input component wrapper
 * NO schema changes - uses inputComponent wrapper approach
 */

import React, { useState, useCallback } from 'react';
import { definePlugin } from 'sanity';
import { Button, Dialog, Stack, Text, Flex, Box } from '@sanity/ui';
import { TrashIcon } from '@sanity/icons';
import { useClient, useFormValue } from 'sanity';

// Types
interface ClearFieldProps {
  children: React.ReactNode;
  path: string[];
  schemaType: any;
  value: any;
  onChange: (value: any) => void;
  readOnly?: boolean;
}

interface ClearFieldDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  fieldName: string;
}

// Clear Field Confirmation Dialog
const ClearFieldDialog: React.FC<ClearFieldDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  fieldName
}) => {
  const handleConfirm = useCallback(() => {
    onConfirm();
    onClose();
  }, [onConfirm, onClose]);

  if (!isOpen) return null;

  return (
    <Dialog
      id="clear-field-dialog"
      header="Clear Field Content"
      onClose={onClose}
      zOffset={1000}
      width={1}
    >
      <Box padding={4}>
        <Stack space={4}>
          <Text size={2}>
            Are you sure you want to clear the content of the <strong>{fieldName}</strong> field?
          </Text>
          <Text size={1} muted>
            This action cannot be undone. All content in this field will be permanently removed.
          </Text>
          <Flex gap={3} justify="flex-end">
            <Button
              text="Cancel"
              tone="default"
              onClick={onClose}
            />
            <Button
              text="Clear Field"
              tone="critical"
              onClick={handleConfirm}
              icon={TrashIcon}
            />
          </Flex>
        </Stack>
      </Box>
    </Dialog>
  );
};

// Clear Field Component Wrapper
const ClearFieldWrapper: React.FC<ClearFieldProps> = ({
  children,
  path,
  schemaType,
  value,
  onChange,
  readOnly = false
}) => {
  const [showDialog, setShowDialog] = useState(false);
  const client = useClient();
  const documentValue = useFormValue([]) as any;

  // Check if field has content
  const hasContent = value && (
    (Array.isArray(value) && value.length > 0) ||
    (typeof value === 'string' && value.trim().length > 0) ||
    (typeof value === 'object' && Object.keys(value).length > 0)
  );

  // Handle clear field action
  const handleClearField = useCallback(async () => {
    try {
      // Clear the field value
      onChange(undefined);
      
      // If we have a document ID, also patch it via Sanity client for undo support
      if (documentValue?._id) {
        await client
          .patch(documentValue._id)
          .unset(path)
          .commit();
      }
      
      console.log(`Cleared field: ${path.join('.')}`);
    } catch (error) {
      console.error('Error clearing field:', error);
    }
  }, [onChange, client, documentValue?._id, path]);

  // Handle keyboard shortcut (Ctrl+Shift+X)
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.ctrlKey && event.shiftKey && event.key === 'X') {
      event.preventDefault();
      if (hasContent && !readOnly) {
        setShowDialog(true);
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

  // Don't show clear button if field is empty or read-only
  if (!hasContent || readOnly) {
    return <>{children}</>;
  }

  return (
    <Stack space={3}>
      <Flex justify="space-between" align="flex-start">
        <Box flex={1}>
          {children}
        </Box>
        <Box marginLeft={2}>
          <Button
            icon={TrashIcon}
            mode="ghost"
            tone="critical"
            onClick={() => setShowDialog(true)}
            title="Clear field content (Ctrl+Shift+X)"
            aria-label={`Clear ${schemaType.title || schemaType.name} field content`}
            fontSize={1}
            padding={2}
          />
        </Box>
      </Flex>
      
      <ClearFieldDialog
        isOpen={showDialog}
        onClose={() => setShowDialog(false)}
        onConfirm={handleClearField}
        fieldName={schemaType.title || schemaType.name}
      />
    </Stack>
  );
};

// Field types that should have clear functionality
const CLEARABLE_FIELD_TYPES = [
  'array', // Rich text content (blocks)
  'text',  // Text areas
  'string', // Text inputs (when multiline)
  'html',   // HTML content
];

// Check if a field should have clear functionality
const shouldAddClearButton = (schemaType: any): boolean => {
  // Only add to specific field types
  if (!CLEARABLE_FIELD_TYPES.includes(schemaType.type)) {
    return false;
  }
  
  // For array types, check if it's a block content array (rich text)
  if (schemaType.type === 'array') {
    const hasBlockType = schemaType.of?.some((item: any) => item.type === 'block');
    return hasBlockType;
  }
  
  // For string types, only add to multiline text areas
  if (schemaType.type === 'string') {
    return schemaType.rows && schemaType.rows > 1;
  }
  
  return true;
};

// Create input component wrapper
const createClearFieldInputComponent = (OriginalComponent: React.ComponentType<any>) => {
  return React.forwardRef<any, any>((props, ref) => {
    const { schemaType, path, value, onChange, readOnly } = props;
    
    // Check if this field should have clear functionality
    if (!shouldAddClearButton(schemaType)) {
      return <OriginalComponent {...props} ref={ref} />;
    }
    
    return (
      <ClearFieldWrapper
        path={path}
        schemaType={schemaType}
        value={value}
        onChange={onChange}
        readOnly={readOnly}
      >
        <OriginalComponent {...props} ref={ref} />
      </ClearFieldWrapper>
    );
  });
};

// Plugin definition
export const clearFieldPlugin = definePlugin({
  name: 'clear-field',
  title: 'Clear Field Plugin',
  
  form: {
    components: {
      // Wrap the array input (for rich text blocks)
      input: (props) => {
        const { schemaType } = props;
        
        if (shouldAddClearButton(schemaType)) {
          return (
            <ClearFieldWrapper
              path={props.path}
              schemaType={schemaType}
              value={props.value}
              onChange={props.onChange}
              readOnly={props.readOnly}
            >
              {props.renderDefault(props)}
            </ClearFieldWrapper>
          );
        }
        
        return props.renderDefault(props);
      }
    }
  }
});

export default clearFieldPlugin;