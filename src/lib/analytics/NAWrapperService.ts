/**
 * NAWrapperService
 * 
 * Centralized service for handling null/undefined values consistently
 * across the analytics dashboard. Ensures all missing data displays
 * as "NA" with appropriate explanations and styling.
 */

export interface DisplayValue<T> {
  value: T | 'NA';
  isNA: boolean;
  reason?: string;
  source?: string;
  timestamp?: Date;
  confidence?: number;
}

export interface NADisplay {
  text: 'NA';
  reason: string;
  className: string;
  ariaLabel: string;
}

export type NAReasonType = 
  | 'api_unavailable'
  | 'data_not_found'
  | 'authentication_failed'
  | 'rate_limit_exceeded'
  | 'network_error'
  | 'insufficient_permissions'
  | 'data_processing_error'
  | 'source_not_configured'
  | 'invalid_date_range'
  | 'no_data_in_period';

export class NAWrapperService {
  private static instance: NAWrapperService;
  
  private readonly naReasons: Record<NAReasonType, string> = {
    api_unavailable: 'Data source API is currently unavailable',
    data_not_found: 'No data available for the selected criteria',
    authentication_failed: 'Unable to authenticate with data source',
    rate_limit_exceeded: 'API rate limit exceeded, please try again later',
    network_error: 'Network connection error occurred',
    insufficient_permissions: 'Insufficient permissions to access this data',
    data_processing_error: 'Error occurred while processing data',
    source_not_configured: 'Data source is not properly configured',
    invalid_date_range: 'Invalid or unsupported date range selected',
    no_data_in_period: 'No data available for the selected time period'
  };

  private constructor() {}

  /**
   * Get singleton instance
   */
  static getInstance(): NAWrapperService {
    if (!NAWrapperService.instance) {
      NAWrapperService.instance = new NAWrapperService();
    }
    return NAWrapperService.instance;
  }

  /**
   * Wrap a value and return DisplayValue with NA handling
   */
  wrapValue<T>(
    value: T | null | undefined,
    options: {
      reason?: NAReasonType;
      source?: string;
      customReason?: string;
      confidence?: number;
    } = {}
  ): DisplayValue<T> {
    if (this.isValidValue(value)) {
      return {
        value: value as T,
        isNA: false,
        source: options.source,
        timestamp: new Date(),
        confidence: options.confidence
      };
    }

    const reason = options.customReason || 
                  (options.reason ? this.naReasons[options.reason] : 'Data not available');

    return {
      value: 'NA',
      isNA: true,
      reason,
      source: options.source,
      timestamp: new Date(),
      confidence: 0
    };
  }

  /**
   * Format NA display with consistent styling and accessibility
   */
  formatNA(
    reason?: NAReasonType | string,
    options: {
      showTooltip?: boolean;
      className?: string;
      size?: 'sm' | 'md' | 'lg';
    } = {}
  ): NADisplay {
    const resolvedReason = typeof reason === 'string' 
      ? reason 
      : reason 
        ? this.naReasons[reason] 
        : 'Data not available';

    const sizeClasses = {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg'
    };

    const baseClassName = 'text-muted-foreground font-medium';
    const sizeClass = sizeClasses[options.size || 'md'];
    const customClass = options.className || '';
    
    return {
      text: 'NA',
      reason: resolvedReason,
      className: `${baseClassName} ${sizeClass} ${customClass}`.trim(),
      ariaLabel: `Not available: ${resolvedReason}`
    };
  }

  /**
   * Check if a value is valid (not null, undefined, empty string, or NaN)
   */
  isValidValue(value: any): boolean {
    if (value === null || value === undefined) {
      return false;
    }

    if (typeof value === 'string' && value.trim() === '') {
      return false;
    }

    if (typeof value === 'number' && (isNaN(value) || !isFinite(value))) {
      return false;
    }

    if (Array.isArray(value) && value.length === 0) {
      return false;
    }

    return true;
  }

