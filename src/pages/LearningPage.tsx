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
          <div className="flex-1 p-5 space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-[#F3F4F6] rounded-xl animate-pulse" />
            ))}
          </div>
        )}

        {!isLoadingLesson && !currentLesson && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-12 h-12 bg-[#EEEDFE] rounded-xl flex items-center justify-center mx-auto mb-3">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#534AB7" strokeWidth="2">
                  <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
                </svg>
              </div>
              <p className="text-[14px] font-medium text-[#111827]">Select a topic to start learning</p>
              <p className="text-[12px] text-[#9CA3AF] mt-1">Choose any topic from the sidebar</p>
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

      <LanguageModal
        isOpen={isLanguageModalOpen}
        onConfirm={handleLanguageModalConfirm}
        onClose={handleLanguageModalCancel}
      />

      <CompletionModal
        topicName={selectedTopic?.name ?? ''}
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
