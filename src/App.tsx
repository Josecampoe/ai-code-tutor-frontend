import { AppProvider } from './context/AppContext';
import { TopBar } from './components/TopBar/TopBar';
import { ProjectPanel } from './components/ProjectPanel/ProjectPanel';
import { EditorPanel } from './components/EditorPanel/EditorPanel';
import { FeedbackPanel } from './components/FeedbackPanel/FeedbackPanel';

export default function App() {
  return (
    <AppProvider>
      <div className="flex flex-col h-screen bg-[#1e1e2e] text-gray-100 overflow-hidden">
        <TopBar />
        <main className="flex flex-1 overflow-hidden">
          <ProjectPanel />
          <EditorPanel />
          <FeedbackPanel />
        </main>
      </div>
    </AppProvider>
  );
}
