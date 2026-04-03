import { getVendor } from '@/services/vendors.service'
import { PageHeader } from '@/components/shared/PageHeader'
import { VendorForm } from '@/components/vendors/VendorForm'
import { notFound } from 'next/navigation'

interface EditVendorPageProps {
  params: Promise<{ id: string }>
}

export default async function EditVendorPage({ params }: EditVendorPageProps) {
  const { id } = await params
  const vendor = await getVendor(id)

  if (!vendor || !vendor.is_active) {
    notFound()
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        title={`Edit ${vendor.name}`}
        description="Update vendor information and speciality details."
      />
      <VendorForm initialData={vendor} />
    </div>
  )
}
