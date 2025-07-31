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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { toast } from '@/hooks/use-toast'
import { 
  Users, 
  UserPlus, 
  Edit, 
  Trash2, 
  Mail, 
  Shield, 
  Award, 
  Calendar,
  Activity,
  Settings,
  Eye,
  EyeOff,
  Crown,
  CheckCircle,
  FileText,
  UserCheck
} from 'lucide-react'

interface Author {
  _id: string
  name: string
  slug: { current: string }
  email: string
  image?: {
    asset: {
      url: string
    }
    alt: string
  }
  bio: string
  role: string
  credentials: Array<{
    credential: string
    details?: string
  }>
  experience: {
    totalFlightHours?: number
    yearsExperience?: number
    specializations?: string[]
  }
  authorLevel: 'admin' | 'senior' | 'regular' | 'guest'
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
  }
}

interface AuthorManagementProps {
  authors: Author[]
  onAuthorUpdate: (author: Author) => void
  onAuthorCreate: (author: Partial<Author>) => void
  onAuthorDelete: (authorId: string) => void
}

const AuthorManagement: React.FC<AuthorManagementProps> = ({
  authors,
  onAuthorUpdate,
  onAuthorCreate,
  onAuthorDelete
}) => {
  const [selectedAuthor, setSelectedAuthor] = useState<Author | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterLevel, setFilterLevel] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  const authorLevelConfig = {
    admin: { label: 'Admin Author', icon: Crown, color: 'bg-purple-100 text-purple-800' },
    senior: { label: 'Senior Author', icon: CheckCircle, color: 'bg-green-100 text-green-800' },
    regular: { label: 'Regular Author', icon: FileText, color: 'bg-blue-100 text-blue-800' },
    guest: { label: 'Guest Author', icon: UserCheck, color: 'bg-gray-100 text-gray-800' }
  }

  const statusConfig = {
    active: { label: 'Active', color: 'bg-green-100 text-green-800' },
    inactive: { label: 'Inactive', color: 'bg-yellow-100 text-yellow-800' },
    suspended: { label: 'Suspended', color: 'bg-red-100 text-red-800' }
  }

  const filteredAuthors = authors.filter(author => {
    const matchesSearch = author.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         author.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesLevel = filterLevel === 'all' || author.authorLevel === filterLevel
    const matchesStatus = filterStatus === 'all' || author.status === filterStatus
    
    return matchesSearch && matchesLevel && matchesStatus
  })

  const handleCreateAuthor = () => {
    setIsCreating(true)
    setSelectedAuthor(null)
    setIsEditing(true)
  }

  const handleEditAuthor = (author: Author) => {
    setSelectedAuthor(author)
    setIsEditing(true)
    setIsCreating(false)
  }

  const handleSaveAuthor = async (authorData: Partial<Author>) => {
    try {
      if (isCreating) {
        await onAuthorCreate(authorData)
        toast({
          title: "Author Created",
          description: "New author profile has been created successfully.",
        })
      } else if (selectedAuthor) {
        await onAuthorUpdate({ ...selectedAuthor, ...authorData })
        toast({
          title: "Author Updated",
          description: "Author profile has been updated successfully.",
        })
      }
      setIsEditing(false)
      setIsCreating(false)
      setSelectedAuthor(null)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save author profile. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteAuthor = async (authorId: string) => {
    try {
      await onAuthorDelete(authorId)
      toast({
        title: "Author Deleted",
        description: "Author profile has been deleted successfully.",
      })
      setSelectedAuthor(null)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete author profile. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (isEditing) {
    return (
      <AuthorEditor
        author={selectedAuthor}
        isCreating={isCreating}
        onSave={handleSaveAuthor}
        onCancel={() => {
          setIsEditing(false)
          setIsCreating(false)
          setSelectedAuthor(null)
        }}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Author Management</h1>
          <p className="text-muted-foreground">
            Manage author profiles, permissions, and content access
          </p>
        </div>
        <Button onClick={handleCreateAuthor} className="flex items-center gap-2">
          <UserPlus className="h-4 w-4" />
          Add New Author
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search authors by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={filterLevel} onValueChange={setFilterLevel}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="admin">Admin Authors</SelectItem>
                <SelectItem value="senior">Senior Authors</SelectItem>
                <SelectItem value="regular">Regular Authors</SelectItem>
                <SelectItem value="guest">Guest Authors</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Authors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAuthors.map((author) => {
          const levelConfig = authorLevelConfig[author.authorLevel] || authorLevelConfig.regular
          const statusConfig_ = statusConfig[author.status] || statusConfig.active
          const LevelIcon = levelConfig?.icon || User

          return (
            <Card key={author._id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage 
                        src={author.image?.asset?.url} 
                        alt={author.image?.alt || author.name}
                      />
                      <AvatarFallback>
                        {author.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{author.name}</CardTitle>
                      <CardDescription className="text-sm">
                        {author.role}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Badge className={levelConfig.color}>
                      <LevelIcon className="h-3 w-3 mr-1" />
                      {levelConfig.label}
                    </Badge>
                    <Badge className={statusConfig_.color}>
                      {statusConfig_.label}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  <div className="flex items-center gap-2 mb-1">
                    <Mail className="h-3 w-3" />
                    {author.email}
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3 w-3" />
                    Joined {new Date(author.joinedDate).toLocaleDateString()}
                  </div>
                </div>

                {author.stats && (
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-center p-2 bg-muted rounded">
                      <div className="font-semibold">{author.stats.publishedPosts}</div>
                      <div className="text-xs text-muted-foreground">Published</div>
                    </div>
                    <div className="text-center p-2 bg-muted rounded">
                      <div className="font-semibold">{author.stats.draftPosts}</div>
                      <div className="text-xs text-muted-foreground">Drafts</div>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 text-xs">
                  <Shield className="h-3 w-3" />
                  <span>
                    {author.permissions.canPublishDirectly ? 'Direct Publishing' : 'Requires Approval'}
                  </span>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditAuthor(author)}
                    className="flex items-center gap-1"
                  >
                    <Edit className="h-3 w-3" />
                    Edit
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Author</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete {author.name}? This action cannot be undone.
                          All content created by this author will remain but will be unassigned.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteAuthor(author._id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete Author
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredAuthors.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Authors Found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || filterLevel !== 'all' || filterStatus !== 'all'
                ? 'No authors match your current filters.'
                : 'Get started by creating your first author profile.'
              }
            </p>
            {!searchTerm && filterLevel === 'all' && filterStatus === 'all' && (
              <Button onClick={handleCreateAuthor}>
                <UserPlus className="h-4 w-4 mr-2" />
                Add First Author
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

interface AuthorEditorProps {
  author: Author | null
  isCreating: boolean
  onSave: (author: Partial<Author>) => void
  onCancel: () => void
}

const AuthorEditor: React.FC<AuthorEditorProps> = ({
  author,
  isCreating,
  onSave,
  onCancel
}) => {
  const [formData, setFormData] = useState<Partial<Author>>({
    name: author?.name || '',
    email: author?.email || '',
    bio: author?.bio || '',
    role: author?.role || 'flight-instructor',
    authorLevel: author?.authorLevel || 'regular',
    status: author?.status || 'active',
    permissions: author?.permissions || {
      canPublishDirectly: false,
      canEditOthersContent: false,
      canManageCategories: false,
      canManageCourses: false,
      requiresApproval: true
    },
    contentAreas: author?.contentAreas || [],
    credentials: author?.credentials || [],
    experience: author?.experience || {},
    socialMedia: author?.socialMedia || {},
    notificationPreferences: author?.notificationPreferences || {
      emailNotifications: true,
      reviewReminders: true,
      publishingUpdates: true
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const updateNestedFormData = (parent: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent as keyof typeof prev],
        [field]: value
      }
    }))
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {isCreating ? 'Create New Author' : `Edit ${author?.name}`}
          </h1>
          <p className="text-muted-foreground">
            {isCreating ? 'Add a new author to your team' : 'Update author profile and permissions'}
          </p>
        </div>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>

      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="permissions">Permissions</TabsTrigger>
            <TabsTrigger value="experience">Experience</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Author's personal and professional details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => updateFormData('name', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateFormData('email', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="bio">Biography *</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => updateFormData('bio', e.target.value)}
                    rows={4}
                    placeholder="Professional biography highlighting aviation experience..."
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="role">Professional Role</Label>
                    <Select
                      value={formData.role}
                      onValueChange={(value) => updateFormData('role', value)}
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
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => updateFormData('status', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Social Media</CardTitle>
                <CardDescription>
                  Professional social media profiles
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="linkedin">LinkedIn Profile</Label>
                  <Input
                    id="linkedin"
                    type="url"
                    value={formData.socialMedia?.linkedin || ''}
                    onChange={(e) => updateNestedFormData('socialMedia', 'linkedin', e.target.value)}
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>
                <div>
                  <Label htmlFor="twitter">Twitter/X Handle</Label>
                  <Input
                    id="twitter"
                    value={formData.socialMedia?.twitter || ''}
                    onChange={(e) => updateNestedFormData('socialMedia', 'twitter', e.target.value)}
                    placeholder="username (without @)"
                  />
                </div>
                <div>
                  <Label htmlFor="website">Personal Website</Label>
                  <Input
                    id="website"
                    type="url"
                    value={formData.socialMedia?.website || ''}
                    onChange={(e) => updateNestedFormData('socialMedia', 'website', e.target.value)}
                    placeholder="https://yourwebsite.com"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="permissions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Author Level & Permissions</CardTitle>
                <CardDescription>
                  Set the author's level and specific permissions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="authorLevel">Author Level</Label>
                  <Select
                    value={formData.authorLevel}
                    onValueChange={(value) => updateFormData('authorLevel', value)}
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
                  <h4 className="font-medium">Content Permissions</h4>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="canPublishDirectly">Can Publish Directly</Label>
                      <p className="text-sm text-muted-foreground">
                        Can publish without editorial review
                      </p>
                    </div>
                    <Switch
                      id="canPublishDirectly"
                      checked={formData.permissions?.canPublishDirectly}
                      onCheckedChange={(checked) => 
                        updateNestedFormData('permissions', 'canPublishDirectly', checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="canEditOthersContent">Can Edit Others' Content</Label>
                      <p className="text-sm text-muted-foreground">
                        Can edit content created by other authors
                      </p>
                    </div>
                    <Switch
                      id="canEditOthersContent"
                      checked={formData.permissions?.canEditOthersContent}
                      onCheckedChange={(checked) => 
                        updateNestedFormData('permissions', 'canEditOthersContent', checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="canManageCategories">Can Manage Categories</Label>
                      <p className="text-sm text-muted-foreground">
                        Can create and edit blog categories
                      </p>
                    </div>
                    <Switch
                      id="canManageCategories"
                      checked={formData.permissions?.canManageCategories}
                      onCheckedChange={(checked) => 
                        updateNestedFormData('permissions', 'canManageCategories', checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="canManageCourses">Can Manage Courses</Label>
                      <p className="text-sm text-muted-foreground">
                        Can create and edit course information
                      </p>
                    </div>
                    <Switch
                      id="canManageCourses"
                      checked={formData.permissions?.canManageCourses}
                      onCheckedChange={(checked) => 
                        updateNestedFormData('permissions', 'canManageCourses', checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="requiresApproval">Requires Editorial Approval</Label>
                      <p className="text-sm text-muted-foreground">
                        Content must be approved before publishing
                      </p>
                    </div>
                    <Switch
                      id="requiresApproval"
                      checked={formData.permissions?.requiresApproval}
                      onCheckedChange={(checked) => 
                        updateNestedFormData('permissions', 'requiresApproval', checked)
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="experience" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Aviation Experience</CardTitle>
                <CardDescription>
                  Professional aviation background and credentials
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="totalFlightHours">Total Flight Hours</Label>
                    <Input
                      id="totalFlightHours"
                      type="number"
                      value={formData.experience?.totalFlightHours || ''}
                      onChange={(e) => updateNestedFormData('experience', 'totalFlightHours', parseInt(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="yearsExperience">Years of Experience</Label>
                    <Input
                      id="yearsExperience"
                      type="number"
                      value={formData.experience?.yearsExperience || ''}
                      onChange={(e) => updateNestedFormData('experience', 'yearsExperience', parseInt(e.target.value))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Configure how the author receives notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="emailNotifications">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive email notifications for workflow updates
                    </p>
                  </div>
                  <Switch
                    id="emailNotifications"
                    checked={formData.notificationPreferences?.emailNotifications}
                    onCheckedChange={(checked) => 
                      updateNestedFormData('notificationPreferences', 'emailNotifications', checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="reviewReminders">Review Reminders</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive reminders for content pending review
                    </p>
                  </div>
                  <Switch
                    id="reviewReminders"
                    checked={formData.notificationPreferences?.reviewReminders}
                    onCheckedChange={(checked) => 
                      updateNestedFormData('notificationPreferences', 'reviewReminders', checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="publishingUpdates">Publishing Updates</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications when content is published
                    </p>
                  </div>
                  <Switch
                    id="publishingUpdates"
                    checked={formData.notificationPreferences?.publishingUpdates}
                    onCheckedChange={(checked) => 
                      updateNestedFormData('notificationPreferences', 'publishingUpdates', checked)
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-4 pt-6">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {isCreating ? 'Create Author' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default AuthorManagement
