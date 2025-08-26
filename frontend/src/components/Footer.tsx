export default function Footer() {
  const year = new Date().getFullYear();

    return (
      <footer className="mt-12 py-8 border-t text-center text-sm text-neutral-500">
        <div className="max-w-2xl mx-auto px-4">
          <p>© {year} Gospel AI. All rights reserved.</p>        </div>
      </footer>
    );
  }
  