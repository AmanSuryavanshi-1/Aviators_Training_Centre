import axios from 'axios';

// Interface for contact form webhook payload
export interface ContactWebhookPayload {
  name: string;
  email: string;
  message: string;
  subject: string;
  timestamp: string; // ISO format
  formId: string; // Firebase-generated key
  isDemoBooking: boolean;
  phone?: string; // Optional phone field
}

// Interface for contact form data from the API
export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

// Webhook configuration
export interface WebhookConfig {
  url: string;
  timeout: number;
  headers: Record<string, string>;
}

// Production-ready Bearer token authentication
// NOTE: This is a function, not a constant, to ensure env vars are read at runtime
const getAuthHeaders = (): Record<string, string> => {
  const authToken = process.env.N8N_WEBHOOK_AUTH_TOKEN;

  if (!authToken) {
    console.warn('⚠️ N8N_WEBHOOK_AUTH_TOKEN not set. Webhook will run without authentication.');
    return {};
  }

  // Use Bearer token authentication (industry standard)
  return {
    'Authorization': `Bearer ${authToken}`
  };
};

// Function to get webhook configuration at RUNTIME (not at module load time)
// This ensures environment variables are properly read on Vercel
const getWebhookConfig = (): WebhookConfig => {
  const config = {
    url: process.env.NODE_ENV === 'production'
      ? (process.env.N8N_WEBHOOK_URL_PROD || 'https://n8n.aviatorstrainingcentre.in/webhook/firebase-webhook')
      : (process.env.N8N_WEBHOOK_URL_TEST || 'https://n8n.aviatorstrainingcentre.in/webhook-test/firebase-webhook'),
    timeout: 5000,
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    }
  };
  // Log config in ALL environments temporarily to verify fix (remove after confirming)
  console.log('🔧 [PROD DEBUG] Webhook config:', {
    env: process.env.NODE_ENV,
    url: config.url,
    hasAuth: !!config.headers['Authorization'],
    authTokenExists: !!process.env.N8N_WEBHOOK_AUTH_TOKEN
  });

  return config;
};

/**
 * Constructs webhook payload from contact form data
 * @param formData - The contact form data
 * @param formId - Firebase-generated form ID
 * @returns Structured webhook payload (flattened for direct n8n access)
 */
export function constructWebhookPayload(
  formData: ContactFormData,
  formId: string
): ContactWebhookPayload {
  // Determine if this is a demo booking based on subject content
  const isDemoBooking = formData.subject?.toLowerCase().includes('demo') || false;

  // Return flattened structure so n8n can access directly with $json.email, $json.name, etc.
  return {
    name: formData.name,
    email: formData.email,
    message: formData.message,
    subject: formData.subject || 'Contact Form Submission',
    timestamp: new Date().toISOString(),
    formId,
    isDemoBooking,
    phone: formData.phone
  };
}

/**
 * Sends webhook payload to n8n instance
 * @param payload - The webhook payload to send
 * @param config - Optional webhook configuration (uses defaults if not provided)
 * @returns Promise that resolves when webhook is sent (non-blocking on errors)
 */
export async function triggerN8nWebhook(
  payload: ContactWebhookPayload,
  config: Partial<WebhookConfig> = {}
): Promise<void> {
  // Get config at runtime to ensure env vars are properly read
  const defaultConfig = getWebhookConfig();
  const webhookConfig = { ...defaultConfig, ...config };

  // Always log webhook attempt in development
  if (process.env.NODE_ENV === 'development') {
    console.log('🚀 Attempting to trigger n8n webhook:', {
      url: webhookConfig.url,
      payload: payload,
      headers: webhookConfig.headers,
      timeout: webhookConfig.timeout
    });
  }

  try {
    // Send the payload in the exact format n8n expects for your workflow
    // Since n8n wraps the data in a body object, we send it directly as individual fields
    const flatPayload = {
      name: payload.name,
      email: payload.email,
      message: payload.message,
      subject: payload.subject,
      timestamp: payload.timestamp,
      formId: payload.formId,
      isDemoBooking: payload.isDemoBooking,
      phone: payload.phone || '' // Add phone if available
    };

    const response = await axios.post(webhookConfig.url, flatPayload, {
      headers: webhookConfig.headers,
      timeout: webhookConfig.timeout
    });

    // Log success in development mode
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ n8n webhook triggered successfully:', {
        url: webhookConfig.url,
        formId: payload.formId,
        isDemoBooking: payload.isDemoBooking,
        hasAuth: !!webhookConfig.headers['Authorization'],
        responseStatus: response.status,
        responseData: response.data,
        payloadStructure: 'Flat structure - accessible via $json.email, $json.name, etc.'
      });
    }
  } catch (error) {
    // Log error but don't throw - webhook failures should not break form submission
    let errorType = 'unknown';
    let errorMessage = 'Unknown error';

    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED') {
        errorType = 'timeout';
        errorMessage = 'Request timed out';
      } else if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
        errorType = 'network';
        errorMessage = 'Network connection failed';
      } else if (error.response) {
        errorType = 'http_error';
        errorMessage = `HTTP ${error.response.status}: ${error.response.statusText}`;
      } else if (error.request) {
        errorType = 'network';
        errorMessage = 'No response received from server';
      } else {
        errorType = 'request_setup';
        errorMessage = error.message;
      }
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    console.error('n8n webhook failed:', {
      errorType,
      error: errorMessage,
      url: webhookConfig.url,
      formId: payload.formId,
      timestamp: payload.timestamp,
      isDemoBooking: payload.isDemoBooking
    });

    // Log additional error details in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Full webhook error details:', error);
    }
  }
}

/**
 * Convenience function to trigger webhook directly from form data
 * @param formData - The contact form data
 * @param formId - Firebase-generated form ID
 * @param config - Optional webhook configuration
 * @returns Promise that resolves when webhook is sent (non-blocking on errors)
 */
export async function triggerContactFormWebhook(
  formData: ContactFormData,
  formId: string,
  config: Partial<WebhookConfig> = {}
): Promise<void> {
  const payload = constructWebhookPayload(formData, formId);
  await triggerN8nWebhook(payload, config);
}