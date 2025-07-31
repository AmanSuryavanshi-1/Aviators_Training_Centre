import { enhancedClient } from '@/lib/sanity/client';
import { logAutomationAction } from './audit-logger';

// Notification interfaces
export interface EditorNotification {
  _type: 'editorNotification';
  type: 
    | 'new_automated_draft'
    | 'draft_needs_review'
    | 'automation_error'
    | 'validation_warning'
    | 'system_alert';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'unread' | 'read' | 'dismissed' | 'archived';
  timestamp: string;
  expiresAt?: string;
  metadata?: {
    draftId?: string;
    automationId?: string;
    sourceUrl?: string;
    validationScore?: number;
    actionRequired?: boolean;
    actionUrl?: string;
    actionText?: string;
  };
  recipientId?: string;
  recipientRole?: 'editor' | 'admin' | 'author' | 'all';
}

// Email notification interface
export interface EmailNotificationData {
  to: string[];
  subject: string;
  htmlContent: string;
  textContent: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  metadata?: Record<string, any>;
}

// Notification preferences interface
export interface NotificationPreferences {
  _type: 'notificationPreferences';
  userId: string;
  email: string;
  preferences: {
    newAutomatedDraft: {
      inApp: boolean;
      email: boolean;
      immediate: boolean;
    };
    draftNeedsReview: {
      inApp: boolean;
      email: boolean;
      immediate: boolean;
    };
    automationError: {
      inApp: boolean;
      email: boolean;
      immediate: boolean;
    };
    validationWarning: {
      inApp: boolean;
      email: boolean;
      immediate: boolean;
    };
    systemAlert: {
      inApp: boolean;
      email: boolean;
      immediate: boolean;
    };
  };
  digestFrequency: 'immediate' | 'hourly' | 'daily' | 'weekly' | 'never';
  quietHours?: {
    enabled: boolean;
    startTime: string; // HH:MM format
    endTime: string;   // HH:MM format
    timezone: string;
  };
}

/**
 * Sends a notification to editors about new automated content
 */
export async function sendEditorNotification(data: {
  type: EditorNotification['type'];
  title?: string;
  message?: string;
  priority?: EditorNotification['priority'];
  draftId?: string;
  automationId?: string;
  sourceUrl?: string;
  validationScore?: number;
  timestamp: string;
  recipientRole?: EditorNotification['recipientRole'];
}): Promise<void> {
  try {
    const {
      type,
      draftId,
      automationId,
      sourceUrl,
      validationScore,
      timestamp,
      recipientRole = 'editor'
    } = data;

    // Generate notification content based on type
    const notificationContent = generateNotificationContent(type, {
      draftId,
      automationId,
      sourceUrl,
      validationScore
    });

    // Create in-app notification
    const notification: Omit<EditorNotification, '_id'> = {
      _type: 'editorNotification',
      type,
      title: data.title || notificationContent.title,
      message: data.message || notificationContent.message,
      priority: data.priority || notificationContent.priority,
      status: 'unread',
      timestamp,
      recipientRole,
      metadata: {
        draftId,
        automationId,
        sourceUrl,
        validationScore,
        actionRequired: notificationContent.actionRequired,
        actionUrl: notificationContent.actionUrl,
        actionText: notificationContent.actionText
      }
    };

    // Set expiration for non-critical notifications
    if (notification.priority === 'low' || notification.priority === 'medium') {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // Expire after 7 days
      notification.expiresAt = expiresAt.toISOString();
    }

    // Create the notification in Sanity
    await enhancedClient.create(notification);

    // Send email notifications if configured
    await sendEmailNotifications(notification);

    // Log the notification action
    await logAutomationAction({
      type: 'editor_notification',
      automationId,
      status: 'success',
      timestamp: new Date().toISOString(),
      metadata: {
        notificationType: type,
        priority: notification.priority,
        recipientRole,
        draftId
      }
    });

  } catch (error) {
    console.error('Error sending editor notification:', error);
    
    // Log the notification failure
    await logAutomationAction({
      type: 'editor_notification',
      automationId: data.automationId,
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
      metadata: {
        notificationType: data.type,
        draftId: data.draftId
      }
    });

    throw error;
  }
}

