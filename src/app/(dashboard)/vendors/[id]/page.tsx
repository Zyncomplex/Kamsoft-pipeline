import { getVendor } from '@/services/vendors.service'
import { getProductionByVendor } from '@/services/production.service'
import { PageHeader } from '@/components/shared/PageHeader'
import { buttonVariants } from '@/components/ui/button-variants'
import { ProductionTable } from '@/components/production/ProductionTable'
import { Edit, Trash2, ArrowLeft, Factory, Plus } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { DateDisplay } from '@/components/shared/DateDisplay'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { deleteVendorAction } from '../actions'
import { cn } from '@/lib/utils'

interface VendorDetailsPageProps {
  params: { id: string }
}

export default async function VendorDetailsPage({ params }: VendorDetailsPageProps) {
  const { id } = params
  const [vendor, production] = await Promise.all([
    getVendor(id),
    getProductionByVendor(id)
  ])

  if (!vendor || !vendor.is_active) {
    notFound()
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group">
        <Link href="/vendors" className="flex items-center gap-1">
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to Vendors
        </Link>
      </div>

      <PageHeader
        title={vendor.name}
        description={`Vendor ID: ${vendor.id.slice(0, 8)}...`}
        action={
          <div className="flex items-center gap-2">
            <Link 
              href={`/vendors/${id}/edit`} 
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
            <ConfirmDialog
              title="Delete Vendor"
              description={`Are you sure you want to delete ${vendor.name}? This will deactivate the record.`}
              confirmLabel="Delete"
              variant="destructive"
              onConfirm={async () => {
                'use server'
                await deleteVendorAction(id)
              }}
              triggerIcon={<Trash2 className="h-4 w-4" />}
              triggerLabel="Delete"
            />
          </div>
        }
      />

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Vendor Information</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Speciality</p>
              <p className="font-semibold">{vendor.speciality || '—'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Contact Person</p>
              <p className="font-semibold">{vendor.contact_person || '—'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p className="font-semibold">{vendor.email || '—'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Phone</p>
              <p className="font-semibold">{vendor.phone || '—'}</p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-sm font-medium text-muted-foreground">Address</p>
              <p className="font-semibold">{vendor.address || '—'}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">System Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Added On</p>
              <DateDisplay date={vendor.created_at} />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
              <DateDisplay date={vendor.updated_at} />
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle className="text-lg">Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm text-slate-600 italic">
              {vendor.notes || "No additional notes for this vendor."}
            </p>
          </CardContent>
        </Card>

        <div className="md:col-span-3 space-y-4">
          <div className="flex justify-between items-end px-1">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Factory className="h-4 w-4 text-white" />
              </div>
              <h2 className="text-xl font-bold tracking-tight">Active Production Orders</h2>
            </div>
            <Link 
              href={`/production/new?vendor_id=${id}`}
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-2")}
            >
              <Plus className="h-4 w-4" />
              New Order
            </Link>
          </div>
          <ProductionTable orders={production as any} />
        </div>
      </div>
    </div>
  )
}
