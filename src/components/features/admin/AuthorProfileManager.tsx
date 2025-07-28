'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { toast } from '@/hooks/use-toast'
import { 
  User, 
  Award, 
  Shield, 
  Settings, 
  Plus, 
  Trash2, 
  Edit,
  CheckCircle,
  AlertCircle,
  Clock,
  FileText,
  BarChart3,
  Users,
  BookOpen
} from 'lucide-react'
import { AuthorPermissionService, type AuthorLevel } from '@/lib/permissions/author-permissions'

interface Credential {
  credential: string
  details?: string
  issueDate?: string
  expiryDate?: string
  verified: boolean
}

interface AuthorExperience {
  totalFlightHours?: number
  yearsExperience?: number
  specializations?: string[]
  aircraftTypes?: string[]
  instructorRatings?: string[]
}

interface AuthorProfile {
  _id: string
  name: string
  slug: { current: string }
  email: string
  image?: {
    asset: { url: string }
    alt: string
  }
  bio: string
  role: string
  credentials: Credential[]
  experience: AuthorExperience
  authorLevel: AuthorLevel
  permissions: {
    canPublishDirectly: boolean
    canEditOthersContent: boolean
    canManageCategories: boolean
    canManageCourses: boolean
    requiresApproval: boolean
  }
  contentAreas: string[]
  socialMedia?: {
    linkedin?: string
    twitter?: string
    website?: string
  }
  status: 'active' | 'inactive' | 'suspended'
  joinedDate: string
  lastActive?: string
  notificationPreferences: {
    emailNotifications: boolean
    reviewReminders: boolean
    publishingUpdates: boolean
  }
  stats?: {
    totalPosts: number
    publishedPosts: number
    draftPosts: number
    pendingReview: number
    averageRating?: number
    totalViews?: number
  }
  expertiseScore?: number
  verificationStatus: 'pending' | 'verified' | 'rejected'
}

interface AuthorProfileManagerProps {
  author: AuthorProfile
  currentUser: { authorLevel: AuthorLevel }
  onUpdate: (updates: Partial<AuthorProfile>) => Promise<void>
  onDelete?: () => Promise<void>
  readOnly?: boolean
}

