import QuoteBuilder from "@/components/QuoteBuilder";

export default function Home() {
  return (
    <main className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <QuoteBuilder />
      </div>
    </main>
  );
}
