'use client'

import { useEffect, Suspense } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { toast } from 'sonner'

function SuccessToastContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const successMessage = searchParams.get('success')

  useEffect(() => {
    if (successMessage) {
      toast.success(decodeURIComponent(successMessage))
      
      // Clean the URL without triggering a back navigation (use replace)
      const params = new URLSearchParams(searchParams.toString())
      params.delete('success')
      const newQuery = params.toString()
      const newUrl = newQuery ? `${pathname}?${newQuery}` : pathname
      
      router.replace(newUrl, { scroll: false })
    }
  }, [successMessage, pathname, router, searchParams])

  return null
}

export function SuccessToast() {
  return (
    <Suspense fallback={null}>
      <SuccessToastContent />
    </Suspense>
  )
}
