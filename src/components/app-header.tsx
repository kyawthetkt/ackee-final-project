'use client'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Menu, X } from 'lucide-react'
// import { ThemeSelect } from '@/components/theme-select'
import { ClusterUiSelect } from './cluster/cluster-ui'
import { WalletButton } from '@/components/solana/solana-provider'

export function AppHeader({ links = [] }: { links: { label: string; path: string }[] }) {
  const pathname = usePathname()
  const [showMenu, setShowMenu] = useState(false)

  function isActive(path: string) {
    return path === '/' ? pathname === '/' : pathname.startsWith(path)
  }

  return (
    <header className="relative z-50 px-4 py-2 bg-secondary text-foreground mb-4">
      <div className="mx-auto flex justify-between items-center">
        {/* Logo + Links */}
        <div className="flex items-baseline gap-4">
          <Link className="text-xl hover:text-accent-foreground" href="/">
            <span className='text-bold'>Text Feed</span>
          </Link>
          <div className="hidden md:flex items-center">
            <ul className="flex gap-4 flex-nowrap items-center">
              {links.map(({ label, path }) => (
                <li key={path}>
                  <Link
                    className={`hover:text-accent-foreground transition-colors ${
                      isActive(path) ? 'text-accent-foreground font-semibold' : ''
                    }`}
                    href={path}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setShowMenu(!showMenu)}
        >
          {showMenu ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>

        {/* Desktop Right-side Controls */}
        <div className="hidden md:flex items-center gap-4">
          <WalletButton />
          <ClusterUiSelect />
          {/* <ThemeSelect /> */}
        </div>

        {/* Mobile Menu */}
        {showMenu && (
          <div className="md:hidden fixed inset-x-0 top-[52px] bottom-0 bg-background/95 backdrop-blur-sm border-t border-border">
            <div className="flex flex-col p-4 gap-4">
              <ul className="flex flex-col gap-4">
                {links.map(({ label, path }) => (
                  <li key={path}>
                    <Link
                      className={`block text-lg py-2 hover:text-accent-foreground transition-colors ${
                        isActive(path) ? 'text-accent-foreground font-semibold' : ''
                      }`}
                      href={path}
                      onClick={() => setShowMenu(false)}
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="flex flex-col gap-4">
                <WalletButton />
                <ClusterUiSelect />
                {/* <ThemeSelect /> */}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
