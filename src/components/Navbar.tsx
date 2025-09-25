import Link from 'next/link';

export default function Navbar() {
  return (
    <header className="w-full flex justify-between items-center p-4 bg-gray-800 text-white shadow">
      <Link href="/" className="text-2xl font-bold hover:underline">Palabrium</Link>
      <nav className="flex space-x-4">
        <Link href="/stories/mine" className="hover:underline">Mis Historias</Link>
        <Link href="/stories" className="hover:underline">Explorar</Link>
        <Link href="/sign-in" className="hover:underline">Sign In</Link>
      </nav>
    </header>
  );
}