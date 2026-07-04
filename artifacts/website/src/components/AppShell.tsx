import { AppHeader } from "./AppHeader";
import { BottomTabBar } from "./BottomTabBar";

interface AppShellProps {
  subtitle?: string;
  children: React.ReactNode;
}

export function AppShell({ subtitle, children }: AppShellProps) {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppHeader subtitle={subtitle} />
      <main className="flex-1 pb-20 overflow-x-hidden">
        {children}
      </main>
      <BottomTabBar />
    </div>
  );
}
