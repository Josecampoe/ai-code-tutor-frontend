import { useNavigate } from 'react-router-dom';

export function Navbar() {
  const navigate = useNavigate();

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-[#E5E7EB] h-[56px] flex items-center px-5 sm:px-[80px]">
      <div className="flex items-center justify-between w-full">
        {/* Logo */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-[28px] h-[28px] bg-[#534AB7] rounded-[6px] flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="16 18 22 12 16 6" />
              <polyline points="8 6 2 12 8 18" />
            </svg>
          </div>
          <span className="text-[15px] font-medium text-[#111827]">AICodeTutor</span>
        </div>

        {/* Desktop buttons */}
        <div className="hidden sm:flex items-center gap-2">
          <button
            onClick={() => navigate('/login')}
            className="border border-[#E5E7EB] bg-transparent text-[#111827] px-4 py-[7px] rounded-lg text-[13px] font-medium hover:bg-gray-50 transition-colors"
          >
            Log in
          </button>
          <button
            onClick={() => navigate('/register')}
            className="bg-[#534AB7] text-white px-4 py-[7px] rounded-lg text-[13px] font-medium hover:opacity-90 transition-opacity"
          >
            Sign up
          </button>
          <button
            onClick={() => navigate('/learning')}
            className="border border-[#E5E7EB] bg-transparent text-[#111827] px-4 py-[7px] rounded-lg text-[13px] font-medium hover:bg-gray-50 transition-colors"
          >
            Learning
          </button>
          <button
            onClick={() => navigate('/practice')}
            className="bg-[#534AB7] text-white px-4 py-[7px] rounded-lg text-[13px] font-medium hover:opacity-90 transition-opacity"
          >
            Practice with AI
          </button>
        </div>

        {/* Mobile: only Sign up */}
        <div className="flex sm:hidden">
          <button
            onClick={() => navigate('/register')}
            className="bg-[#534AB7] text-white px-4 py-[7px] rounded-lg text-[13px] font-medium hover:opacity-90 transition-opacity"
          >
            Sign up
          </button>
        </div>
      </div>
    </nav>
  );
}
