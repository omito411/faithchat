import Button from "@/components/Button";

export default function DonatePage() {
  return (
    <>
      <section className="curve-bottom bg-brand-500">
        <div className="max-w-3xl mx-auto px-4 py-16">
          <h1 className="text-3xl md:text-4xl font-bold text-white">Giving</h1>
          <p className="mt-4 text-white/90">
            We know that intimacy with God has the power to transform lives, and living generously is one way we can draw closer to Him.
          </p>
          <div className="mt-6 flex gap-3">
            <Button href="/about" variant="outline">About</Button>
            <Button href="/giving/help">Give now</Button>
          </div>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 py-10">
        <h2 className="text-xl font-semibold text-white">Giving Help</h2>
        <div className="mt-4 space-y-3 text-white/80">
          <p>• Giving FAQs</p>
          <p>• Receipts & Statements</p>
          <p>• Payment Methods</p>
        </div>
      </section>
    </>
  );
}
