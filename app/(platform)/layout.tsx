import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      {/* Top classification banner */}
      <div className="classification-banner">
        DEMO // UNCLASSIFIED // LTx OVERWATCH // SPACE AYE
      </div>

      <div className="flex">
        <Sidebar />
        <div className="flex-1 ml-16">
          <Header />
          <main className="h-[calc(100vh-22px-48px-22px)] overflow-auto">
            {children}
          </main>
        </div>
      </div>

      {/* Bottom classification banner */}
      <div className="classification-banner fixed bottom-0 left-0 right-0 z-50">
        DEMO // UNCLASSIFIED // LTx OVERWATCH // SPACE AYE
      </div>
    </div>
  );
}
