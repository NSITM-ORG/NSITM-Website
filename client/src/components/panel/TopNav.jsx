/**
 * TopNav — slim panel top bar: current page title (from route meta),
 * user email, theme toggle, and the decentralized logout trigger.
 */

import { Menu } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';
import { useLogout } from '../../hooks/useLogout.js';
import { ThemeToggle } from '../ui/ThemeToggle.jsx';
import { Button } from '../ui/Button.jsx';
import { LogOut } from 'lucide-react';

export function TopNav({ title, onOpenMobileSidebar }) {
  const { user } = useAuth();
  const { requestLogout } = useLogout();

  return (
    <header className="flex items-center justify-between border-b border-border bg-surface-elevated px-4 py-3 sm:px-6">
      <div className="flex items-center gap-3">
        <button onClick={onOpenMobileSidebar} className="text-text-secondary lg:hidden">
          <Menu size={22} />
        </button>
        <h1 className="font-heading text-lg font-semibold text-text-primary">{title}</h1>
      </div>

      <div className="flex items-center gap-4">
        <ThemeToggle />
        <span className="hidden text-sm text-text-secondary sm:inline">{user?.email}</span>
        <Button variant="outline" size="sm" icon={LogOut} onClick={requestLogout}>
          <span className="hidden sm:inline">Logout</span>
        </Button>
      </div>
    </header>
  );
}

export default TopNav;