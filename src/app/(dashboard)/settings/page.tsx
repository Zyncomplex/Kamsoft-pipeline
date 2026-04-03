import { Settings } from 'lucide-react'

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">Manage your account and project preferences.</p>
      </div>
      <div className="rounded-lg border bg-card p-8">
        <div className="flex flex-col items-center gap-2 text-center py-12">
          <Settings className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">User and project settings will be implemented in Step 5 Polish.</p>
        </div>
      </div>
    </div>
  )
}
