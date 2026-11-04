import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import TermsContent from '@/components/legal/TermsContent';

export const metadata = {
  title: 'Điều khoản & Quy định | Seenema',
};

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] transition-colors duration-200">
      <Header />
      <main className="animate-fade-in w-full flex-1 mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="border-b border-[var(--color-border-separator)] pb-6">
          <h1 className="text-3xl font-semibold tracking-tight">Điều khoản &amp; Quy định</h1>
          <p className="mt-2 text-xs text-[var(--color-text-tertiary)]">Cập nhật lần cuối: 22/10/2026</p>
        </div>

        <div className="mt-8">
          <TermsContent />
        </div>
      </main>
      <Footer />
    </div>
  );
}
