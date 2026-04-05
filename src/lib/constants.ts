import {
  LayoutDashboard,
  Users,
  Briefcase,
  CheckSquare,
  Factory,
  Truck,
  Building2,
  Settings,
} from 'lucide-react'

export const NAV_ITEMS = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'Clients', href: '/clients', icon: Users },
  { label: 'Deals', href: '/deals', icon: Briefcase },
  { label: 'Tasks', href: '/tasks', icon: CheckSquare },
  { label: 'Production', href: '/production', icon: Factory },
  { label: 'Shipments', href: '/shipments', icon: Truck },
  { label: 'Vendors', href: '/vendors', icon: Building2 },
  { label: 'Settings', href: '/settings', icon: Settings },
]

export const DEAL_STAGES = [
  { value: 'lead', label: 'Lead', color: 'bg-slate-500' },
  { value: 'quoted', label: 'Quoted', color: 'bg-blue-500' },
  { value: 'negotiation', label: 'Negotiation', color: 'bg-purple-500' },
  { value: 'confirmed', label: 'Confirmed', color: 'bg-cyan-500' },
  { value: 'production', label: 'Production', color: 'bg-orange-500' },
  { value: 'ready_to_ship', label: 'Ready to Ship', color: 'bg-yellow-500' },
  { value: 'shipped', label: 'Shipped', color: 'bg-green-500' },
  { value: 'completed', label: 'Completed', color: 'bg-emerald-500' },
  { value: 'lost', label: 'Lost', color: 'bg-red-500' },
]

export const TASK_STATUSES = [
  { value: 'pending', label: 'Pending', color: 'bg-slate-500' },
  { value: 'doing', label: 'Doing', color: 'bg-blue-500' },
  { value: 'done', label: 'Done', color: 'bg-emerald-500' },
  { value: 'overdue', label: 'Overdue', color: 'bg-red-500' },
]

export const TASK_PRIORITIES = [
  { value: 'low', label: 'Low', color: 'bg-slate-500' },
  { value: 'medium', label: 'Medium', color: 'bg-blue-500' },
  { value: 'high', label: 'High', color: 'bg-orange-500' },
  { value: 'urgent', label: 'Urgent', color: 'bg-red-500' },
]

export const PRODUCTION_STATUSES = [
  { value: 'not_started', label: 'Not Started', color: 'bg-slate-500' },
  { value: 'in_progress', label: 'In Progress', color: 'bg-blue-500' },
  { value: 'quality_check', label: 'Quality Check', color: 'bg-purple-500' },
  { value: 'completed', label: 'Completed', color: 'bg-emerald-500' },
  { value: 'delayed', label: 'Delayed', color: 'bg-red-500' },
]

export const SHIPMENT_STATUSES = [
  { value: 'preparing', label: 'Preparing', color: 'bg-slate-500' },
  { value: 'dispatched', label: 'Dispatched', color: 'bg-blue-500' },
  { value: 'in_transit', label: 'In Transit', color: 'bg-purple-500' },
  { value: 'delivered', label: 'Delivered', color: 'bg-emerald-500' },
  { value: 'delayed', label: 'Delayed', color: 'bg-red-500' },
]

export const USER_ROLES = [
  { value: 'admin', label: 'Admin' },
  { value: 'manager', label: 'Manager' },
  { value: 'sales', label: 'Sales' },
  { value: 'production', label: 'Production' },
  { value: 'logistics', label: 'Logistics' },
]

export const PATCH_TYPES = [
  'Embroidered',
  'Woven',
  'Dye Sublimation',
  'Felt',
  'PVC',
  'Leather',
  'Chenille',
  'Blank',
  'Bullion Crest',
  'Combination',
]

export const BACKING_TYPES = [
  'Unbacked',
  'Plastic',
  'Heat Seal',
  'Hook & Loop',
  'Self Stick',
  'Pin',
  'Magnetic',
  'Not Sure',
]
