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
import type { ClientRow } from '@/services/clients.service'
import { cn } from '@/lib/utils'

interface ClientsTableProps {
  clients: ClientRow[]
}

export function ClientsTable({ clients }: ClientsTableProps) {
  return (
    <div className="rounded-md border animate-in fade-in duration-500 overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Company</TableHead>
            <TableHead>Contact Person</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>City</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.map((client, index) => (
            <TableRow 
              key={client.id}
              className={cn(
                "animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-both",
                `delay-[${index * 50}ms]`
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <TableCell>
                <Link
                  href={`/clients/${client.id}`}
                  className="font-medium text-primary hover:underline"
                >
                  {client.company_name}
                </Link>
              </TableCell>
              <TableCell>{client.contact_person || '—'}</TableCell>
              <TableCell>{client.email || '—'}</TableCell>
              <TableCell>{client.phone || '—'}</TableCell>
              <TableCell>{client.city || '—'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