/**
 * Generates notification content based on type and context
 */
function generateNotificationContent(
  type: EditorNotification['type'],
  context: {
    draftId?: string;
    automationId?: string;
    sourceUrl?: string;
    validationScore?: number;
  }
): {
  title: string;
  message: string;
  priority: EditorNotification['priority'];
  actionRequired: boolean;
  actionUrl?: string;
  actionText?: string;
} {
  const { draftId, automationId, sourceUrl, validationScore } = context;

  switch (type) {
    case 'new_automated_draft':
      return {
        title: 'New Automated Blog Draft Created',
        message: `A new blog post draft has been automatically created${sourceUrl ? ` from ${sourceUrl}` : ''}. Please review and approve for publication.`,
        priority: validationScore && validationScore < 70 ? 'high' : 'medium',
        actionRequired: true,
        actionUrl: draftId ? `/admin/blogs/review/${draftId}` : '/admin/blogs',
        actionText: 'Review Draft'
      };

    case 'draft_needs_review':
      return {
        title: 'Draft Requires Editorial Review',
        message: `An automated draft has validation issues${validationScore ? ` (score: ${validationScore}/100)` : ''} and needs editorial attention before publication.`,
        priority: 'high',
        actionRequired: true,
        actionUrl: draftId ? `/admin/blogs/review/${draftId}` : '/admin/blogs',
        actionText: 'Review Now'
      };

    case 'automation_error':
      return {
        title: 'Automation System Error',
        message: `An error occurred in the content automation system${automationId ? ` (ID: ${automationId})` : ''}. Please check the system logs for details.`,
        priority: 'urgent',
        actionRequired: true,
        actionUrl: '/admin/automation/logs',
        actionText: 'View Logs'
      };

    case 'validation_warning':
      return {
        title: 'Content Validation Warning',
        message: `Automated content has validation warnings${validationScore ? ` (score: ${validationScore}/100)` : ''}. Review recommended before publication.`,
        priority: 'medium',
        actionRequired: false,
        actionUrl: draftId ? `/admin/blogs/review/${draftId}` : '/admin/blogs',
        actionText: 'Review Content'
      };

    case 'system_alert':
      return {
        title: 'System Alert',
        message: 'Important system notification regarding the automation workflow.',
        priority: 'high',
        actionRequired: false,
        actionUrl: '/admin/automation',
        actionText: 'View Details'
      };

    default:
      return {
        title: 'Automation Notification',
        message: 'You have a new notification from the automation system.',
        priority: 'medium',
        actionRequired: false
      };
  }
}

/**
 * Sends email notifications based on user preferences
 */
async function sendEmailNotifications(notification: EditorNotification): Promise<void> {
  try {
    // Get users who should receive this notification
    const recipients = await getNotificationRecipients(notification);
    
    if (recipients.length === 0) {
      return;
    }

    // Check if we're in quiet hours for any recipients
    const activeRecipients = await filterRecipientsForQuietHours(recipients);
    
    if (activeRecipients.length === 0) {
      // Schedule for later if all recipients are in quiet hours
      await scheduleDelayedNotification(notification, recipients);
      return;
    }

    // Generate email content
    const emailData = generateEmailContent(notification);
    
    // Send emails (this would integrate with your email service)
    await sendEmails(emailData, activeRecipients);

  } catch (error) {
    console.error('Error sending email notifications:', error);
    // Don't throw here as email failure shouldn't break the main notification flow
  }
}

/**
 * Gets users who should receive the notification based on role and preferences
 */
async function getNotificationRecipients(notification: EditorNotification): Promise<NotificationPreferences[]> {
  try {
    // Query for users with notification preferences
    const query = notification.recipientRole === 'all' 
      ? `*[_type == "notificationPreferences"]`
      : `*[_type == "notificationPreferences" && preferences.${notification.type}.email == true]`;

    const preferences = await enhancedClient.fetch<NotificationPreferences[]>(query);
    return preferences;

  } catch (error) {
    console.error('Error getting notification recipients:', error);
    return [];
  }
}

