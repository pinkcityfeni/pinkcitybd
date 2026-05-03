import { useEffect, useRef, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Camera } from 'lucide-react';

type Props = {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onDetected: (code: string) => void;
};

export default function BarcodeScannerDialog({ open, onOpenChange, onDetected }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const [error, setError] = useState<string>('');
  const [supported, setSupported] = useState<boolean>(true);
  const [manual, setManual] = useState('');

  const stop = () => {
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
  };

  useEffect(() => {
    if (!open) { stop(); return; }
    setError('');
    const hasDetector = typeof (window as any).BarcodeDetector !== 'undefined';
    setSupported(hasDetector);

    let cancelled = false;
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (cancelled) { stream.getTracks().forEach(t => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
        }
        if (!hasDetector) return;
        const Detector = (window as any).BarcodeDetector;
        const detector = new Detector({ formats: ['ean_13', 'ean_8', 'code_128', 'upc_a', 'upc_e', 'code_39', 'qr_code'] });
        let last = 0;
        const tick = async (ts: number) => {
          if (cancelled || !videoRef.current) return;
          if (ts - last > 250) {
            last = ts;
            try {
              const codes = await detector.detect(videoRef.current);
              if (codes && codes.length > 0) {
                const value = String(codes[0].rawValue || '').trim();
                if (value) {
                  onDetected(value);
                  onOpenChange(false);
                  return;
                }
              }
            } catch { /* ignore */ }
          }
          rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);
      } catch (e: any) {
        setError(e?.message || 'ক্যামেরা চালু করা যায়নি');
      }
    })();

    return () => { cancelled = true; stop(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const submitManual = () => {
    const v = manual.trim();
    if (!v) return;
    onDetected(v);
    setManual('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Camera className="h-5 w-5" /> Barcode Scan</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="relative aspect-video rounded-xl overflow-hidden bg-black">
            <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
            <div className="absolute inset-x-6 top-1/2 -translate-y-1/2 h-0.5 bg-primary/80 shadow-[0_0_12px_hsl(var(--primary))]" />
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
          {!supported && (
            <p className="text-xs text-muted-foreground">
              এই browser এ auto-detect support নেই। নিচে barcode টা manually লিখে দিন অথবা USB scanner দিয়ে input দিন।
            </p>
          )}
          <div className="flex gap-2">
            <Input
              autoFocus
              placeholder="Barcode manually লিখুন বা scanner দিয়ে scan করুন"
              value={manual}
              onChange={(e) => setManual(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); submitManual(); } }}
            />
            <Button type="button" onClick={submitManual}>Use</Button>
          </div>
          <Button type="button" variant="outline" className="w-full" onClick={() => onOpenChange(false)}>বাতিল</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}