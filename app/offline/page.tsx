import Link from 'next/link';
import { WifiOff, Camera } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function OfflinePage() {
  return (
    <div className="w-full min-h-[70dvh] flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto">
      <div className="w-20 h-20 rounded-3xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-6 border border-amber-500/20 shadow-2xl">
        <WifiOff className="w-10 h-10" />
      </div>

      <h1 className="text-2xl font-bold text-zinc-100 mb-2">You are Offline</h1>
      <p className="text-sm text-zinc-400 mb-8">
        Your photo booth remains completely functional offline! You can open the camera, apply live effects, take photos, and view your local gallery without internet.
      </p>

      <Link href="/booth">
        <Button variant="primary" size="lg">
          <Camera className="w-5 h-5" />
          <span>Launch Photo Booth</span>
        </Button>
      </Link>
    </div>
  );
}
