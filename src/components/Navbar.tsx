import { SignedIn, UserButton } from '@clerk/nextjs';
import Link from 'next/link';

export default function Navbar() {
  return (
    <header className="w-full flex justify-between items-center p-4 bg-gray-800 text-white shadow">
      <Link href="/" className="text-2xl font-bold hover:underline">Palabrium</Link>
      <nav className="flex space-x-4">
        <SignedIn>
          <Link href="/my-stories" className="hover:underline">Mis Historias</Link>
          <Link href="/explore" className="hover:underline">Explorar</Link>
          <UserButton />
        </SignedIn>
      </nav>
    </header>
  );
}