const AuthorProfileManager: React.FC<AuthorProfileManagerProps> = ({
  author,
  currentUser,
  onUpdate,
  onDelete,
  readOnly = false
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<Partial<AuthorProfile>>(author)
  const [loading, setLoading] = useState(false)

  const canManageAuthor = AuthorPermissionService.canPerformAction(currentUser, 'canManageAuthors')
  const canEditProfile = canManageAuthor || author._id === 'current-user-id' // Replace with actual current user check

  const expertiseScore = calculateExpertiseScore(author)
  const permissionsSummary = AuthorPermissionService.getAuthorPermissions(author.authorLevel, author.permissions)

  const handleSave = async () => {
    if (!canEditProfile) return

    try {
      setLoading(true)
      await onUpdate(formData)
      setIsEditing(false)
      toast({
        title: "Profile Updated",
        description: "Author profile has been updated successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update author profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const addCredential = () => {
    const newCredential: Credential = {
      credential: '',
      details: '',
      verified: false
    }
    setFormData(prev => ({
      ...prev,
      credentials: [...(prev.credentials || []), newCredential]
    }))
  }

  const removeCredential = (index: number) => {
    setFormData(prev => ({
      ...prev,
      credentials: prev.credentials?.filter((_, i) => i !== index) || []
    }))
  }

  const updateCredential = (index: number, field: keyof Credential, value: any) => {
    setFormData(prev => ({
      ...prev,
      credentials: prev.credentials?.map((cred, i) => 
        i === index ? { ...cred, [field]: value } : cred
      ) || []
    }))
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={author.image?.asset?.url} alt={author.image?.alt || author.name} />
            <AvatarFallback className="text-lg">
              {author.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold">{author.name}</h1>
            <p className="text-muted-foreground">{author.role}</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={author.status === 'active' ? 'default' : 'secondary'}>
                {author.status}
              </Badge>
              <Badge variant="outline">
                {author.authorLevel} Author
              </Badge>
              {author.verificationStatus === 'verified' && (
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Verified
                </Badge>
              )}
            </div>
          </div>
        </div>
        
        {canEditProfile && !readOnly && (
          <div className="flex gap-2">
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={loading}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Stats and Quick Info */}
        <div className="space-y-6">
          {/* Expertise Score */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Expertise Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">{expertiseScore}/100</span>
                  <Badge variant={expertiseScore >= 80 ? 'default' : expertiseScore >= 60 ? 'secondary' : 'destructive'}>
                    {expertiseScore >= 80 ? 'Expert' : expertiseScore >= 60 ? 'Experienced' : 'Developing'}
                  </Badge>
                </div>
                <Progress value={expertiseScore} className="h-2" />
                <div className="text-sm text-muted-foreground">
                  Based on credentials, experience, and content quality
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Content Statistics */}
          {author.stats && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Content Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{author.stats.publishedPosts}</div>
                    <div className="text-sm text-muted-foreground">Published</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{author.stats.draftPosts}</div>
                    <div className="text-sm text-muted-foreground">Drafts</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{author.stats.pendingReview}</div>
                    <div className="text-sm text-muted-foreground">Pending</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{author.stats.totalViews || 0}</div>
                    <div className="text-sm text-muted-foreground">Total Views</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Permissions Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Permissions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Direct Publishing</span>
                  {permissionsSummary.canPublishDirectly ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-orange-600" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Edit Others' Content</span>
                  {permissionsSummary.canEditOthersContent ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-orange-600" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Manage Categories</span>
                  {permissionsSummary.canManageCategories ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-orange-600" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Access Analytics</span>
                  {permissionsSummary.canAccessAnalytics ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-orange-600" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Detailed Information */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="credentials">Credentials</TabsTrigger>
              <TabsTrigger value="permissions">Permissions</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isEditing ? (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name">Full Name</Label>
                          <Input
                            id="name"
                            value={formData.name || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={formData.email || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="bio">Biography</Label>
                        <Textarea
                          id="bio"
                          value={formData.bio || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                          rows={4}
                        />
                      </div>
                      <div>
                        <Label htmlFor="role">Professional Role</Label>
                        <Select
                          value={formData.role || ''}
                          onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="chief-flight-instructor">Chief Flight Instructor</SelectItem>
                            <SelectItem value="senior-flight-instructor">Senior Flight Instructor</SelectItem>
                            <SelectItem value="flight-instructor">Flight Instructor</SelectItem>
                            <SelectItem value="airline-pilot">Airline Pilot</SelectItem>
                            <SelectItem value="commercial-pilot">Commercial Pilot</SelectItem>
                            <SelectItem value="aviation-consultant">Aviation Consultant</SelectItem>
                            <SelectItem value="ground-school-instructor">Ground School Instructor</SelectItem>
                            <SelectItem value="aviation-expert">Aviation Expert</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Full Name</Label>
                          <p className="text-sm font-medium">{author.name}</p>
                        </div>
                        <div>
                          <Label>Email</Label>
                          <p className="text-sm font-medium">{author.email}</p>
                        </div>
                      </div>
                      <div>
                        <Label>Biography</Label>
                        <p className="text-sm">{author.bio}</p>
                      </div>
                      <div>
                        <Label>Professional Role</Label>
                        <p className="text-sm font-medium">{author.role}</p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Experience Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Total Flight Hours</Label>
                      <p className="text-2xl font-bold text-blue-600">
                        {author.experience?.totalFlightHours?.toLocaleString() || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <Label>Years of Experience</Label>
                      <p className="text-2xl font-bold text-green-600">
                        {author.experience?.yearsExperience || 'N/A'}
                      </p>
                    </div>
                  </div>
                  
                  {author.experience?.specializations && author.experience.specializations.length > 0 && (
                    <div className="mt-4">
                      <Label>Specializations</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {author.experience.specializations.map((spec, index) => (
                          <Badge key={index} variant="outline">{spec}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="credentials" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Aviation Credentials</CardTitle>
                    {isEditing && (
                      <Button onClick={addCredential} size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Credential
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(isEditing ? formData.credentials : author.credentials)?.map((credential, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Award className="h-4 w-4" />
                            {isEditing ? (
                              <Select
                                value={credential.credential}
                                onValueChange={(value) => updateCredential(index, 'credential', value)}
                              >
                                <SelectTrigger className="w-[200px]">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="ATPL">ATPL (Airline Transport Pilot License)</SelectItem>
                                  <SelectItem value="CPL">CPL (Commercial Pilot License)</SelectItem>
                                  <SelectItem value="PPL">PPL (Private Pilot License)</SelectItem>
                                  <SelectItem value="CFI">CFI (Certified Flight Instructor)</SelectItem>
                                  <SelectItem value="CFII">CFII (Certified Flight Instructor - Instrument)</SelectItem>
                                  <SelectItem value="MEI">MEI (Multi-Engine Instructor)</SelectItem>
                                  <SelectItem value="Type Rating">Type Rating</SelectItem>
                                  <SelectItem value="Ground Instructor">Ground Instructor</SelectItem>
                                </SelectContent>
                              </Select>
                            ) : (
                              <span className="font-medium">{credential.credential}</span>
                            )}
                            {credential.verified && (
                              <Badge className="bg-green-100 text-green-800">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Verified
                              </Badge>
                            )}
                          </div>
                          {isEditing && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeCredential(index)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        {isEditing ? (
                          <Input
                            placeholder="Details (e.g., Boeing 737, 10,000+ hours)"
                            value={credential.details || ''}
                            onChange={(e) => updateCredential(index, 'details', e.target.value)}
                          />
                        ) : (
                          credential.details && (
                            <p className="text-sm text-muted-foreground">{credential.details}</p>
                          )
                        )}
                      </div>
                    ))}
                    
                    {(!author.credentials || author.credentials.length === 0) && (
                      <div className="text-center py-8 text-muted-foreground">
                        <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No credentials added yet</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="permissions" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Author Level & Permissions</CardTitle>
                  <CardDescription>
                    Configure the author's level and specific permissions
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {canManageAuthor && isEditing ? (
                    <>
                      <div>
                        <Label>Author Level</Label>
                        <Select
                          value={formData.authorLevel || author.authorLevel}
                          onValueChange={(value: AuthorLevel) => 
                            setFormData(prev => ({ ...prev, authorLevel: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">👑 Admin Author</SelectItem>
                            <SelectItem value="senior">✅ Senior Author</SelectItem>
                            <SelectItem value="regular">📝 Regular Author</SelectItem>
                            <SelectItem value="guest">🆕 Guest Author</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <Separator />

                      <div className="space-y-4">
                        <h4 className="font-medium">Custom Permissions</h4>
                        
                        {Object.entries({
                          canPublishDirectly: 'Can Publish Directly',
                          canEditOthersContent: "Can Edit Others' Content",
                          canManageCategories: 'Can Manage Categories',
                          canManageCourses: 'Can Manage Courses',
                          requiresApproval: 'Requires Editorial Approval'
                        }).map(([key, label]) => (
                          <div key={key} className="flex items-center justify-between">
                            <Label>{label}</Label>
                            <Switch
                              checked={formData.permissions?.[key as keyof typeof formData.permissions] ?? 
                                      author.permissions[key as keyof typeof author.permissions]}
                              onCheckedChange={(checked) => 
                                setFormData(prev => ({
                                  ...prev,
                                  permissions: {
                                    ...prev.permissions,
                                    [key]: checked
                                  }
                                }))
                              }
                            />
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <Label>Author Level</Label>
                        <p className="text-lg font-medium capitalize">{author.authorLevel} Author</p>
                      </div>
                      
                      <Separator />
                      
                      <div className="grid grid-cols-2 gap-4">
                        {Object.entries({
                          canPublishDirectly: 'Direct Publishing',
                          canEditOthersContent: "Edit Others' Content",
                          canManageCategories: 'Manage Categories',
                          canManageCourses: 'Manage Courses'
                        }).map(([key, label]) => (
                          <div key={key} className="flex items-center justify-between p-3 border rounded">
                            <span className="text-sm">{label}</span>
                            {permissionsSummary[key as keyof typeof permissionsSummary] ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <AlertCircle className="h-4 w-4 text-orange-600" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Account Status</Label>
                      <p className="text-sm text-muted-foreground">Current account status</p>
                    </div>
                    {canManageAuthor && isEditing ? (
                      <Select
                        value={formData.status || author.status}
                        onValueChange={(value: 'active' | 'inactive' | 'suspended') => 
                          setFormData(prev => ({ ...prev, status: value }))
                        }
                      >
                        <SelectTrigger className="w-[120px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                          <SelectItem value="suspended">Suspended</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge variant={author.status === 'active' ? 'default' : 'secondary'}>
                        {author.status}
                      </Badge>
                    )}
                  </div>

                  <Separator />

                  <div>
                    <Label>Notification Preferences</Label>
                    <div className="space-y-3 mt-2">
                      {Object.entries({
                        emailNotifications: 'Email Notifications',
                        reviewReminders: 'Review Reminders',
                        publishingUpdates: 'Publishing Updates'
                      }).map(([key, label]) => (
                        <div key={key} className="flex items-center justify-between">
                          <span className="text-sm">{label}</span>
                          <Switch
                            checked={isEditing 
                              ? formData.notificationPreferences?.[key as keyof typeof formData.notificationPreferences] ?? 
                                author.notificationPreferences[key as keyof typeof author.notificationPreferences]
                              : author.notificationPreferences[key as keyof typeof author.notificationPreferences]
                            }
                            onCheckedChange={(checked) => 
                              isEditing && setFormData(prev => ({
                                ...prev,
                                notificationPreferences: {
                                  ...prev.notificationPreferences,
                                  [key]: checked
                                }
                              }))
                            }
                            disabled={!isEditing}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label>Account Information</Label>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>Joined: {new Date(author.joinedDate).toLocaleDateString()}</p>
                      {author.lastActive && (
                        <p>Last Active: {new Date(author.lastActive).toLocaleDateString()}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {canManageAuthor && onDelete && (
                <Card className="border-red-200">
                  <CardHeader>
                    <CardTitle className="text-red-600">Danger Zone</CardTitle>
                    <CardDescription>
                      Irreversible actions that affect this author account
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      variant="destructive"
                      onClick={onDelete}
                      className="w-full"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Author Account
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

// Helper function to calculate expertise score
function calculateExpertiseScore(author: AuthorProfile): number {
  let score = 0

  // Base score from author level
  const levelScores = { admin: 40, senior: 30, regular: 20, guest: 10 }
  score += levelScores[author.authorLevel]

  // Credentials score (max 25 points)
  const credentialScores = {
    'ATPL': 10,
    'CPL': 8,
    'CFI': 6,
    'CFII': 5,
    'MEI': 5,
    'Type Rating': 4,
    'PPL': 3,
    'Ground Instructor': 3
  }
  
  const credentialScore = Math.min(25, 
    author.credentials.reduce((sum, cred) => 
      sum + (credentialScores[cred.credential as keyof typeof credentialScores] || 0), 0
    )
  )
  score += credentialScore

  // Experience score (max 20 points)
  if (author.experience?.totalFlightHours) {
    if (author.experience.totalFlightHours >= 10000) score += 10
    else if (author.experience.totalFlightHours >= 5000) score += 8
    else if (author.experience.totalFlightHours >= 1000) score += 6
    else if (author.experience.totalFlightHours >= 500) score += 4
    else score += 2
  }

  if (author.experience?.yearsExperience) {
    if (author.experience.yearsExperience >= 20) score += 10
    else if (author.experience.yearsExperience >= 10) score += 8
    else if (author.experience.yearsExperience >= 5) score += 6
    else score += 4
  }

  // Content performance score (max 15 points)
  if (author.stats) {
    const publishedRatio = author.stats.totalPosts > 0 
      ? author.stats.publishedPosts / author.stats.totalPosts 
      : 0
    score += Math.round(publishedRatio * 15)
  }

  return Math.min(100, score)
}

export default AuthorProfileManager