import Link from "next/link";
import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="absolute top-8 left-8">
        <Link href="/" className="flex items-center gap-2 text-foreground">
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-red-500 to-yellow-500 bg-clip-text text-transparent">
            Moovie
          </h1>
        </Link>
      </div>
      {children}
    </div>
  );
}
