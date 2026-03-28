<script setup lang="ts">
import { ref } from 'vue'
import { toast } from 'vue-sonner'
import {
  Plus,
  Edit,
  Download,
  Upload,
  Mail,
  Lock,
  EyeOff,
  Trash2,
  Copy,
  Info,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Settings,
  Bell,
  Calendar as CalendarIcon,
} from 'lucide-vue-next'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { DateTimePicker } from '@/components/ui/date-time-picker'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { format } from 'date-fns'
import type { DateValue } from '@internationalized/date'

const selectedDate = ref<DateValue>()
const selectedDateTime = ref<DateValue>()
const dialogOpen = ref(false)
const sheetOpen = ref(false)
const alertOpen = ref(false)
const switchChecked = ref(false)
const checkboxChecked = ref(false)
const radioValue = ref('option-1')
const selectValue = ref('')
const popoverOpen = ref(false)

const showToast = (type: 'success' | 'error' | 'warning' | 'info') => {
  switch (type) {
    case 'success':
      toast.success('Action completed successfully')
      break
    case 'error':
      toast.error('An error occurred')
      break
    case 'warning':
      toast.warning('Please review your input')
      break
    case 'info':
      toast.info('New information available')
      break
  }
}
</script>

<template>
  <TooltipProvider>
    <div class="page-view">
      <div class="page-header">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>UI Showcase</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <h1 class="page-title">UI Showcase</h1>
        <p class="page-subtitle">Enterprise-grade UI components for the IOI Shell platform</p>
      </div>

      <Tabs default-value="buttons" class="showcase-tabs">
        <TabsList class="showcase-tabs-list">
          <TabsTrigger value="buttons">Buttons</TabsTrigger>
          <TabsTrigger value="forms">Forms</TabsTrigger>
          <TabsTrigger value="navigation">Navigation</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
          <TabsTrigger value="data">Data Display</TabsTrigger>
          <TabsTrigger value="overlays">Overlays</TabsTrigger>
        </TabsList>

        <TabsContent value="buttons" class="showcase-content">
          <div class="showcase-section">
            <h2 class="showcase-section-title">Button Variants</h2>
            <div class="showcase-grid">
              <div class="showcase-item">
                <div class="showcase-item-title">Default</div>
                <div class="showcase-row">
                  <Button variant="default">Primary</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="outline">Outline</Button>
                </div>
              </div>
              <div class="showcase-item">
                <div class="showcase-item-title">Destructive</div>
                <div class="showcase-row">
                  <Button variant="destructive">Delete</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="link">Link</Button>
                </div>
              </div>
              <div class="showcase-item">
                <div class="showcase-item-title">Sizes</div>
                <div class="showcase-row">
                  <Button size="sm">Small</Button>
                  <Button size="default">Default</Button>
                  <Button size="lg">Large</Button>
                </div>
              </div>
              <div class="showcase-item">
                <div class="showcase-item-title">Icon Buttons</div>
                <div class="showcase-row">
                  <Button size="icon" variant="outline" aria-label="Add item">
                    <Plus class="icon-sm" />
                  </Button>
                  <Button size="icon" variant="secondary" aria-label="Settings">
                    <Settings class="icon-sm" />
                  </Button>
                  <Button size="icon" variant="ghost" aria-label="Notifications">
                    <Bell class="icon-sm" />
                  </Button>
                </div>
              </div>
              <div class="showcase-item">
                <div class="showcase-item-title">With Icon</div>
                <div class="showcase-row">
                  <Button>
                    <Download class="icon-sm" />
                    Download
                  </Button>
                  <Button variant="secondary">
                    <Upload class="icon-sm" />
                    Upload
                  </Button>
                </div>
              </div>
              <div class="showcase-item">
                <div class="showcase-item-title">Disabled</div>
                <div class="showcase-row">
                  <Button disabled>Disabled</Button>
                  <Button variant="secondary" disabled>Disabled</Button>
                </div>
              </div>
            </div>
          </div>

          <div class="showcase-section">
            <h2 class="showcase-section-title">Badges</h2>
            <div class="showcase-grid">
              <div class="showcase-item">
                <div class="showcase-item-title">Standard</div>
                <div class="showcase-row">
                  <Badge>Default</Badge>
                  <Badge variant="secondary">Secondary</Badge>
                  <Badge variant="destructive">Destructive</Badge>
                  <Badge variant="outline">Outline</Badge>
                </div>
              </div>
              <div class="showcase-item">
                <div class="showcase-item-title">Custom</div>
                <div class="showcase-row">
                  <span class="badge badge-primary">Primary</span>
                  <span class="badge badge-success">Success</span>
                  <span class="badge badge-warning">Warning</span>
                  <span class="badge badge-critical">Critical</span>
                  <span class="badge badge-neutral">Neutral</span>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="forms" class="showcase-content">
          <div class="showcase-section">
            <h2 class="showcase-section-title">Form Layout (2-Column Grid)</h2>
            <div class="form-example-card">
              <div class="form-grid">
                <div class="form-field form-field-full">
                  <Label for="title">Title</Label>
                  <Input id="title" placeholder="Enter title..." />
                </div>
                <div class="form-field">
                  <Label for="firstname">First Name</Label>
                  <Input id="firstname" placeholder="First name" />
                </div>
                <div class="form-field">
                  <Label for="lastname">Last Name</Label>
                  <Input id="lastname" placeholder="Last name" />
                </div>
                <div class="form-field">
                  <Label for="email">Email</Label>
                  <Input id="email" type="email" placeholder="email@example.com" />
                </div>
                <div class="form-field">
                  <Label for="phone">Phone</Label>
                  <Input id="phone" type="tel" placeholder="+1 (555) 000-0000" />
                </div>
                <div class="form-field">
                  <Label>Department</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="engineering">Engineering</SelectItem>
                      <SelectItem value="sales">Sales</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="hr">HR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div class="form-field">
                  <Label>Status</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div class="form-field">
                  <Label>Date</Label>
                  <Popover v-model:open="popoverOpen">
                    <PopoverTrigger as-child>
                      <Button variant="outline" class="form-date-trigger">
                        <CalendarIcon class="icon-sm" />
                        {{
                          selectedDate ? format(selectedDate.toDate('UTC'), 'PPP') : 'Pick a date'
                        }}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent class="popover-calendar" align="start">
                      <Calendar v-model="selectedDate" layout="month-and-year" />
                    </PopoverContent>
                  </Popover>
                </div>
                <div class="form-field">
                  <Label>Date & Time</Label>
                  <DateTimePicker v-model="selectedDateTime" placeholder="Select date and time" />
                </div>
                <div class="form-field form-field-full">
                  <Label>Description</Label>
                  <Input placeholder="Enter a detailed description..." />
                </div>
              </div>
              <div class="form-divider" />
              <div class="form-actions">
                <Button variant="outline">Cancel</Button>
                <Button>Save Changes</Button>
              </div>
            </div>
          </div>

          <div class="showcase-section">
            <h2 class="showcase-section-title">Individual Inputs</h2>
            <div class="showcase-grid">
              <div class="showcase-item">
                <div class="showcase-item-title">Text Input</div>
                <div class="form-stack">
                  <Label for="text-input">Label</Label>
                  <Input id="text-input" placeholder="Enter text..." />
                  <span class="form-helper">Helper text</span>
                </div>
              </div>
              <div class="showcase-item">
                <div class="showcase-item-title">With Icon</div>
                <div class="form-stack">
                  <Label for="icon-input">Email</Label>
                  <div class="input-with-icon">
                    <Mail class="input-icon" />
                    <Input id="icon-input" type="email" placeholder="email@example.com" />
                  </div>
                </div>
              </div>
              <div class="showcase-item">
                <div class="showcase-item-title">Password</div>
                <div class="form-stack">
                  <Label for="password-input">Password</Label>
                  <div class="input-with-icon">
                    <Lock class="input-icon" />
                    <Input id="password-input" type="password" placeholder="Enter password" />
                    <EyeOff class="input-icon-right" />
                  </div>
                </div>
              </div>
              <div class="showcase-item">
                <div class="showcase-item-title">Error State</div>
                <div class="form-stack">
                  <Label for="error-input">Email</Label>
                  <Input id="error-input" class="input-error" placeholder="email@example.com" />
                  <span class="form-error">Please enter a valid email</span>
                </div>
              </div>
            </div>
          </div>

          <div class="showcase-section">
            <h2 class="showcase-section-title">Checkbox & Switch</h2>
            <div class="showcase-grid">
              <div class="showcase-item">
                <div class="showcase-item-title">Checkbox</div>
                <div class="checkbox-stack">
                  <div class="checkbox-item">
                    <Checkbox id="terms" v-model:checked="checkboxChecked" />
                    <Label for="terms">I accept the terms</Label>
                  </div>
                  <div class="checkbox-item">
                    <Checkbox id="newsletter" />
                    <Label for="newsletter">Subscribe to newsletter</Label>
                  </div>
                  <div class="checkbox-item">
                    <Checkbox id="disabled-check" disabled />
                    <Label for="disabled-check">Disabled checkbox</Label>
                  </div>
                </div>
              </div>
              <div class="showcase-item">
                <div class="showcase-item-title">Switch</div>
                <div class="checkbox-stack">
                  <div class="checkbox-item">
                    <Switch id="notifications" v-model:checked="switchChecked" />
                    <Label for="notifications">Enable notifications</Label>
                  </div>
                  <div class="checkbox-item">
                    <Switch id="dark-mode" disabled />
                    <Label for="dark-mode">Dark mode (disabled)</Label>
                  </div>
                </div>
              </div>
              <div class="showcase-item">
                <div class="showcase-item-title">Radio Group</div>
                <div class="checkbox-stack">
                  <RadioGroup v-model="radioValue">
                    <div class="checkbox-item">
                      <RadioGroupItem id="radio-1" value="option-1" />
                      <Label for="radio-1">Option 1</Label>
                    </div>
                    <div class="checkbox-item">
                      <RadioGroupItem id="radio-2" value="option-2" />
                      <Label for="radio-2">Option 2</Label>
                    </div>
                    <div class="checkbox-item">
                      <RadioGroupItem id="radio-3" value="option-3" />
                      <Label for="radio-3">Option 3</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </div>
          </div>

          <div class="showcase-section">
            <h2 class="showcase-section-title">Date & Time Pickers</h2>
            <div class="showcase-grid showcase-grid-2col">
              <div class="showcase-item">
                <div class="showcase-item-title">Date Picker</div>
                <div class="form-stack">
                  <Label>Select Date</Label>
                  <Popover v-model:open="popoverOpen">
                    <PopoverTrigger as-child>
                      <Button variant="outline" class="form-date-trigger">
                        <CalendarIcon class="icon-sm" />
                        {{
                          selectedDate ? format(selectedDate.toDate('UTC'), 'PPP') : 'Pick a date'
                        }}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent class="popover-calendar" align="start">
                      <Calendar v-model="selectedDate" layout="month-and-year" />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              <div class="showcase-item">
                <div class="showcase-item-title">Date & Time Picker</div>
                <div class="form-stack">
                  <Label>Select Date & Time</Label>
                  <DateTimePicker v-model="selectedDateTime" placeholder="Pick date and time" />
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="navigation" class="showcase-content">
          <div class="showcase-section">
            <h2 class="showcase-section-title">Tabs</h2>
            <div class="showcase-grid">
              <div class="showcase-item showcase-item-wide">
                <div class="showcase-item-title">Tab Navigation</div>
                <Tabs default-value="account" class="demo-tabs">
                  <TabsList>
                    <TabsTrigger value="account">Account</TabsTrigger>
                    <TabsTrigger value="password">Password</TabsTrigger>
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                  </TabsList>
                  <TabsContent value="account">
                    <p class="tab-content">Account settings content</p>
                  </TabsContent>
                  <TabsContent value="password">
                    <p class="tab-content">Password settings content</p>
                  </TabsContent>
                  <TabsContent value="settings">
                    <p class="tab-content">General settings content</p>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>

          <div class="showcase-section">
            <h2 class="showcase-section-title">Dropdown Menu</h2>
            <div class="showcase-grid">
              <div class="showcase-item">
                <div class="showcase-item-title">Dropdown</div>
                <DropdownMenu>
                  <DropdownMenuTrigger as-child>
                    <Button variant="outline">Open Menu</Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Edit class="icon-sm" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Copy class="icon-sm" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem variant="destructive">
                      <Trash2 class="icon-sm" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>

          <div class="showcase-section">
            <h2 class="showcase-section-title">Accordion</h2>
            <div class="showcase-grid">
              <div class="showcase-item showcase-item-wide">
                <div class="showcase-item-title">Collapsible Sections</div>
                <Accordion type="single" collapsible>
                  <AccordionItem value="item-1">
                    <AccordionTrigger>What is this platform?</AccordionTrigger>
                    <AccordionContent>
                      This is a comprehensive training management platform designed for enterprise
                      use.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-2">
                    <AccordionTrigger>How do I get started?</AccordionTrigger>
                    <AccordionContent>
                      Navigate to the dashboard to see an overview of your training compliance
                      status.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-3">
                    <AccordionTrigger>Can I customize my profile?</AccordionTrigger>
                    <AccordionContent>
                      Yes, go to Settings to update your profile information and preferences.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="feedback" class="showcase-content">
          <div class="showcase-section">
            <h2 class="showcase-section-title">Toasts</h2>
            <div class="showcase-grid">
              <div class="showcase-item showcase-item-wide">
                <div class="showcase-item-title">Toast Notifications</div>
                <div class="showcase-row">
                  <Button @click="showToast('success')">
                    <CheckCircle2 class="icon-sm" />
                    Success
                  </Button>
                  <Button @click="showToast('error')">
                    <XCircle class="icon-sm" />
                    Error
                  </Button>
                  <Button @click="showToast('warning')">
                    <AlertTriangle class="icon-sm" />
                    Warning
                  </Button>
                  <Button @click="showToast('info')">
                    <Info class="icon-sm" />
                    Info
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div class="showcase-section">
            <h2 class="showcase-section-title">Tooltip</h2>
            <div class="showcase-grid">
              <div class="showcase-item">
                <div class="showcase-item-title">Tooltip on Hover</div>
                <div class="tooltip-demo">
                  <Tooltip>
                    <TooltipTrigger as-child>
                      <Button variant="outline">Hover me</Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>This is a tooltip</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </div>
          </div>

          <div class="showcase-section">
            <h2 class="showcase-section-title">Skeleton</h2>
            <div class="showcase-grid">
              <div class="showcase-item">
                <div class="showcase-item-title">Loading States</div>
                <div class="skeleton-demo">
                  <div class="skeleton-row">
                    <Skeleton class="skeleton-avatar" />
                    <div class="skeleton-text">
                      <Skeleton class="skeleton-line" />
                      <Skeleton class="skeleton-line-sm" />
                    </div>
                  </div>
                  <Skeleton class="skeleton-line" />
                  <Skeleton class="skeleton-line" />
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="data" class="showcase-content">
          <div class="showcase-section">
            <h2 class="showcase-section-title">Table</h2>
            <div class="showcase-grid">
              <div class="showcase-item showcase-item-full">
                <div class="showcase-item-title">Data Table</div>
                <Table class="dense-table">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead class="table-actions-header">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell class="table-name-cell">
                        <div class="table-user">
                          <div class="table-avatar">JD</div>
                          <span>John Doe</span>
                        </div>
                      </TableCell>
                      <TableCell>Engineering</TableCell>
                      <TableCell><span class="badge badge-success">Active</span></TableCell>
                      <TableCell class="table-actions-cell">
                        <DropdownMenu>
                          <DropdownMenuTrigger as-child>
                            <Button
                              variant="ghost"
                              size="icon"
                              class="table-action-btn"
                              aria-label="Actions"
                            >
                              <MoreHorizontal class="icon-xs" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>View Details</DropdownMenuItem>
                            <DropdownMenuItem>Edit Record</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem class="destructive-action">Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell class="table-name-cell">
                        <div class="table-user">
                          <div class="table-avatar">JS</div>
                          <span>Jane Smith</span>
                        </div>
                      </TableCell>
                      <TableCell>Marketing</TableCell>
                      <TableCell><span class="badge badge-warning">Pending</span></TableCell>
                      <TableCell class="table-actions-cell">
                        <DropdownMenu>
                          <DropdownMenuTrigger as-child>
                            <Button
                              variant="ghost"
                              size="icon"
                              class="table-action-btn"
                              aria-label="Actions"
                            >
                              <MoreHorizontal class="icon-xs" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>View Details</DropdownMenuItem>
                            <DropdownMenuItem>Edit Record</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem class="destructive-action">Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell class="table-name-cell">
                        <div class="table-user">
                          <div class="table-avatar">BJ</div>
                          <span>Bob Johnson</span>
                        </div>
                      </TableCell>
                      <TableCell>Sales</TableCell>
                      <TableCell><span class="badge badge-critical">Inactive</span></TableCell>
                      <TableCell class="table-actions-cell">
                        <DropdownMenu>
                          <DropdownMenuTrigger as-child>
                            <Button
                              variant="ghost"
                              size="icon"
                              class="table-action-btn"
                              aria-label="Actions"
                            >
                              <MoreHorizontal class="icon-xs" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>View Details</DropdownMenuItem>
                            <DropdownMenuItem>Edit Record</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem class="destructive-action">Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>

          <div class="showcase-section">
            <h2 class="showcase-section-title">Cards</h2>
            <div class="showcase-grid">
              <div class="showcase-item">
                <div class="showcase-item-title">Basic Card</div>
                <Card>
                  <CardHeader>
                    <CardTitle>Card Title</CardTitle>
                    <CardDescription>Card description text</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>Card content goes here</p>
                  </CardContent>
                </Card>
              </div>
              <div class="showcase-item">
                <div class="showcase-item-title">With Actions</div>
                <Card>
                  <CardHeader>
                    <CardTitle>User Profile</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div class="profile-card">
                      <Avatar class="profile-avatar">
                        <AvatarFallback>JD</AvatarFallback>
                      </Avatar>
                      <div class="profile-info">
                        <span class="profile-name">John Doe</span>
                        <span class="profile-email">john.doe@example.com</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          <div class="showcase-section">
            <h2 class="showcase-section-title">Avatar</h2>
            <div class="showcase-grid">
              <div class="showcase-item">
                <div class="showcase-item-title">Sizes</div>
                <div class="showcase-row">
                  <Avatar class="avatar-sm">
                    <AvatarFallback>SM</AvatarFallback>
                  </Avatar>
                  <Avatar>
                    <AvatarFallback>MD</AvatarFallback>
                  </Avatar>
                  <Avatar class="avatar-lg">
                    <AvatarFallback>LG</AvatarFallback>
                  </Avatar>
                </div>
              </div>
              <div class="showcase-item">
                <div class="showcase-item-title">With Image</div>
                <div class="showcase-row">
                  <Avatar>
                    <AvatarImage src="https://i.pravatar.cc/100?img=1" alt="User" />
                    <AvatarFallback>U1</AvatarFallback>
                  </Avatar>
                  <Avatar>
                    <AvatarImage src="https://i.pravatar.cc/100?img=2" alt="User" />
                    <AvatarFallback>U2</AvatarFallback>
                  </Avatar>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="overlays" class="showcase-content">
          <div class="showcase-section">
            <h2 class="showcase-section-title">Dialog</h2>
            <div class="showcase-grid">
              <div class="showcase-item">
                <div class="showcase-item-title">Modal Dialog</div>
                <Dialog v-model:open="dialogOpen">
                  <DialogTrigger as-child>
                    <Button variant="outline">Open Dialog</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Confirm Action</DialogTitle>
                      <DialogDescription>
                        Are you sure you want to proceed with this action? This cannot be undone.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button variant="secondary" @click="dialogOpen = false">Cancel</Button>
                      <Button @click="dialogOpen = false">Confirm</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>

          <div class="showcase-section">
            <h2 class="showcase-section-title">Sheet</h2>
            <div class="showcase-grid">
              <div class="showcase-item showcase-item-wide">
                <div class="showcase-item-title">Slide-out Panel</div>
                <Sheet v-model:open="sheetOpen">
                  <SheetTrigger as-child>
                    <Button variant="outline">Open Sheet</Button>
                  </SheetTrigger>
                  <SheetContent class="sheet-panel">
                    <SheetHeader>
                      <SheetTitle>Edit Record</SheetTitle>
                      <SheetDescription> Make changes to the record below. </SheetDescription>
                    </SheetHeader>
                    <div class="sheet-body">
                      <div class="form-grid">
                        <div class="form-field form-field-full">
                          <Label for="sheet-title">Title</Label>
                          <Input id="sheet-title" placeholder="Enter title..." />
                        </div>
                        <div class="form-field">
                          <Label for="sheet-name">First Name</Label>
                          <Input id="sheet-name" placeholder="Enter first name" />
                        </div>
                        <div class="form-field">
                          <Label for="sheet-lastname">Last Name</Label>
                          <Input id="sheet-lastname" placeholder="Enter last name" />
                        </div>
                        <div class="form-field">
                          <Label for="sheet-email">Email</Label>
                          <Input id="sheet-email" type="email" placeholder="email@example.com" />
                        </div>
                        <div class="form-field">
                          <Label for="sheet-phone">Phone</Label>
                          <Input id="sheet-phone" type="tel" placeholder="+1 (555) 000-0000" />
                        </div>
                        <div class="form-field">
                          <Label>Department</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Select department" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="engineering">Engineering</SelectItem>
                              <SelectItem value="sales">Sales</SelectItem>
                              <SelectItem value="marketing">Marketing</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div class="form-field">
                          <Label>Start Date</Label>
                          <DateTimePicker placeholder="Select date and time" />
                        </div>
                        <div class="form-field">
                          <Label>End Date</Label>
                          <DateTimePicker placeholder="Select date and time" />
                        </div>
                        <div class="form-field form-field-full">
                          <Label for="sheet-notes">Notes</Label>
                          <Input id="sheet-notes" placeholder="Additional notes..." />
                        </div>
                      </div>
                    </div>
                    <SheetFooter class="sheet-footer">
                      <div class="sheet-footer-left">
                        <Button variant="outline" @click="sheetOpen = false">Cancel</Button>
                      </div>
                      <div class="sheet-footer-right">
                        <Button @click="sheetOpen = false">Save Changes</Button>
                      </div>
                    </SheetFooter>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </div>

          <div class="showcase-section">
            <h2 class="showcase-section-title">Alert Dialog</h2>
            <div class="showcase-grid">
              <div class="showcase-item">
                <div class="showcase-item-title">Confirmation Dialog</div>
                <AlertDialog v-model:open="alertOpen">
                  <AlertDialogTrigger as-child>
                    <Button variant="destructive">Delete Account</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your account and
                        remove your data from our servers.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel @click="alertOpen = false">Cancel</AlertDialogCancel>
                      <AlertDialogAction @click="alertOpen = false">Continue</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  </TooltipProvider>
