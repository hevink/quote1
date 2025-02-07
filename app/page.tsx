import QuoteBuilder from "@/components/QuoteBuilder";
import { AnimatedTestimonialsDemo } from "@/components/Testimonials";

export default function Home() {
  return (
    <main className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <QuoteBuilder />
      </div>
      <h2 className="text-2xl text-center font-semibold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent mt-16 mb-8">
        Testimonials
      </h2>
      <AnimatedTestimonialsDemo />
    </main>
  );
}
