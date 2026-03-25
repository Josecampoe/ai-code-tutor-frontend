import { useAppContext } from '../../context/AppContext';
import { Button } from '../shared/Button';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { Save } from 'lucide-react';

export function EditorControls() {
  const { state, triggerAnalysis, saveSnapshot } = useAppContext();

  const handleAnalyze = () => {
    triggerAnalysis(state.code);
  };

  const handleSave = () => {
    saveSnapshot();
  };

  return (
    <div className="flex items-center justify-between px-4 py-2 bg-[#16162a] border-t border-[#2a2a3e] shrink-0">
      <div className="flex items-center gap-2">
        {state.isAnalyzing && (
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <LoadingSpinner size="sm" />
            <span>Analyzing...</span>
          </div>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={handleSave} title="Save snapshot to history">
          <Save className="w-3.5 h-3.5" />
          Save Snapshot
        </Button>
        <Button size="sm" onClick={handleAnalyze} loading={state.isAnalyzing}>
          Analyze Code
        </Button>
      </div>
    </div>
  );
}