</template>

<style scoped>
.page-view {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.showcase-tabs {
  margin-top: var(--space-lg);
}

.showcase-tabs-list {
  display: flex;
  gap: var(--space-xs);
  padding: var(--space-xs);
  background-color: var(--bg-subtle);
  border-radius: var(--radius-lg);
  margin-bottom: var(--space-xl);
  flex-wrap: wrap;
}

.showcase-content {
  animation: slideIn 0.2s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.showcase-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-lg);
}

.showcase-grid-2col {
  grid-template-columns: repeat(2, 1fr);
}

.showcase-item-full {
  grid-column: 1 / -1;
}

.showcase-item-wide {
  grid-column: 1 / -1;
}

.icon-sm {
  width: 16px;
  height: 16px;
  margin-right: var(--space-xs);
}

.form-stack {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.form-helper {
  font-size: 0.75rem;
  color: var(--text-caption);
}

.form-error {
  font-size: 0.75rem;
  color: var(--brand-critical);
}

.input-with-icon {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: var(--space-sm);
  width: 16px;
  height: 16px;
  color: var(--text-caption);
  pointer-events: none;
  z-index: 1;
}

.input-icon-right {
  position: absolute;
  right: var(--space-sm);
  width: 16px;
  height: 16px;
  color: var(--text-caption);
  cursor: pointer;
  z-index: 1;
}

.input-with-icon :deep(input) {
  padding-left: 2.5rem;
  padding-right: 2.5rem;
}

.input-error {
  border-color: var(--brand-critical);
}

.checkbox-stack {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.checkbox-item {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.form-date-trigger {
  justify-content: flex-start;
  width: 100%;
}

.popover-calendar {
  width: auto;
  padding: 0;
}

.form-example-card {
  background-color: var(--bg-surface);
  border: var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-md) var(--space-lg);
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.form-field :deep([data-slot='input']),
.form-field :deep([data-slot='select-trigger']),
.form-field :deep(.date-time-trigger),
.form-field :deep(.form-date-trigger) {
  width: 100%;
}

.form-field-full {
  grid-column: 1 / -1;
}

.form-divider {
  height: 1px;
  background-color: var(--border);
  margin: var(--space-lg) 0;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-sm);
}

.demo-tabs {
  margin-top: var(--space-md);
}

.tab-content {
  padding: var(--space-md) 0;
  color: var(--text-body);
}

.tooltip-demo {
  display: flex;
  justify-content: center;
  padding: var(--space-lg);
}

.skeleton-demo {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.skeleton-row {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.skeleton-avatar {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-full);
}

.skeleton-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.skeleton-line {
  height: 16px;
  width: 100%;
}

.skeleton-line-sm {
  height: 12px;
  width: 60%;
}

.profile-card {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.profile-avatar {
  width: 48px;
  height: 48px;
}

.profile-info {
  display: flex;
  flex-direction: column;
}

.profile-name {
  font-weight: 500;
  color: var(--text-heading);
}

.profile-email {
  font-size: 0.875rem;
  color: var(--text-caption);
}

.avatar-sm {
  width: 32px;
  height: 32px;
}

.avatar-lg {
  width: 64px;
  height: 64px;
}

.table-actions-header {
  text-align: right;
}

.table-name-cell {
  font-weight: 500;
}

.table-actions-cell {
  text-align: right;
}

.sheet-panel {
  width: 800px !important;
  max-width: 90vw !important;
  padding: 0 !important;
}

.sheet-panel:deep([data-slot='sheet-content']) {
  width: 800px !important;
  max-width: 90vw !important;
}

.sheet-panel > div:first-child {
  padding: var(--space-lg);
}

.sheet-body {
  padding: var(--space-lg);
  overflow-y: auto;
  flex: 1;
}

.sheet-footer {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-md) var(--space-lg);
  border-top: var(--border-subtle);
  background-color: var(--bg-surface);
}

.sheet-footer-left {
  display: flex;
  gap: var(--space-sm);
}

.sheet-footer-right {
  display: flex;
  gap: var(--space-sm);
}

@media (max-width: 768px) {
  .showcase-grid {
    grid-template-columns: 1fr;
  }

  .showcase-item-wide {
    grid-column: 1;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .form-field-full {
    grid-column: 1;
  }
}
</style>
