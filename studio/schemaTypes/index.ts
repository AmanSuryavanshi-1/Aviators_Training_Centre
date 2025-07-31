import {postType} from './postType.simple'
import {categoryType} from './categoryType'
import {authorType} from './authorType'
import {tagType} from './tagType'
import {courseType} from './courseType'
import {workflowType} from './workflowType'
import {ctaTemplateType} from './ctaTemplateType'
import {ctaPerformanceType} from './ctaPerformanceType'
import automationAuditLogType from './automationAuditLogType'
import {editorNotificationType} from './editorNotificationType'
import automationErrorLogType from './automationErrorLogType'

export const schemaTypes = [
  postType, 
  categoryType, 
  authorType, 
  tagType,
  courseType, 
  workflowType,
  ctaTemplateType,
  ctaPerformanceType,
  automationAuditLogType,
  editorNotificationType,
  automationErrorLogType
]
