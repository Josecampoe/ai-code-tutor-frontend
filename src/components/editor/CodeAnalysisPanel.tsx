import { useState } from 'react';
import { analyzeCodePedagogical } from '../../services/api';
import type { CodeAnalysisResponse } from '../../types';
import { Loader2, CheckCircle2, AlertCircle, Lightbulb, Code2 } from 'lucide-react';

interface CodeAnalysisPanelProps {
  code: string;
  language: string;
  projectDescription: string;
}

export function CodeAnalysisPanel({ code, language, projectDescription }: CodeAnalysisPanelProps) {
  const [analysis, setAnalysis] = useState<CodeAnalysisResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!code.trim()) {
      setError('Escribe algo de código primero para analizarlo');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await analyzeCodePedagogical({
        code,
        language,
        projectDescription,
      });
      setAnalysis(result);
    } catch (err) {
      setError('Error al analizar el código. Intenta de nuevo.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 4) return 'text-green-600';
    if (score >= 3) return 'text-yellow-600';
    return 'text-orange-600';
  };

  const getBlockTypeIcon = (type: string) => {
    switch (type) {
      case 'function': return '🔧';
      case 'class': return '📦';
      case 'loop': return '🔄';
      case 'conditional': return '🔀';
      case 'variable': return '📌';
      default: return '📝';
    }
  };

  return (
    <div className="h-full flex flex-col bg-white border-l border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Análisis de Código</h2>
        <button
          onClick={handleAnalyze}
          disabled={loading || !code.trim()}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Analizando...
            </>
          ) : (
            <>
              <Code2 className="w-4 h-4" />
              Analizar mi código
            </>
          )}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {analysis && (
          <>
            {/* Summary */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">Resumen</h3>
              <p className="text-blue-800 text-sm">{analysis.summary}</p>
            </div>

            {/* Code Quality */}
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900">Calidad del Código</h3>
                <div className={`flex items-center gap-1 font-bold text-lg ${getScoreColor(analysis.codeQuality.score)}`}>
                  {analysis.codeQuality.score}/5
                  {analysis.codeQuality.score >= 4 && <CheckCircle2 className="w-5 h-5" />}
                </div>
              </div>
              <p className="text-gray-700 text-sm">{analysis.codeQuality.feedback}</p>
            </div>

            {/* Error Hint */}
            {analysis.hasErrors && analysis.errorHint && (
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-orange-900 mb-1">Pista sobre el error</h3>
                    <p className="text-orange-800 text-sm">{analysis.errorHint}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Blocks */}
            {analysis.blocks.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900">Bloques de Código</h3>
                {analysis.blocks.map((block, idx) => (
                  <div key={idx} className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{getBlockTypeIcon(block.blockType)}</span>
                      <span className="font-mono text-sm font-semibold text-gray-900">
                        {block.blockName}
                      </span>
                      <span className="text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded">
                        {block.blockType}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 ml-7">{block.explanation}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Suggestions */}
            {analysis.suggestions.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-yellow-500" />
                  Sugerencias para Mejorar
                </h3>
                {analysis.suggestions
                  .sort((a, b) => a.order - b.order)
                  .map((suggestion) => (
                    <div key={suggestion.order} className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-6 h-6 bg-yellow-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                          {suggestion.order}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-yellow-900 mb-1">{suggestion.title}</h4>
                          <p className="text-sm text-yellow-800">{suggestion.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </>
        )}

        {!analysis && !loading && !error && (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 p-8">
            <Code2 className="w-16 h-16 mb-4 text-gray-300" />
            <p className="text-sm">Haz clic en "Analizar mi código" para recibir retroalimentación pedagógica</p>
          </div>
        )}
      </div>
    </div>
  );
}
