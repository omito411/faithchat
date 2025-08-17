// src/app/donate/page.tsx
export default function DonatePage() {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col">
        {/* HERO */}
        <section className="relative">
          <div className="bg-[#EF5350] pt-14 pb-24 text-center">
            <div className="text-sm opacity-90">Giving</div>
            <h1 className="text-4xl font-semibold mt-1">FaithChat</h1>
          </div>
          <svg
            className="absolute -bottom-1 left-0 w-full"
            viewBox="0 0 1440 96"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
          >
            <path d="M0,64 C240,16 480,16 720,64 C960,112 1200,112 1440,64 L1440,96 L0,96 Z" fill="#000" />
          </svg>
        </section>
  
        {/* CONTENT */}
        <section className="px-5 pt-10 pb-8 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">
            We’re grateful you’re a part of our FaithChat Community.
          </h2>
          <p className="text-neutral-300 text-base leading-relaxed mb-6">
            We know that intimacy with God has the power to transform lives, and living generously is one way we can draw closer to Him.
          </p>
          <div className="flex gap-3 mt-2">
            <a href="/" className="rounded-full px-5 py-3 bg-neutral-800 text-white shadow border border-neutral-700 hover:bg-neutral-700">
              Back to Chat
            </a>
            <a href="#give" className="rounded-full px-5 py-3 bg-white text-black shadow hover:bg-neutral-200">
              Give now
            </a>
          </div>
        </section>
      </div>
    );
  }
  