  /**
   * Wrap numeric value with formatting
   */
  wrapNumeric(
    value: number | null | undefined,
    options: {
      format?: 'integer' | 'decimal' | 'percentage' | 'currency';
      decimals?: number;
      reason?: NAReasonType;
      source?: string;
    } = {}
  ): DisplayValue<string> {
    const wrappedValue = this.wrapValue(value, options);
    
    if (wrappedValue.isNA) {
      return wrappedValue as DisplayValue<string>;
    }

    const numValue = wrappedValue.value as number;
    let formattedValue: string;

    switch (options.format) {
      case 'percentage':
        formattedValue = `${numValue.toFixed(options.decimals || 1)}%`;
        break;
      case 'currency':
        formattedValue = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD'
        }).format(numValue);
        break;
      case 'decimal':
        formattedValue = numValue.toFixed(options.decimals || 2);
        break;
      case 'integer':
      default:
        formattedValue = Math.round(numValue).toLocaleString();
        break;
    }

    return {
      ...wrappedValue,
      value: formattedValue
    };
  }

  /**
   * Wrap array values with NA handling
   */
  wrapArray<T>(
    array: T[] | null | undefined,
    options: {
      reason?: NAReasonType;
      source?: string;
      minLength?: number;
    } = {}
  ): DisplayValue<T[]> {
    if (!Array.isArray(array) || array.length === 0) {
      return this.wrapValue(null, options) as DisplayValue<T[]>;
    }

    if (options.minLength && array.length < options.minLength) {
      return this.wrapValue(null, {
        ...options,
        reason: 'data_not_found'
      }) as DisplayValue<T[]>;
    }

    return {
      value: array,
      isNA: false,
      source: options.source,
      timestamp: new Date()
    };
  }

  /**
   * Create a batch wrapper for multiple values
   */
  wrapBatch<T extends Record<string, any>>(
    data: T,
    options: {
      source?: string;
      defaultReason?: NAReasonType;
    } = {}
  ): Record<keyof T, DisplayValue<any>> {
    const result = {} as Record<keyof T, DisplayValue<any>>;

    for (const [key, value] of Object.entries(data)) {
      result[key as keyof T] = this.wrapValue(value, {
        source: options.source,
        reason: options.defaultReason
      });
    }

    return result;
  }

  /**
   * Extract raw value from DisplayValue
   */
  unwrapValue<T>(displayValue: DisplayValue<T>): T | null {
    return displayValue.isNA ? null : displayValue.value as T;
  }

  /**
   * Check if DisplayValue represents NA
   */
  isNA<T>(displayValue: DisplayValue<T>): boolean {
    return displayValue.isNA;
  }

  /**
   * Get confidence score for a DisplayValue
   */
  getConfidence<T>(displayValue: DisplayValue<T>): number {
    return displayValue.confidence || (displayValue.isNA ? 0 : 1);
  }

  /**
   * Create NA display for trend changes
   */
  wrapTrendChange(
    current: number | null | undefined,
    previous: number | null | undefined,
    options: {
      format?: 'percentage' | 'absolute';
      source?: string;
    } = {}
  ): DisplayValue<string> {
    if (!this.isValidValue(current) || !this.isValidValue(previous)) {
      return this.wrapValue(null, {
        reason: 'data_not_found',
        source: options.source
      }) as DisplayValue<string>;
    }

    const currentVal = current as number;
    const previousVal = previous as number;
    
    if (previousVal === 0) {
      return this.wrapValue(null, {
        reason: 'data_processing_error',
        customReason: 'Cannot calculate change from zero baseline',
        source: options.source
      }) as DisplayValue<string>;
    }

    const change = ((currentVal - previousVal) / previousVal) * 100;
    const formattedChange = options.format === 'absolute' 
      ? (currentVal - previousVal).toLocaleString()
      : `${change > 0 ? '+' : ''}${change.toFixed(1)}%`;

    return {
      value: formattedChange,
      isNA: false,
      source: options.source,
      timestamp: new Date(),
      confidence: 1
    };
  }
}

// Export singleton instance
export const naWrapperService = NAWrapperService.getInstance();

// Export convenience functions
export const wrapValue = naWrapperService.wrapValue.bind(naWrapperService);
export const formatNA = naWrapperService.formatNA.bind(naWrapperService);
export const isValidValue = naWrapperService.isValidValue.bind(naWrapperService);
export const wrapNumeric = naWrapperService.wrapNumeric.bind(naWrapperService);
export const wrapArray = naWrapperService.wrapArray.bind(naWrapperService);