// Automated Lead Qualification and Routing Workflows
// This module handles automated lead qualification, routing, and follow-up workflows

import { LeadProfile, LeadScore, enhancedLeadScoringEngine } from '@/lib/analytics/enhanced-lead-scoring';

export interface LeadRoutingRule {
  id: string;
  name: string;
  description: string;
  conditions: LeadRoutingCondition[];
  actions: LeadRoutingAction[];
  priority: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface LeadRoutingCondition {
  type: 'score_range' | 'quality' | 'demographic' | 'behavioral' | 'intent' | 'engagement' | 'custom';
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'not_contains' | 'in' | 'not_in';
  value: any;
  logicalOperator?: 'AND' | 'OR';
}

export interface LeadRoutingAction {
  type: 'assign_to_user' | 'send_email' | 'create_task' | 'add_to_sequence' | 'schedule_call' | 'send_sms' | 'webhook' | 'update_crm';
  config: Record<string, any>;
  delay?: number; // in minutes
  conditions?: LeadRoutingCondition[];
}

export interface LeadWorkflowExecution {
  id: string;
  leadId: string;
  userId: string;
  ruleId: string;
  ruleName: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
  executedActions: {
    actionType: string;
    status: 'pending' | 'completed' | 'failed';
    executedAt?: Date;
    result?: any;
    error?: string;
  }[];
  startedAt: Date;
  completedAt?: Date;
  metadata?: Record<string, any>;
}

export interface LeadNurtureSequence {
  id: string;
  name: string;
  description: string;
  targetAudience: LeadRoutingCondition[];
  steps: LeadNurtureStep[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface LeadNurtureStep {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'call' | 'task' | 'wait' | 'condition';
  delay: number; // in hours
  content?: {
    subject?: string;
    template: string;
    variables?: Record<string, any>;
  };
  conditions?: LeadRoutingCondition[];
  nextStepId?: string;
  alternativeStepId?: string; // for condition-based branching
}

class LeadQualificationRoutingEngine {
  private routingRules: Map<string, LeadRoutingRule> = new Map();
  private nurtureSequences: Map<string, LeadNurtureSequence> = new Map();
  private activeWorkflows: Map<string, LeadWorkflowExecution> = new Map();
  private leadAssignments: Map<string, string> = new Map(); // leadId -> assignedUserId

  constructor() {
    this.initializeDefaultRules();
    this.initializeDefaultSequences();
  }

  // Initialize default routing rules
  private initializeDefaultRules(): void {
    const defaultRules: LeadRoutingRule[] = [
      {
        id: 'hot_leads_immediate',
        name: 'Hot Leads - Immediate Response',
        description: 'Route hot leads to senior sales team for immediate follow-up',
        conditions: [
          {
            type: 'quality',
            field: 'quality',
            operator: 'equals',
            value: 'hot'
          }
        ],
        actions: [
          {
            type: 'assign_to_user',
            config: {
              userId: 'senior_sales_team',
              priority: 'high',
              notification: true
            }
          },
          {
            type: 'send_email',
            config: {
              template: 'hot_lead_immediate_response',
              to: 'lead',
              cc: 'assigned_user'
            },
            delay: 5 // 5 minutes
          },
          {
            type: 'create_task',
            config: {
              title: 'Call hot lead within 2 hours',
              assignedTo: 'assigned_user',
              dueDate: 'now+2h',
              priority: 'high'
            },
            delay: 10
          },
          {
            type: 'schedule_call',
            config: {
              type: 'outbound',
              priority: 'high',
              scheduledFor: 'now+30m'
            },
            delay: 15
          }
        ],
        priority: 1,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'warm_leads_standard',
        name: 'Warm Leads - Standard Follow-up',
        description: 'Route warm leads to sales team for standard follow-up',
        conditions: [
          {
            type: 'quality',
            field: 'quality',
            operator: 'equals',
            value: 'warm'
          }
        ],
        actions: [
          {
            type: 'assign_to_user',
            config: {
              userId: 'sales_team',
              priority: 'medium',
              notification: true
            }
          },
          {
            type: 'send_email',
            config: {
              template: 'warm_lead_welcome',
              to: 'lead'
            },
            delay: 30
          },
          {
            type: 'create_task',
            config: {
              title: 'Follow up with warm lead within 24 hours',
              assignedTo: 'assigned_user',
              dueDate: 'now+24h',
              priority: 'medium'
            },
            delay: 60
          }
        ],
        priority: 2,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'cold_leads_nurture',
        name: 'Cold Leads - Nurture Sequence',
        description: 'Add cold leads to nurture sequence',
        conditions: [
          {
            type: 'quality',
            field: 'quality',
            operator: 'equals',
            value: 'cold'
          }
        ],
        actions: [
          {
            type: 'add_to_sequence',
            config: {
              sequenceId: 'cold_lead_nurture',
              startDelay: 60 // 1 hour
            }
          },
          {
            type: 'assign_to_user',
            config: {
              userId: 'nurture_team',
              priority: 'low',
              notification: false
            }
          }
        ],
        priority: 3,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'immediate_urgency_override',
        name: 'Immediate Urgency Override',
        description: 'Override normal routing for leads with immediate urgency',
        conditions: [
          {
            type: 'intent',
            field: 'urgency',
            operator: 'equals',
            value: 'immediate'
          },
          {
            type: 'score_range',
            field: 'totalScore',
            operator: 'greater_than',
            value: 400,
            logicalOperator: 'AND'
          }
        ],
        actions: [
          {
            type: 'assign_to_user',
            config: {
              userId: 'senior_sales_team',
              priority: 'urgent',
              notification: true,
              escalation: true
            }
          },
          {
            type: 'send_sms',
            config: {
              template: 'urgent_lead_notification',
              to: 'assigned_user'
            },
            delay: 2
          },
          {
            type: 'create_task',
            config: {
              title: 'URGENT: Contact lead immediately',
              assignedTo: 'assigned_user',
              dueDate: 'now+1h',
              priority: 'urgent'
            },
            delay: 5
          }
        ],
        priority: 0, // Highest priority
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'high_value_demographic',
        name: 'High-Value Demographic Routing',
        description: 'Special routing for high-value demographic profiles',
        conditions: [
          {
            type: 'demographic',
            field: 'income',
            operator: 'in',
            value: ['20L-50L', 'above_50L']
          },
          {
            type: 'demographic',
            field: 'location',
            operator: 'in',
            value: ['Delhi', 'Mumbai', 'Bangalore'],
            logicalOperator: 'AND'
          }
        ],
        actions: [
          {
            type: 'assign_to_user',
            config: {
              userId: 'premium_sales_team',
              priority: 'high',
              notification: true
            }
          },
          {
            type: 'send_email',
            config: {
              template: 'premium_welcome',
              to: 'lead'
            },
            delay: 15
          }
        ],
        priority: 1,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    defaultRules.forEach(rule => {
      this.routingRules.set(rule.id, rule);
    });
  }

  // Initialize default nurture sequences
  private initializeDefaultSequences(): void {
    const defaultSequences: LeadNurtureSequence[] = [
      {
        id: 'cold_lead_nurture',
        name: 'Cold Lead Nurture Sequence',
        description: '30-day nurture sequence for cold leads',
        targetAudience: [
          {
            type: 'quality',
            field: 'quality',
            operator: 'equals',
            value: 'cold'
          }
        ],
        steps: [
          {
            id: 'step_1',
            name: 'Welcome Email',
            type: 'email',
            delay: 1, // 1 hour
            content: {
              subject: 'Welcome to Your Aviation Journey',
              template: 'cold_lead_welcome',
              variables: {
                personalizedCourses: true,
                includeTestimonials: true
              }
            },
            nextStepId: 'step_2'
          },
          {
            id: 'step_2',
            name: 'Educational Content',
            type: 'email',
            delay: 72, // 3 days
            content: {
              subject: 'Your Guide to Aviation Training in India',
              template: 'educational_content_1',
              variables: {
                includeCareerGuide: true,
                includeCostCalculator: true
              }
            },
            nextStepId: 'step_3'
          },
          {
            id: 'step_3',
            name: 'Success Stories',
            type: 'email',
            delay: 168, // 7 days
            content: {
              subject: 'From Dreams to Cockpit: Student Success Stories',
              template: 'success_stories',
              variables: {
                includeVideoTestimonials: true,
                matchDemographics: true
              }
            },
            nextStepId: 'step_4'
          },
          {
            id: 'step_4',
            name: 'Course Comparison',
            type: 'email',
            delay: 168, // 7 days
            content: {
              subject: 'Which Aviation Course is Right for You?',
              template: 'course_comparison',
              variables: {
                personalizedRecommendations: true,
                includePricing: true
              }
            },
            nextStepId: 'step_5'
          },
          {
            id: 'step_5',
            name: 'Limited Time Offer',
            type: 'email',
            delay: 168, // 7 days
            content: {
              subject: 'Special Offer: Save on Your Aviation Training',
              template: 'limited_time_offer',
              variables: {
                discountAmount: '10%',
                validityDays: 7
              }
            },
            nextStepId: 'step_6'
          },
          {
            id: 'step_6',
            name: 'Final Follow-up',
            type: 'email',
            delay: 168, // 7 days
            content: {
              subject: 'Last Chance: Your Aviation Career Awaits',
              template: 'final_followup',
              variables: {
                includeDirectContact: true,
                urgencyMessage: true
              }
            }
          }
        ],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'warm_lead_acceleration',
        name: 'Warm Lead Acceleration Sequence',
        description: '14-day acceleration sequence for warm leads',
        targetAudience: [
          {
            type: 'quality',
            field: 'quality',
            operator: 'equals',
            value: 'warm'
          }
        ],
        steps: [
          {
            id: 'step_1',
            name: 'Personalized Welcome',
            type: 'email',
            delay: 2, // 2 hours
            content: {
              subject: 'Your Personalized Aviation Training Plan',
              template: 'warm_lead_personalized_welcome',
              variables: {
                includePersonalizedPlan: true,
                scheduleConsultation: true
              }
            },
            nextStepId: 'step_2'
          },
          {
            id: 'step_2',
            name: 'Demo Class Invitation',
            type: 'email',
            delay: 48, // 2 days
            content: {
              subject: 'Exclusive Invitation: Free Demo Class',
              template: 'demo_class_invitation',
              variables: {
                availableSlots: true,
                limitedSeats: true
              }
            },
            nextStepId: 'step_3'
          },
          {
            id: 'step_3',
            name: 'Follow-up Call Task',
            type: 'task',
            delay: 72, // 3 days
            content: {
              template: 'warm_lead_followup_call'
            },
            nextStepId: 'step_4'
          },
          {
            id: 'step_4',
            name: 'Industry Insights',
            type: 'email',
            delay: 168, // 7 days
            content: {
              subject: 'Aviation Industry Trends & Career Opportunities',
              template: 'industry_insights',
              variables: {
                includeMarketData: true,
                careerProjections: true
              }
            }
          }
        ],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    defaultSequences.forEach(sequence => {
      this.nurtureSequences.set(sequence.id, sequence);
    });
  }

  // Process lead through qualification and routing
  async processLead(userId: string): Promise<LeadWorkflowExecution[]> {
    try {
      // Get lead profile and calculate score
      const leadProfile = enhancedLeadScoringEngine.getLeadProfile(userId);
      if (!leadProfile) {
        throw new Error(`Lead profile not found for user: ${userId}`);
      }

      const leadScore = await enhancedLeadScoringEngine.calculateLeadScore(userId);
      
      // Find matching routing rules
      const matchingRules = this.findMatchingRules(leadProfile, leadScore);
      
      // Execute workflows for matching rules
      const executions: LeadWorkflowExecution[] = [];
      
      for (const rule of matchingRules) {
        const execution = await this.executeWorkflow(leadProfile, leadScore, rule);
        executions.push(execution);
      }

      return executions;
    } catch (error) {
      console.error('Error processing lead:', error);
      throw error;
    }
  }

  // Find matching routing rules
  private findMatchingRules(leadProfile: LeadProfile, leadScore: LeadScore): LeadRoutingRule[] {
    const matchingRules: LeadRoutingRule[] = [];

    for (const rule of Array.from(this.routingRules.values())) {
      if (!rule.isActive) continue;

      if (this.evaluateConditions(rule.conditions, leadProfile, leadScore)) {
        matchingRules.push(rule);
      }
    }

    // Sort by priority (lower number = higher priority)
    return matchingRules.sort((a, b) => a.priority - b.priority);
  }

  // Evaluate routing conditions
  private evaluateConditions(
    conditions: LeadRoutingCondition[],
    leadProfile: LeadProfile,
    leadScore: LeadScore
  ): boolean {
    if (conditions.length === 0) return true;

    let result = true;
    let currentLogicalOperator: 'AND' | 'OR' = 'AND';

    for (let i = 0; i < conditions.length; i++) {
      const condition = conditions[i];
      const conditionResult = this.evaluateCondition(condition, leadProfile, leadScore);

      if (i === 0) {
        result = conditionResult;
      } else {
        if (currentLogicalOperator === 'AND') {
          result = result && conditionResult;
        } else {
          result = result || conditionResult;
        }
      }

      // Set logical operator for next iteration
      if (condition.logicalOperator) {
        currentLogicalOperator = condition.logicalOperator;
      }
    }

    return result;
  }

  // Evaluate single condition
  private evaluateCondition(
    condition: LeadRoutingCondition,
    leadProfile: LeadProfile,
    leadScore: LeadScore
  ): boolean {
    let actualValue: any;

    // Get actual value based on condition type
    switch (condition.type) {
      case 'score_range':
        actualValue = leadScore.totalScore;
        break;
      case 'quality':
        actualValue = leadScore.quality;
        break;
      case 'demographic':
        actualValue = leadProfile.demographics[condition.field as keyof typeof leadProfile.demographics];
        break;
      case 'behavioral':
        actualValue = leadProfile.behavior[condition.field as keyof typeof leadProfile.behavior];
        break;
      case 'intent':
        actualValue = leadProfile.intent[condition.field as keyof typeof leadProfile.intent];
        break;
      case 'engagement':
        actualValue = leadProfile.engagement[condition.field as keyof typeof leadProfile.engagement];
        break;
      default:
        return false;
    }

    // Evaluate condition based on operator
    switch (condition.operator) {
      case 'equals':
        return actualValue === condition.value;
      case 'not_equals':
        return actualValue !== condition.value;
      case 'greater_than':
        return actualValue > condition.value;
      case 'less_than':
        return actualValue < condition.value;
      case 'contains':
        return Array.isArray(actualValue) ? actualValue.includes(condition.value) : 
               String(actualValue).includes(String(condition.value));
      case 'not_contains':
        return Array.isArray(actualValue) ? !actualValue.includes(condition.value) : 
               !String(actualValue).includes(String(condition.value));
      case 'in':
        return Array.isArray(condition.value) ? condition.value.includes(actualValue) : false;
      case 'not_in':
        return Array.isArray(condition.value) ? !condition.value.includes(actualValue) : true;
      default:
        return false;
    }
  }

  // Execute workflow for a rule
  private async executeWorkflow(
    leadProfile: LeadProfile,
    leadScore: LeadScore,
    rule: LeadRoutingRule
  ): Promise<LeadWorkflowExecution> {
    const execution: LeadWorkflowExecution = {
      id: `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      leadId: leadProfile.id,
      userId: leadProfile.userId,
      ruleId: rule.id,
      ruleName: rule.name,
      status: 'in_progress',
      executedActions: [],
      startedAt: new Date(),
      metadata: {
        leadScore: leadScore.totalScore,
        leadQuality: leadScore.quality
      }
    };

    this.activeWorkflows.set(execution.id, execution);

    try {
      // Execute actions
      for (const action of rule.actions) {
        const actionExecution = {
          actionType: action.type,
          status: 'pending' as const,
          executedAt: undefined,
          result: undefined,
          error: undefined
        };

        execution.executedActions.push(actionExecution);

        try {
          // Apply delay if specified
          if (action.delay && action.delay > 0) {
            await this.delay(action.delay * 60 * 1000); // Convert minutes to milliseconds
          }

          // Execute action
          const result = await this.executeAction(action, leadProfile, leadScore, execution);
          
          actionExecution.status = 'completed';
          actionExecution.executedAt = new Date();
          actionExecution.result = result;
        } catch (error) {
          actionExecution.status = 'failed';
          actionExecution.executedAt = new Date();
          actionExecution.error = error instanceof Error ? error.message : String(error);
          console.error(`Action execution failed:`, error);
        }
      }

      execution.status = 'completed';
      execution.completedAt = new Date();
    } catch (error) {
      execution.status = 'failed';
      execution.completedAt = new Date();
      console.error(`Workflow execution failed:`, error);
    }

    // Store execution result
    await this.storeWorkflowExecution(execution);

    return execution;
  }

  // Execute individual action
  private async executeAction(
    action: LeadRoutingAction,
    leadProfile: LeadProfile,
    leadScore: LeadScore,
    execution: LeadWorkflowExecution
  ): Promise<any> {
    switch (action.type) {
      case 'assign_to_user':
        return this.assignLeadToUser(leadProfile, action.config);
      
      case 'send_email':
        return this.sendEmail(leadProfile, action.config);
      
      case 'create_task':
        return this.createTask(leadProfile, leadScore, action.config);
      
      case 'add_to_sequence':
        return this.addToNurtureSequence(leadProfile, action.config);
      
      case 'schedule_call':
        return this.scheduleCall(leadProfile, action.config);
      
      case 'send_sms':
        return this.sendSMS(leadProfile, action.config);
      
      case 'webhook':
        return this.callWebhook(leadProfile, leadScore, action.config);
      
      case 'update_crm':
        return this.updateCRM(leadProfile, leadScore, action.config);
      
      default:
        throw new Error(`Unknown action type: ${action.type}`);
    }
  }

  // Assign lead to user
  private async assignLeadToUser(leadProfile: LeadProfile, config: any): Promise<any> {
    const assignedUserId = config.userId;
    this.leadAssignments.set(leadProfile.id, assignedUserId);

    // Send notification if required
    if (config.notification) {
      await this.sendAssignmentNotification(leadProfile, assignedUserId, config);
    }

    return { assignedTo: assignedUserId, priority: config.priority };
  }

  // Send email
  private async sendEmail(leadProfile: LeadProfile, config: any): Promise<any> {
    // In a real implementation, integrate with email service
    if (process.env.NODE_ENV === 'development') {
      console.log(`Sending email to ${leadProfile.email} using template: ${config.template}`);
    }
    
    return {
      emailSent: true,
      template: config.template,
      recipient: leadProfile.email
    };
  }

  // Create task
  private async createTask(leadProfile: LeadProfile, leadScore: LeadScore, config: any): Promise<any> {
    const assignedUserId = config.assignedTo === 'assigned_user' 
      ? this.leadAssignments.get(leadProfile.id) 
      : config.assignedTo;

    const task = {
      id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: config.title,
      description: `Lead: ${leadProfile.name || leadProfile.email} (Score: ${leadScore.totalScore})`,
      assignedTo: assignedUserId,
      priority: config.priority,
      dueDate: this.parseDueDate(config.dueDate),
      leadId: leadProfile.id,
      createdAt: new Date()
    };

    // Store task (in real implementation, save to database)
    if (process.env.NODE_ENV === 'development') {
      console.log('Created task:', task);
    }

    return task;
  }

  // Add to nurture sequence
  private async addToNurtureSequence(leadProfile: LeadProfile, config: any): Promise<any> {
    const sequence = this.nurtureSequences.get(config.sequenceId);
    if (!sequence) {
      throw new Error(`Nurture sequence not found: ${config.sequenceId}`);
    }

    // Start sequence execution
    const sequenceExecution = await this.startNurtureSequence(leadProfile, sequence, config.startDelay || 0);
    
    return {
      sequenceId: config.sequenceId,
      executionId: sequenceExecution.id,
      startDelay: config.startDelay
    };
  }

  // Schedule call
  private async scheduleCall(leadProfile: LeadProfile, config: any): Promise<any> {
    const assignedUserId = this.leadAssignments.get(leadProfile.id);
    
    const call = {
      id: `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: config.type,
      leadId: leadProfile.id,
      assignedTo: assignedUserId,
      scheduledFor: this.parseScheduleTime(config.scheduledFor),
      priority: config.priority,
      createdAt: new Date()
    };

    if (process.env.NODE_ENV === 'development') {
      console.log('Scheduled call:', call);
    }
    return call;
  }

  // Send SMS
  private async sendSMS(leadProfile: LeadProfile, config: any): Promise<any> {
    if (!leadProfile.phone) {
      throw new Error('No phone number available for SMS');
    }

    if (process.env.NODE_ENV === 'development') {
      console.log(`Sending SMS to ${leadProfile.phone} using template: ${config.template}`);
    }
    
    return {
      smsSent: true,
      template: config.template,
      recipient: leadProfile.phone
    };
  }

  // Call webhook
  private async callWebhook(leadProfile: LeadProfile, leadScore: LeadScore, config: any): Promise<any> {
    const payload = {
      leadProfile,
      leadScore,
      timestamp: new Date().toISOString(),
      ...config.additionalData
    };

    // In real implementation, make HTTP request to webhook URL
    if (process.env.NODE_ENV === 'development') {
      console.log(`Calling webhook: ${config.url}`, payload);
    }
    
    return { webhookCalled: true, url: config.url };
  }

  // Update CRM
  private async updateCRM(leadProfile: LeadProfile, leadScore: LeadScore, config: any): Promise<any> {
    // In real implementation, integrate with CRM system
    console.log('Updating CRM with lead data:', {
      leadId: leadProfile.id,
      score: leadScore.totalScore,
      quality: leadScore.quality,
      updates: config.updates
    });

    return { crmUpdated: true, updates: config.updates };
  }

  // Helper methods
  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private parseDueDate(dueDateStr: string): Date {
    const now = new Date();
    
    if (dueDateStr.startsWith('now+')) {
      const timeStr = dueDateStr.substring(4);
      const match = timeStr.match(/(\d+)([hmd])/);
      
      if (match) {
        const value = parseInt(match[1]);
        const unit = match[2];
        
        switch (unit) {
          case 'h':
            return new Date(now.getTime() + value * 60 * 60 * 1000);
          case 'd':
            return new Date(now.getTime() + value * 24 * 60 * 60 * 1000);
          case 'm':
            return new Date(now.getTime() + value * 60 * 1000);
        }
      }
    }
    
    return new Date(dueDateStr);
  }

  private parseScheduleTime(scheduleStr: string): Date {
    return this.parseDueDate(scheduleStr);
  }

  private async sendAssignmentNotification(leadProfile: LeadProfile, assignedUserId: string, config: any): Promise<void> {
    // Send notification to assigned user
    if (process.env.NODE_ENV === 'development') {
      console.log(`Sending assignment notification to ${assignedUserId} for lead ${leadProfile.id}`);
    }
  }

  private async startNurtureSequence(leadProfile: LeadProfile, sequence: LeadNurtureSequence, startDelay: number): Promise<any> {
    // Implementation for starting nurture sequence
    return {
      id: `nurture_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sequenceId: sequence.id,
      leadId: leadProfile.id,
      startedAt: new Date()
    };
  }

  private async storeWorkflowExecution(execution: LeadWorkflowExecution): Promise<void> {
    try {
      await fetch('/api/admin/workflows/executions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(execution)
      });
    } catch (error) {
      console.error('Error storing workflow execution:', error);
    }
  }

  // Public methods for managing rules and sequences
  addRoutingRule(rule: Omit<LeadRoutingRule, 'id' | 'createdAt' | 'updatedAt'>): string {
    const id = `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const fullRule: LeadRoutingRule = {
      ...rule,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.routingRules.set(id, fullRule);
    return id;
  }

  updateRoutingRule(id: string, updates: Partial<LeadRoutingRule>): boolean {
    const rule = this.routingRules.get(id);
    if (!rule) return false;

    const updatedRule = {
      ...rule,
      ...updates,
      updatedAt: new Date()
    };

    this.routingRules.set(id, updatedRule);
    return true;
  }

  deleteRoutingRule(id: string): boolean {
    return this.routingRules.delete(id);
  }

  getRoutingRules(): LeadRoutingRule[] {
    return Array.from(this.routingRules.values());
  }

  addNurtureSequence(sequence: Omit<LeadNurtureSequence, 'id' | 'createdAt' | 'updatedAt'>): string {
    const id = `sequence_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const fullSequence: LeadNurtureSequence = {
      ...sequence,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.nurtureSequences.set(id, fullSequence);
    return id;
  }

  getNurtureSequences(): LeadNurtureSequence[] {
    return Array.from(this.nurtureSequences.values());
  }

  getActiveWorkflows(): LeadWorkflowExecution[] {
    return Array.from(this.activeWorkflows.values());
  }

  getLeadAssignment(leadId: string): string | undefined {
    return this.leadAssignments.get(leadId);
  }
}

// Export singleton instance
export const leadQualificationRoutingEngine = new LeadQualificationRoutingEngine();

// Convenience functions
export const processLead = (userId: string) => {
  return leadQualificationRoutingEngine.processLead(userId);
};

export const addRoutingRule = (rule: Omit<LeadRoutingRule, 'id' | 'createdAt' | 'updatedAt'>) => {
  return leadQualificationRoutingEngine.addRoutingRule(rule);
};

export const getRoutingRules = () => {
  return leadQualificationRoutingEngine.getRoutingRules();
};

export default leadQualificationRoutingEngine;
