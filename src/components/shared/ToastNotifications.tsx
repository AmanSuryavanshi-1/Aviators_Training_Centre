"use client";

import React from 'react';
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Info,
  RefreshCw,
  Upload,
  Download,
  Save,
  Trash2,
  Edit,
  Plus
} from 'lucide-react';
import { 
  Toast,
  ToastAction,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from '@/components/ui/toast';
import { useToast } from '@/hooks/use-toast';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastNotificationProps {
  type: ToastType;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  duration?: number;
}

// Enhanced toast hook with predefined notification types
export const useNotifications = () => {
  const { toast, ...rest } = useToast();

  const showNotification = (props: ToastNotificationProps) => {
    const getIcon = () => {
      switch (props.type) {
        case 'success':
          return <CheckCircle className="h-4 w-4 text-green-500" />;
        case 'error':
          return <XCircle className="h-4 w-4 text-red-500" />;
        case 'warning':
          return <AlertCircle className="h-4 w-4 text-yellow-500" />;
        case 'info':
          return <Info className="h-4 w-4 text-blue-500" />;
        default:
          return <Info className="h-4 w-4" />;
      }
    };

    toast({
      title: (
        <div className="flex items-center gap-2">
          {getIcon()}
          {props.title}
        </div>
      ),
      description: props.description,
      variant: props.type === 'error' ? 'destructive' : 'default',
      duration: props.duration || (props.type === 'error' ? 8000 : 4000),
      action: props.action ? (
        <ToastAction altText={props.action.label} onClick={props.action.onClick}>
          {props.action.label}
        </ToastAction>
      ) : undefined,
    });
  };

  // Predefined notification methods for common operations
  const notifications = {
    // Blog operations
    blogCreated: (title: string) => showNotification({
      type: 'success',
      title: 'Blog Post Created',
      description: `"${title}" has been created successfully and is now syncing.`,
    }),

    blogUpdated: (title: string) => showNotification({
      type: 'success',
      title: 'Blog Post Updated',
      description: `"${title}" has been updated and changes are syncing.`,
    }),

    blogDeleted: (title: string) => showNotification({
      type: 'success',
      title: 'Blog Post Deleted',
      description: `"${title}" has been deleted successfully.`,
    }),

    blogPublished: (title: string) => showNotification({
      type: 'success',
      title: 'Blog Post Published',
      description: `"${title}" is now live and visible to visitors.`,
    }),

    blogUnpublished: (title: string) => showNotification({
      type: 'info',
      title: 'Blog Post Unpublished',
      description: `"${title}" has been unpublished and is no longer visible.`,
    }),

    // Sync operations
    syncStarted: () => showNotification({
      type: 'info',
      title: 'Sync Started',
      description: 'Synchronizing with Sanity CMS...',
      duration: 2000,
    }),

    syncCompleted: () => showNotification({
      type: 'success',
      title: 'Sync Completed',
      description: 'All changes have been synchronized successfully.',
    }),

    syncFailed: (error: string, onRetry?: () => void) => showNotification({
      type: 'error',
      title: 'Sync Failed',
      description: error,
      action: onRetry ? {
        label: 'Retry',
        onClick: onRetry
      } : undefined,
    }),

    // Cache operations
    cacheCleared: () => showNotification({
      type: 'success',
      title: 'Cache Cleared',
      description: 'Blog cache has been cleared successfully.',
    }),

    cacheWarmed: () => showNotification({
      type: 'success',
      title: 'Cache Warmed',
      description: 'Blog cache has been pre-loaded for better performance.',
    }),

    // Image operations
    imageUploaded: (filename: string) => showNotification({
      type: 'success',
      title: 'Image Uploaded',
      description: `"${filename}" has been uploaded successfully.`,
    }),

    imageUploadFailed: (filename: string, onRetry?: () => void) => showNotification({
      type: 'error',
      title: 'Image Upload Failed',
      description: `Failed to upload "${filename}". Please try again.`,
      action: onRetry ? {
        label: 'Retry',
        onClick: onRetry
      } : undefined,
    }),

    // Connection status
    connectionRestored: () => showNotification({
      type: 'success',
      title: 'Connection Restored',
      description: 'Successfully reconnected to Sanity CMS.',
    }),

    connectionLost: () => showNotification({
      type: 'warning',
      title: 'Connection Lost',
      description: 'Lost connection to Sanity CMS. Attempting to reconnect...',
      duration: 6000,
    }),

    // Validation errors
    validationError: (field: string, message: string) => showNotification({
      type: 'error',
      title: 'Validation Error',
      description: `${field}: ${message}`,
    }),

    // Permission errors
    permissionDenied: (operation: string) => showNotification({
      type: 'error',
      title: 'Permission Denied',
      description: `You don't have permission to ${operation}. Please check your credentials.`,
    }),

    // Generic operations
    operationStarted: (operation: string) => showNotification({
      type: 'info',
      title: 'Operation Started',
      description: `${operation} is in progress...`,
      duration: 2000,
    }),

    operationCompleted: (operation: string) => showNotification({
      type: 'success',
      title: 'Operation Completed',
      description: `${operation} completed successfully.`,
    }),

    operationFailed: (operation: string, error: string, onRetry?: () => void) => showNotification({
      type: 'error',
      title: 'Operation Failed',
      description: `${operation} failed: ${error}`,
      action: onRetry ? {
        label: 'Retry',
        onClick: onRetry
      } : undefined,
    }),

    // Custom notification
    custom: showNotification,
  };

  return {
    ...rest,
    toast,
    notifications,
  };
};

// Toast container component that should be added to the app layout
export const ToastContainer: React.FC = () => {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
};

// Specialized notification components for specific operations
export const BlogOperationNotifier: React.FC<{
  operation: 'create' | 'update' | 'delete' | 'publish' | 'unpublish';
  status: 'loading' | 'success' | 'error';
  blogTitle: string;
  error?: string;
  onRetry?: () => void;
}> = ({ operation, status, blogTitle, error, onRetry }) => {
  const { notifications } = useNotifications();

  React.useEffect(() => {
    if (status === 'success') {
      switch (operation) {
        case 'create':
          notifications.blogCreated(blogTitle);
          break;
        case 'update':
          notifications.blogUpdated(blogTitle);
          break;
        case 'delete':
          notifications.blogDeleted(blogTitle);
          break;
        case 'publish':
          notifications.blogPublished(blogTitle);
          break;
        case 'unpublish':
          notifications.blogUnpublished(blogTitle);
          break;
      }
    } else if (status === 'error' && error) {
      notifications.operationFailed(
        `${operation} blog post`,
        error,
        onRetry
      );
    }
  }, [status, operation, blogTitle, error, onRetry, notifications]);

  return null;
};

export const SyncNotifier: React.FC<{
  isConnected: boolean;
  isSyncing: boolean;
  error?: string;
  onRetry?: () => void;
}> = ({ isConnected, isSyncing, error, onRetry }) => {
  const { notifications } = useNotifications();
  const [wasConnected, setWasConnected] = React.useState(isConnected);
  const [wasSyncing, setWasSyncing] = React.useState(isSyncing);

  React.useEffect(() => {
    // Connection status changes
    if (!wasConnected && isConnected) {
      notifications.connectionRestored();
    } else if (wasConnected && !isConnected) {
      notifications.connectionLost();
    }
    setWasConnected(isConnected);
  }, [isConnected, wasConnected, notifications]);

  React.useEffect(() => {
    // Sync status changes
    if (!wasSyncing && isSyncing) {
      notifications.syncStarted();
    } else if (wasSyncing && !isSyncing && !error) {
      notifications.syncCompleted();
    }
    setWasSyncing(isSyncing);
  }, [isSyncing, wasSyncing, error, notifications]);

  React.useEffect(() => {
    // Sync errors
    if (error) {
      notifications.syncFailed(error, onRetry);
    }
  }, [error, onRetry, notifications]);

  return null;
};

export default ToastContainer;