/**
 * Filters recipients based on quiet hours settings
 */
async function filterRecipientsForQuietHours(recipients: NotificationPreferences[]): Promise<NotificationPreferences[]> {
  const now = new Date();
  
  return recipients.filter(recipient => {
    if (!recipient.quietHours?.enabled) {
      return true;
    }

    try {
      const { startTime, endTime, timezone } = recipient.quietHours;
      
      // Convert current time to recipient's timezone
      const recipientTime = new Date(now.toLocaleString("en-US", { timeZone: timezone }));
      const currentHour = recipientTime.getHours();
      const currentMinute = recipientTime.getMinutes();
      const currentTimeMinutes = currentHour * 60 + currentMinute;
      
      // Parse quiet hours
      const [startHour, startMinute] = startTime.split(':').map(Number);
      const [endHour, endMinute] = endTime.split(':').map(Number);
      const startTimeMinutes = startHour * 60 + startMinute;
      const endTimeMinutes = endHour * 60 + endMinute;
      
      // Check if current time is within quiet hours
      if (startTimeMinutes <= endTimeMinutes) {
        // Same day range (e.g., 9:00 to 17:00)
        return currentTimeMinutes < startTimeMinutes || currentTimeMinutes > endTimeMinutes;
      } else {
        // Overnight range (e.g., 22:00 to 6:00)
        return currentTimeMinutes > endTimeMinutes && currentTimeMinutes < startTimeMinutes;
      }
    } catch (error) {
      console.error('Error checking quiet hours for recipient:', error);
      return true; // Default to sending if there's an error
    }
  });
}

/**
 * Schedules a notification to be sent later when recipients are out of quiet hours
 */
async function scheduleDelayedNotification(
  notification: EditorNotification,
  recipients: NotificationPreferences[]
): Promise<void> {
  // This would integrate with a job queue system like Bull or Agenda
  // For now, we'll just log that it should be scheduled
  console.log('Scheduling delayed notification for quiet hours:', {
    notificationId: notification._type,
    recipientCount: recipients.length,
    type: notification.type
  });
  
  // In a real implementation, you would:
  // 1. Calculate the earliest time when any recipient is out of quiet hours
  // 2. Schedule a job to send the notification at that time
  // 3. Store the scheduled notification in a queue
}

/**
 * Generates email content for notifications
 */
