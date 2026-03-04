import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="text-6xl mb-4">📋</div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">404</h1>
        <p className="text-gray-500 mb-6">Page not found</p>
        <Link href="/" className="bg-blue-900 text-white font-semibold px-8 py-3 rounded-xl hover:bg-blue-950 transition-colors inline-block">
          Back to Home
        </Link>
      </div>
    </div>
  );
}
