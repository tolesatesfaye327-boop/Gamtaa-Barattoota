import { useEffect, useRef, useState } from "react";

export default function LuckyDrawWheel({
  tickets,
  autoSpin = false,
  showButton = true,
  onSpin,
  targetTicket = "",
}: {
  tickets: string[];
  autoSpin?: boolean;
  showButton?: boolean;
  onSpin?: () => void;
  targetTicket?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const autoSpinKey = useRef("");
  const size = 560;
  const colors = ["#0c3f77", "#ff4b26", "#f5b400", "#10bfa3"];

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!context || tickets.length === 0) return;

    const radius = size / 2;
    const arc = (2 * Math.PI) / tickets.length;
    context.clearRect(0, 0, size, size);

    tickets.forEach((ticket, index) => {
      const start = -Math.PI / 2 + index * arc;
      const end = start + arc;
      context.beginPath();
      context.moveTo(radius, radius);
      context.arc(radius, radius, radius - 10, start, end);
      context.fillStyle = colors[index % colors.length];
      context.fill();
      context.strokeStyle = "rgba(255,255,255,.32)";
      context.lineWidth = 2;
      context.stroke();

      context.save();
      context.translate(radius, radius);
      context.rotate(start + arc / 2);
      context.textAlign = "right";
      context.fillStyle = "white";
      context.font = `700 ${tickets.length > 18 ? 17 : 28}px Arial`;
      context.fillStyle = "#111827";
      context.fillText(ticket, radius - 40, 10);
      context.restore();
    });
  }, [tickets]);

  const spin = () => {
    if (spinning || tickets.length < 2) return;

    onSpin?.();

    const targetIndex = targetTicket ? tickets.indexOf(targetTicket) : -1;
    const winnerIndex = targetIndex >= 0 ? targetIndex : Math.floor(Math.random() * tickets.length);
    const segment = 360 / tickets.length;
    const segmentCenter = -90 + (winnerIndex + 0.5) * segment;
    const remainder = ((-90 - segmentCenter - rotation) % 360 + 360) % 360;
    const finalRotation = rotation + 360 * 7 + remainder;

    setSpinning(true);
    setSelectedTicket(null);
    setRotation(finalRotation);
    window.setTimeout(() => {
      setSelectedTicket(tickets[winnerIndex]);
      setSpinning(false);
    }, 5200);
  };

  useEffect(() => {
    const ticketKey = `${tickets.join("|")}|${targetTicket}`;
    if (!autoSpin) {
      autoSpinKey.current = "";
      return;
    }
    if (autoSpin && !spinning && ticketKey && ticketKey !== autoSpinKey.current) {
      autoSpinKey.current = ticketKey;
      spin();
    }
  }, [autoSpin, targetTicket, tickets, spinning]);

  if (tickets.length === 0) {
    return (
      <div className="flex min-h-40 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-500 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-400">
        The draw will open when paid tickets are available.
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-full max-w-[420px] aspect-square">
        <div className="absolute left-1/2 top-[-15px] z-20 -translate-x-1/2 border-l-[18px] border-r-[18px] border-t-[40px] border-l-transparent border-r-transparent border-t-[#f6b000] drop-shadow-lg" />
        <canvas
          ref={canvasRef}
          width={size}
          height={size}
          className="h-full w-full rounded-full bg-white shadow-[0_10px_25px_rgba(0,0,0,.3)] transition-transform duration-[5200ms] ease-[cubic-bezier(.17,.67,.22,1)]"
          style={{ transform: `rotate(${rotation}deg)` }}
        />
        <div className="absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_0_10px_rgba(0,0,0,.4)]" />
      </div>
      {showButton && (
        <button
          type="button"
          onClick={spin}
          disabled={spinning || tickets.length < 2}
          className="mt-[30px] inline-flex h-[45px] w-[150px] items-center justify-center rounded-lg border-0 bg-[#0d6efd] text-lg font-normal text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {spinning ? "SPINNING..." : "SPIN"}
        </button>
      )}
      {selectedTicket && (
        <div className="mt-4 rounded-xl border border-amber-400/50 bg-amber-50 px-5 py-3 text-center text-sm font-semibold text-amber-900 dark:bg-amber-400/10 dark:text-amber-200">
          Selected ticket: <span className="font-mono text-slate-950 dark:text-white">{selectedTicket}</span>
        </div>
      )}
      <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
        {tickets.length} eligible ticket{tickets.length === 1 ? "" : "s"}
      </p>
    </div>
  );
}
