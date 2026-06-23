import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { ContentArea } from './ContentArea';

export function AppShell() {
  return (
    <div className="h-full w-full flex overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <ContentArea />
      </div>
    </div>
  );
}
