import { AppHeader } from "./AppHeader";
import { BottomTabBar } from "./BottomTabBar";
import { SideNav } from "./SideNav";

interface AppShellProps {
  subtitle?: string;
  children: React.ReactNode;
}

export function AppShell({ subtitle, children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop sidebar — hidden on mobile/tablet */}
      <SideNav />

      {/* Main content column */}
      <div className="flex flex-col flex-1 min-w-0 lg:ml-56 xl:ml-64">
        {/* Mobile/tablet header — hidden on desktop */}
        <div className="lg:hidden">
          <AppHeader subtitle={subtitle} />
        </div>

        {/* Desktop page title strip */}
        {subtitle && (
          <div className="hidden lg:flex items-center px-6 py-4 border-b border-white/10 shrink-0">
            <h1 className="text-white font-bold text-lg">{subtitle}</h1>
          </div>
        )}

        {/* Scrollable page content */}
        <main className="flex-1 overflow-y-auto pb-20 lg:pb-8 overflow-x-hidden">
          {/* On desktop, constrain and center content */}
          <div className="lg:max-w-2xl lg:mx-auto">
            {children}
          </div>
        </main>

        {/* Mobile/tablet bottom tabs — hidden on desktop */}
        <div className="lg:hidden">
          <BottomTabBar />
        </div>
      </div>
    </div>
  );
}
