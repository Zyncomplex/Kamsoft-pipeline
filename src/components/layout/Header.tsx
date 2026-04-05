'use client'

import { usePathname } from 'next/navigation'
import { NAV_ITEMS } from '@/lib/constants'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { CircleUser, Menu } from 'lucide-react'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { GlobalSearch } from './GlobalSearch'

export function Header() {
  const pathname = usePathname()
  const currentTitle = NAV_ITEMS.find((item) => item.href === pathname)?.label ?? 'SalesOps CRM'

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
      <Sheet>
        <SheetTrigger
          render={
            <Button
              variant="outline"
              size="icon"
              className="shrink-0 md:hidden"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          }
        />
        <SheetContent side="left" className="flex flex-col">
          <nav className="grid gap-2 text-lg font-medium">
            <Link
              href="/"
              className="flex items-center gap-2 text-lg font-semibold"
            >
              <span className="text-xl">SalesOps CRM</span>
            </Link>
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground",
                  pathname === item.href && "bg-muted text-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-auto">
            <form action="/auth/signout" method="POST">
              <Button variant="ghost" className="w-full justify-start gap-2" type="submit">
                Sign Out
              </Button>
            </form>
          </div>
        </SheetContent>
      </Sheet>
      <div className="w-full flex-1 flex items-center justify-between">
        <h1 className="text-lg font-semibold md:text-xl hidden sm:block">{currentTitle}</h1>
        <GlobalSearch />
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="secondary" size="icon" className="rounded-full">
              <CircleUser className="h-5 w-5" />
              <span className="sr-only">Toggle user menu</span>
            </Button>
          }
        />
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem render={<Link href="/settings">Settings</Link>} />
          <DropdownMenuSeparator />
          <DropdownMenuItem
            render={
              <form action="/auth/signout" method="POST" className="w-full">
                <button type="submit" className="w-full text-left">Sign Out</button>
              </form>
            }
          />
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
