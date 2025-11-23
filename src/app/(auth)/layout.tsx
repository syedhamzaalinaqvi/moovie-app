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
           <Image src="/moovie-logo.png" alt="Moovie Logo" width={110} height={32} />
        </Link>
      </div>
      {children}
    </div>
  );
}
