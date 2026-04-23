"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, KeyRound, PackageCheck, Truck, X } from "lucide-react";
import { CatalogSlug } from "~~/constants/catalog";

export type DeliveryContext = {
  slug: CatalogSlug;
  title: string;
  priceMon: string;
  revealAt: number;
  orderId: bigint;
};

type DeliveryPinModalProps = {
  context: DeliveryContext | null;
  isConfirming: boolean;
  onClose: () => void;
  onConfirm: (slug: CatalogSlug, orderId: bigint, pinCode: string) => Promise<boolean> | boolean;
};

const REVEAL_DELAY_MS = 10_000;

export const DeliveryPinModal = ({ context, isConfirming, onClose, onConfirm }: DeliveryPinModalProps) => {
  const [now, setNow] = useState(() => Date.now());
  const [enteredPin, setEnteredPin] = useState("");
  const [fetchedPin, setFetchedPin] = useState<string | null>(null);
  const [pinError, setPinError] = useState<string | null>(null);
  const [isLoadingPin, setIsLoadingPin] = useState(false);

  useEffect(() => {
    if (!context) return;
    const interval = setInterval(() => setNow(Date.now()), 200);
    return () => clearInterval(interval);
  }, [context]);

  useEffect(() => {
    setEnteredPin("");
    setFetchedPin(null);
    setPinError(null);
  }, [context?.slug, context?.orderId]);

  const remainingMs = useMemo(() => {
    if (!context) return REVEAL_DELAY_MS;
    return Math.max(0, context.revealAt - now);
  }, [context, now]);

  const revealed = remainingMs === 0;
  const secondsLeft = Math.ceil(remainingMs / 1000);
  const progressPercent = context ? 100 - Math.min(100, Math.round((remainingMs / REVEAL_DELAY_MS) * 100)) : 0;

  // PIN'i modal açılır açılmaz arka planda çek (kargo simülasyonuyla paralel).
  useEffect(() => {
    if (!context) return;
    let cancelled = false;
    setIsLoadingPin(true);
    setPinError(null);
    fetch(`/api/cargo/pin?slug=${encodeURIComponent(context.slug)}`, { cache: "no-store" })
      .then(async res => {
        if (!res.ok) throw new Error("Kargodan PIN alınamadı");
        const body = (await res.json()) as { pin?: string };
        if (!cancelled) {
          if (body.pin) setFetchedPin(body.pin);
          else setPinError("Kargo PIN'i alınamadı, tekrar dene.");
        }
      })
      .catch(() => {
        if (!cancelled) setPinError("Kargo PIN'i alınamadı, tekrar dene.");
      })
      .finally(() => {
        if (!cancelled) setIsLoadingPin(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [context?.slug, context?.orderId]);

  const pinCorrect = revealed && fetchedPin !== null && enteredPin === fetchedPin;

  if (!context) return null;

  const handleConfirm = async () => {
    if (!pinCorrect || !fetchedPin) return;
    const success = await onConfirm(context.slug, context.orderId, fetchedPin);
    if (success) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" />

      <div className="relative w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl border border-purple-500/30 bg-gradient-to-br from-purple-950 via-[#0d052a] to-black shadow-2xl shadow-purple-900/40 animate-appear-up overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent" />

        <div className="flex items-center justify-between p-5 pb-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-900/50 border border-purple-500/30">
              {revealed ? (
                <PackageCheck className="w-5 h-5 text-emerald-300" />
              ) : (
                <Truck className="w-5 h-5 text-yellow-300 animate-pulse" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-black text-white leading-tight">
                {revealed ? "Ürün kapıda!" : "Kargo yola çıktı"}
              </h3>
              <p className="text-xs text-purple-300/70 mt-0.5">
                {context.title} · {context.priceMon} MON · #{context.orderId.toString()}
              </p>
            </div>
          </div>
          <button
            className="btn btn-ghost btn-sm btn-circle text-purple-400 hover:text-white"
            onClick={onClose}
            disabled={isConfirming}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {!revealed ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-yellow-500/30 bg-yellow-950/30 p-4 flex items-center gap-3">
                <span className="text-3xl font-black text-yellow-300 neon-text tabular-nums min-w-[3.5rem] text-center">
                  {secondsLeft}s
                </span>
                <div className="flex-1">
                  <p className="text-sm font-bold text-yellow-200">Kargo simülasyonu sürüyor…</p>
                  <p className="text-xs text-yellow-300/70 mt-0.5">
                    Ödemen kontrata kilitlendi. Kargo ulaşınca teslimat PIN&apos;i ekrana gelecek.
                  </p>
                </div>
              </div>

              <div className="h-2 w-full overflow-hidden rounded-full bg-purple-950/70 border border-purple-800/40">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-fuchsia-500 via-purple-400 to-violet-500 transition-all duration-150 ease-linear"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4">
                <p className="text-xs text-emerald-300/80 font-semibold tracking-wide uppercase mb-2">
                  Kargodan teslim PIN kodu
                </p>
                {fetchedPin ? (
                  <p className="text-4xl sm:text-5xl font-black text-center font-mono tracking-[0.4em] text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-cyan-300 neon-text">
                    {fetchedPin}
                  </p>
                ) : pinError ? (
                  <p className="text-sm text-red-400 text-center">{pinError}</p>
                ) : (
                  <div className="flex items-center justify-center gap-2 text-emerald-300/80">
                    <span className="loading loading-dots loading-md" />
                    <span className="text-xs">Kargo kodu okunuyor…</span>
                  </div>
                )}
                <p className="text-xs text-emerald-300/70 text-center mt-2">
                  Bu kodu aşağıya gir, escrow satıcıya bıraksın.
                </p>
              </div>
            </div>
          )}

          <label className="block">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-purple-300/80 mb-1.5">
              <KeyRound className="w-3.5 h-3.5" />
              PIN Kodunu Gir
            </span>
            <input
              className="input input-bordered w-full bg-black/40 border-purple-700/40 focus:border-purple-500/60 text-center text-2xl font-mono tracking-[0.4em] placeholder:text-purple-700/40 disabled:opacity-50"
              placeholder="••••••"
              value={enteredPin}
              maxLength={6}
              disabled={!revealed || !fetchedPin || isConfirming}
              onChange={e => setEnteredPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
            />
            <div className="flex justify-center gap-2 mt-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-all duration-200 ${
                    i < enteredPin.length
                      ? "bg-purple-400 shadow-[0_0_6px_2px_rgba(131,110,249,0.7)]"
                      : "bg-purple-900/50"
                  }`}
                />
              ))}
            </div>
          </label>

          {revealed && fetchedPin && enteredPin.length === 6 && !pinCorrect && (
            <p className="text-xs text-red-400 text-center">PIN eşleşmedi, ekrandaki kodu aynen gir.</p>
          )}

          {!isLoadingPin && fetchedPin === null && pinError && (
            <p className="text-xs text-red-400 text-center">{pinError}</p>
          )}
        </div>

        <div className="flex gap-2 px-5 pb-5">
          <button className="btn btn-ghost flex-1 text-purple-400" onClick={onClose} disabled={isConfirming}>
            Sonra
          </button>
          <button
            className="btn btn-primary flex-1 gap-2 font-bold"
            onClick={handleConfirm}
            disabled={!pinCorrect || isConfirming}
          >
            {isConfirming ? (
              <>
                <span className="loading loading-spinner loading-sm" />
                Serbest bırakılıyor…
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                PIN Onayla & Paraya Çevir
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
