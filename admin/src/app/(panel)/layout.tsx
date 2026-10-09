import AccountMenu from "@/components/AccountMenu";
import AuthGuard from "@/components/AuthGuard";
import Sidebar from "@/components/Sidebar";

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="grid h-screen grid-cols-[auto_minmax(0,1fr)] bg-bg">
        <Sidebar />
        <main className="h-screen overflow-auto">
          <AccountMenu />
          <div className="mx-auto flex max-w-[1180px] flex-col gap-8 px-8 pb-8 pt-2">{children}</div>
        </main>
      </div>
    </AuthGuard>
  );
}
