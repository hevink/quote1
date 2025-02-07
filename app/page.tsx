import QuoteBuilder from "@/components/QuoteBuilder"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 text-center mb-12">
          Contractor Quote Builder
        </h1>
        <QuoteBuilder />
      </div>
    </main>
  )
}

