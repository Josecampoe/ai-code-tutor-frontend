import { useNavigate } from 'react-router-dom';
import { Code2, BookOpen, Zap, Shield, Save, CheckCircle2 } from 'lucide-react';

export function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      {/* ═══════════════════════════════════════════ NAVBAR ═══════════════════════════════════════════ */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 backdrop-blur-sm bg-white/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                <Code2 className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-semibold">
                AI<span className="text-purple-600">Code</span>Tutor
              </span>
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/learning')}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Learning
              </button>
              <button
                onClick={() => navigate('/practice')}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Practice with AI
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ═══════════════════════════════════════════ HERO SECTION ═══════════════════════════════════════════ */}
      <section className="pt-20 pb-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-[560px] mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-50 border border-purple-200 rounded-full text-sm text-purple-700 mb-6">
              <div className="w-2 h-2 bg-purple-600 rounded-full animate-pulse" />
              AI-powered programming tutor
            </div>

            {/* Heading */}
            <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Learn to code with an{' '}
              <span className="text-purple-600">intelligent tutor</span> by your side
            </h1>

            {/* Subtitle */}
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              AICodeTutor analyzes your code while you write, explains each part in plain language, 
              and suggests next steps — without giving away the answers. Learn by doing, guided every step of the way.
            </p>

            {/* CTA Buttons */}
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => navigate('/practice')}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                Start practicing
              </button>
              <button
                onClick={() => navigate('/learning')}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Explore courses
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════ MODES SECTION ═══════════════════════════════════════════ */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          {/* Section Label */}
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Choose your mode
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* ─────────────────────────────────────── Card 1: Practice with AI ─────────────────────────────────────── */}
            <div className="bg-white border-2 border-purple-300 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              {/* Icon */}
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                <Code2 className="w-6 h-6 text-purple-600" />
              </div>

              {/* Badge */}
              <div className="inline-block px-3 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full mb-3">
                AI EDITOR
              </div>

              {/* Title */}
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Practice with AI</h3>

              {/* Description */}
              <p className="text-gray-600 mb-6 leading-relaxed">
                The AI analyzes each function in real time, explains what it does, 
                and suggests next steps without solving it for you.
              </p>

              {/* Features */}
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Code editor with syntax highlighting</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Automatic code explanations</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Next step suggestions</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Undo/redo and version history</span>
                </li>
              </ul>

              {/* Button */}
              <button
                onClick={() => navigate('/practice')}
                className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center justify-center gap-2"
              >
                Go to editor
                <span>→</span>
              </button>
            </div>

            {/* ─────────────────────────────────────── Card 2: Learning ─────────────────────────────────────── */}
            <div className="bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-lg transition-shadow">
              {/* Icon */}
              <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6 text-teal-600" />
              </div>

              {/* Title */}
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Learning</h3>

              {/* Description */}
              <p className="text-gray-600 mb-6 leading-relaxed">
                Learn from scratch with short, clear lessons. From your first language to data structures, 
                design patterns, and best practices.
              </p>

              {/* Topic Chips */}
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="px-3 py-1 bg-teal-100 text-teal-700 text-sm font-medium rounded-full">
                  Python
                </span>
                <span className="px-3 py-1 bg-teal-100 text-teal-700 text-sm font-medium rounded-full">
                  Java
                </span>
                <span className="px-3 py-1 bg-teal-100 text-teal-700 text-sm font-medium rounded-full">
                  JavaScript
                </span>
                <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm font-medium rounded-full">
                  Data Structures
                </span>
                <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm font-medium rounded-full">
                  Design Patterns
                </span>
                <span className="px-3 py-1 bg-amber-100 text-amber-700 text-sm font-medium rounded-full">
                  OOP
                </span>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
                  Algorithms
                </span>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Lessons from zero level</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Interactive examples per topic</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Practice each lesson in the editor</span>
                </li>
              </ul>

              {/* Button */}
              <button
                onClick={() => navigate('/learning')}
                className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center justify-center gap-2"
              >
                Explore courses
                <span>→</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════ FEATURES ROW ═══════════════════════════════════════════ */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-12">
            {/* Feature 1 */}
            <div className="text-center">
              <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Zap className="w-7 h-7 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Real-time analysis</h3>
              <p className="text-gray-600 leading-relaxed">
                Detects functions and blocks as you write, no need to run the code
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center">
              <div className="w-14 h-14 bg-teal-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-7 h-7 text-teal-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Tutor, not generator</h3>
              <p className="text-gray-600 leading-relaxed">
                Guides and explains at every step, but never writes the project for you
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center">
              <div className="w-14 h-14 bg-amber-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Save className="w-7 h-7 text-amber-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Saved progress</h3>
              <p className="text-gray-600 leading-relaxed">
                Completed lessons and projects are saved so you can continue anytime
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════ FOOTER ═══════════════════════════════════════════ */}
      <footer className="border-t border-gray-200 py-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-600">
            AICodeTutor — University project · Data structures and software patterns
          </p>
          <div className="flex items-center gap-6">
            <a href="#about" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              About
            </a>
            <a href="#github" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
