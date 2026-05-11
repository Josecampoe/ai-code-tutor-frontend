import { useNavigate } from 'react-router-dom';

export function HeroSection() {
  const navigate = useNavigate();

  return (
    <section className="bg-white pt-[72px] pb-[64px] px-5 sm:px-[80px] flex flex-col items-center text-center">
      {/* Badge */}
      <div className="inline-flex items-center gap-2 bg-[#EEEDFE] text-[#3C3489] rounded-full px-[14px] py-1 text-[12px] font-medium mb-6">
        <div className="w-[6px] h-[6px] bg-[#534AB7] rounded-full" />
        AI-powered programming tutor
      </div>

      {/* H1 */}
      <h1 className="text-[26px] sm:text-[32px] font-medium text-[#111827] leading-[130%] max-w-[560px] mb-4">
        Learn to code with an{' '}
        <span className="text-[#534AB7]">intelligent tutor</span>{' '}
        by your side
      </h1>

      {/* Subtitle */}
      <p className="text-[15px] text-[#4B5563] max-w-[460px] leading-[170%] mb-8">
        AI analyzes your code in real-time, explains what it does, and suggests the next steps. No answers given — you learn by doing.
      </p>

      {/* CTA Buttons */}
      <div className="flex items-center gap-[10px]">
        <button
          onClick={() => navigate('/practice')}
          className="bg-[#534AB7] text-white px-[22px] py-[10px] rounded-lg text-[14px] font-medium hover:opacity-90 transition-opacity"
        >
          Start practicing →
        </button>
        <button
          onClick={() => navigate('/learning')}
          className="border border-[#E5E7EB] bg-transparent text-[#111827] px-[22px] py-[10px] rounded-lg text-[14px] font-medium hover:bg-gray-50 transition-colors"
        >
          Explore courses
        </button>
      </div>
    </section>
  );
}