function generateEmailContent(notification: EditorNotification): EmailNotificationData {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://aviatorstrainingcentre.com';
  const actionUrl = notification.metadata?.actionUrl 
    ? `${baseUrl}${notification.metadata.actionUrl}`
    : `${baseUrl}/admin`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>${notification.title}</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #075E68; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .button { display: inline-block; padding: 12px 24px; background: #075E68; color: white; text-decoration: none; border-radius: 4px; margin: 10px 0; }
            .priority-high { border-left: 4px solid #e74c3c; }
            .priority-urgent { border-left: 4px solid #c0392b; background: #fdf2f2; }
            .metadata { background: #eee; padding: 10px; margin: 10px 0; border-radius: 4px; font-size: 0.9em; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Aviators Training Centre</h1>
                <p>Content Management System</p>
            </div>
            <div class="content ${notification.priority === 'high' ? 'priority-high' : ''} ${notification.priority === 'urgent' ? 'priority-urgent' : ''}">
                <h2>${notification.title}</h2>
                <p>${notification.message}</p>
                
                ${notification.metadata?.actionRequired ? `
                    <p><a href="${actionUrl}" class="button">${notification.metadata.actionText || 'Take Action'}</a></p>
                ` : ''}
                
                <div class="metadata">
                    <strong>Details:</strong><br>
                    Priority: ${notification.priority.toUpperCase()}<br>
                    Time: ${new Date(notification.timestamp).toLocaleString()}<br>
                    ${notification.metadata?.automationId ? `Automation ID: ${notification.metadata.automationId}<br>` : ''}
                    ${notification.metadata?.validationScore ? `Validation Score: ${notification.metadata.validationScore}/100<br>` : ''}
                </div>
                
                <p><small>This is an automated notification from the Aviators Training Centre content management system.</small></p>
            </div>
        </div>
    </body>
    </html>
  `;

  const textContent = `
    ${notification.title}
    
    ${notification.message}
    
    ${notification.metadata?.actionRequired ? `Action Required: ${actionUrl}` : ''}
    
    Details:
    - Priority: ${notification.priority.toUpperCase()}
    - Time: ${new Date(notification.timestamp).toLocaleString()}
    ${notification.metadata?.automationId ? `- Automation ID: ${notification.metadata.automationId}` : ''}
    ${notification.metadata?.validationScore ? `- Validation Score: ${notification.metadata.validationScore}/100` : ''}
    
    This is an automated notification from the Aviators Training Centre content management system.
  `;

  return {
    to: [], // Will be populated by the calling function
    subject: `[ATC CMS] ${notification.title}`,
    htmlContent,
    textContent,
    priority: notification.priority,
    metadata: {
      notificationType: notification.type,
      automationId: notification.metadata?.automationId,
      draftId: notification.metadata?.draftId
    }
  };
}

/**
 * Sends emails to recipients (placeholder for email service integration)
 */
async function sendEmails(
  emailData: EmailNotificationData,
  recipients: NotificationPreferences[]
): Promise<void> {
  // This would integrate with your email service (SendGrid, AWS SES, etc.)
  console.log('Sending email notifications:', {
    subject: emailData.subject,
    recipientCount: recipients.length,
    priority: emailData.priority
  });

  // Example integration with SendGrid or similar service:
  /*
  const emailService = new EmailService();
  const recipientEmails = recipients.map(r => r.email);
  
  await emailService.send({
    ...emailData,
    to: recipientEmails
  });
  */
}

/**
 * Gets unread notifications for a user
 */
export async function getUserNotifications(
  userId?: string,
  role?: string,
  limit: number = 20
): Promise<EditorNotification[]> {
  try {
    const conditions: string[] = ['_type == "editorNotification"', 'status == "unread"'];
    const params: Record<string, any> = {};

    if (userId) {
      conditions.push('recipientId == $userId');
      params.userId = userId;
    } else if (role) {
      conditions.push('(recipientRole == $role || recipientRole == "all")');
      params.role = role;
    }

    // Filter out expired notifications
    conditions.push('(!defined(expiresAt) || expiresAt > $now)');
    params.now = new Date().toISOString();

    const query = `*[${conditions.join(' && ')}] | order(timestamp desc) [0...${limit}]`;
    
    const notifications = await enhancedClient.fetch<EditorNotification[]>(query, params);
    return notifications;

  } catch (error) {
    console.error('Error fetching user notifications:', error);
    return [];
  }
}

/**
 * Marks a notification as read
 */
export async function markNotificationAsRead(notificationId: string): Promise<void> {
  try {
    await enhancedClient
      .patch(notificationId)
      .set({ status: 'read' })
      .commit();

  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
}

/**
 * Dismisses a notification
 */
export async function dismissNotification(notificationId: string): Promise<void> {
  try {
    await enhancedClient
      .patch(notificationId)
      .set({ status: 'dismissed' })
      .commit();

  } catch (error) {
    console.error('Error dismissing notification:', error);
    throw error;
  }
}

/**
 * Cleans up old notifications
 */
export async function cleanupOldNotifications(retentionDays: number = 30): Promise<number> {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
    const cutoffISO = cutoffDate.toISOString();

    // Find old notifications to delete
    const oldNotifications = await enhancedClient.fetch<{ _id: string }[]>(
      `*[_type == "editorNotification" && (status == "read" || status == "dismissed") && timestamp < $cutoffDate]._id`,
      { cutoffDate: cutoffISO }
    );

    // Delete old notifications
    const deletePromises = oldNotifications.map(notification => 
      enhancedClient.delete(notification._id)
    );
    
    await Promise.all(deletePromises);

    return oldNotifications.length;

  } catch (error) {
    console.error('Error cleaning up old notifications:', error);
    throw error;
  }
}
