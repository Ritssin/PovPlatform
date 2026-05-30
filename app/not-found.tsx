import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <p className="text-6xl font-bold text-slate-200 mb-4">404</p>
        <h1 className="text-xl font-bold text-slate-800 mb-2">Page not found</h1>
        <p className="text-slate-500 text-sm mb-6">The page you&apos;re looking for doesn&apos;t exist.</p>
        <Link href="/dashboard" className="bg-[#0049BD] text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-colors">
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
