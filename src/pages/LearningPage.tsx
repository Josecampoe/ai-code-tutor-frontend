import { useNavigate } from 'react-router-dom';
import { useLearning } from '../hooks/useLearning';
import { LearningSidebar } from '../components/learning/sidebar/LearningSidebar';
import { LessonView } from '../components/learning/lesson/LessonView';
import { LanguageModal } from '../components/learning/modals/LanguageModal';
import { CompletionModal } from '../components/learning/modals/CompletionModal';

export function LearningPage() {
  const navigate = useNavigate();
  const {
    categories, selectedTopic, currentLesson, currentSectionIndex,
    selectedLanguage, selectedLevel, completedLevels, completedTopics,
    inProgressTopics, openCategories, isLoadingLesson, isGeneratingLesson,
    isCompletionModalOpen, isBookmarked, revealedHints, searchQuery,
    isLanguageModalOpen, toast, sections, scrollRef,
    handleTopicSelect, handleLanguageModalConfirm, handleLanguageModalCancel,
    handleCategoryToggle, handlePrevious, handleNext, handleComplete,
    handleNextLesson, handleLevelChange, handleBookmarkToggle,
    handleHintReveal, handleOpenInEditor, handleSearchChange,
    handleStepClick, setIsCompletionModalOpen,
  } = useLearning();

  const isLanguageTopic = selectedTopic?.categoryId === 'LANGUAGE';
  const selectedCategory = categories.find(c => c.id === selectedTopic?.categoryId);
  const firstLanguageTopic = categories.find(c => c.id === 'LANGUAGE')?.topics[0];

  return (
    <div className="h-screen flex overflow-hidden bg-white">
      <LearningSidebar
        categories={categories}
        selectedTopicId={selectedTopic?.id ?? null}
        completedTopics={completedTopics}
        inProgressTopics={inProgressTopics}
        openCategories={openCategories}
        searchQuery={searchQuery}
        onTopicSelect={handleTopicSelect}
        onCategoryToggle={handleCategoryToggle}
        onSearchChange={handleSearchChange}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        {isLoadingLesson && !currentLesson && (
          <div className="flex-1 p-5">
            {isGeneratingLesson && (
              <div className="flex items-center gap-2 bg-[#EEEDFE] rounded-lg px-[14px] py-[10px] mb-4">
                <svg className="w-4 h-4 text-[#534AB7] animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25"/>
                  <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75"/>
                </svg>
                <span className="text-[12px] text-[#3C3489]">Generating with AI...</span>
              </div>
            )}
            <div className="space-y-3">
              {[1, 2, 3].map(i => <div key={i} className="h-24 bg-[#F3F4F6] rounded-xl animate-pulse" />)}
            </div>
          </div>
        )}

        {!isLoadingLesson && !currentLesson && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#E5E7EB" strokeWidth="1" className="mx-auto mb-4">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
              </svg>
              <p className="text-[15px] font-medium text-[#9CA3AF] mb-1">Choose a topic to start learning</p>
              <p className="text-[13px] text-[#9CA3AF] mb-4">Select any topic from the sidebar</p>
              {firstLanguageTopic && (
                <button
                  onClick={() => handleTopicSelect(firstLanguageTopic)}
                  className="px-4 py-2 border border-[#E5E7EB] text-[#4B5563] rounded-lg text-[13px] hover:bg-[#F8F9FA] cursor-pointer transition-colors"
                >
                  Start with {firstLanguageTopic.name}
                </button>
              )}
            </div>
          </div>
        )}

        {currentLesson && (
          <LessonView
            lesson={currentLesson}
            sections={sections}
            currentSectionIndex={currentSectionIndex}
            selectedLanguage={selectedLanguage}
            selectedLevel={selectedLevel}
            completedLevels={completedLevels[selectedTopic?.id ?? ''] ?? []}
            isLanguageTopic={isLanguageTopic ?? false}
            isBookmarked={isBookmarked}
            isGeneratingLesson={isGeneratingLesson}
            revealedHints={revealedHints}
            scrollRef={scrollRef}
            topicName={selectedTopic?.name ?? ''}
            categoryName={selectedCategory?.name ?? ''}
            onPrevious={handlePrevious}
            onNext={handleNext}
            onComplete={handleComplete}
            onStepClick={handleStepClick}
            onHintReveal={handleHintReveal}
            onOpenInEditor={handleOpenInEditor}
            onLevelChange={handleLevelChange}
            onBookmarkToggle={handleBookmarkToggle}
            onPracticeClick={() => navigate(`/practice?topic=${encodeURIComponent(selectedTopic?.name ?? '')}&language=${encodeURIComponent(selectedLanguage)}`)}
            onLanguageChangeRequest={() => { if (selectedTopic) handleTopicSelect(selectedTopic); }}
          />
        )}
      </div>

      <LanguageModal isOpen={isLanguageModalOpen} onConfirm={handleLanguageModalConfirm} onClose={handleLanguageModalCancel} />

      <CompletionModal
        topicName={selectedTopic?.name ?? ''}
        level={selectedLevel}
        isOpen={isCompletionModalOpen}
        onClose={() => setIsCompletionModalOpen(false)}
        onPractice={() => navigate(`/practice?topic=${encodeURIComponent(selectedTopic?.name ?? '')}&language=${encodeURIComponent(selectedLanguage)}`)}
        onNextLesson={handleNextLesson}
      />

      {toast && (
        <div className="fixed bottom-6 right-6 bg-[#111827] text-white text-[13px] px-4 py-2.5 rounded-lg shadow-lg z-50">
          {toast}
        </div>
      )}
    </div>
  );
}
