'use client'

import Link from 'next/link'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { VendorRow } from '@/services/vendors.service'
import { cn } from '@/lib/utils'

interface VendorsTableProps {
  vendors: VendorRow[]
}

export function VendorsTable({ vendors }: VendorsTableProps) {
  return (
    <div className="rounded-md border animate-in fade-in duration-500">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Vendor Name</TableHead>
            <TableHead>Contact Person</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Speciality</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vendors.map((vendor, index) => (
            <TableRow 
              key={vendor.id}
              className={cn(
                "animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-both",
                `delay-[${index * 50}ms]`
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <TableCell>
                <Link
                  href={`/vendors/${vendor.id}`}
                  className="font-medium text-primary hover:underline"
                >
                  {vendor.name}
                </Link>
              </TableCell>
              <TableCell>{vendor.contact_person || '—'}</TableCell>
              <TableCell>{vendor.email || '—'}</TableCell>
              <TableCell>{vendor.phone || '—'}</TableCell>
              <TableCell>{vendor.speciality || '—'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
