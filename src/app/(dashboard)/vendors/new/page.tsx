import { PageHeader } from '@/components/shared/PageHeader'
import { VendorForm } from '@/components/vendors/VendorForm'

export default function NewVendorPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        title="Add New Vendor"
        description="Fill in the details below to register a new vendor."
      />
      <VendorForm />
    </div>
  )
}
