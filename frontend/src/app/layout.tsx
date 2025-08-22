export default function DonatePage() {
  return (
    <div className="min-h-screen bg-faith-dark text-white flex flex-col">
      {/* HERO */}
      <section className="relative">
        <div className="bg-faith-red pt-14 pb-24 text-center">
          <div className="text-sm/none opacity-90">Giving</div>
          <h1 className="text-4xl font-semibold mt-1">FaithChat</h1>
          {/* optional right image area could go here */}
        </div>

        {/* Curved divider (SVG wave) */}
        <svg
          className="absolute -bottom-1 left-0 w-full"
          viewBox="0 0 1440 96"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          <path d="M0,64 C240,16 480,16 720,64 C960,112 1200,112 1440,64 L1440,96 L0,96 Z" fill="#0F0F0F" />
        </svg>
      </section>

      {/* CONTENT CARD AREA */}
      <section className="px-5 pt-10 pb-8">
        <h2 className="text-3xl font-bold mb-4">
          We’re grateful you’re a part of our FaithChat Community.
        </h2>

        <p className="text-neutral-300 text-base leading-relaxed mb-6">
          We know that intimacy with God has the power to transform lives,
          and living generously is one way we can draw closer to Him.
          Imagine what could happen when we partner together to help people
          around the world seek God every day!
        </p>

        <div className="flex gap-3 mt-4">
          <a
            href="https://your-site.example/about"
            className="rounded-full px-5 py-3 bg-neutral-800 text-white shadow border border-neutral-700 hover:bg-neutral-700"
          >
            About FaithChat
          </a>
          <a
            href="#give"
            className="rounded-full px-5 py-3 bg-white text-black shadow hover:bg-neutral-200"
          >
            Give now
          </a>
        </div>

        <hr className="border-neutral-800 my-8" />

        {/* Example list sections like “Giving Help” */}
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Giving Help</h3>
            <ul className="text-neutral-300 space-y-2">
              <li><a className="hover:underline" href="#faqs">Giving FAQs</a></li>
              <li><a className="hover:underline" href="#security">Donation security</a></li>
              <li><a className="hover:underline" href="#contact">Contact support</a></li>
            </ul>
          </div>
        </div>
      </section>

      {/* STICKY BOTTOM NAV (simple) */}
      <nav className="mt-auto sticky bottom-0 bg-black/80 backdrop-blur border-t border-neutral-800 text-neutral-300">
        <div className="max-w-screen-sm mx-auto flex justify-around py-3 text-sm">
          <a href="/" className="hover:text-white">Home</a>
          <a href="/auth" className="hover:text-white">Account</a>
          <a href="/donate" className="text-white font-medium">Give</a>
          <a href="https://bible.com" className="hover:text-white">Bible</a>
        </div>
      </nav>
    </div>
  );
}
