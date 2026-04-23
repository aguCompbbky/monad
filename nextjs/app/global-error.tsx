"use client";

type GlobalErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

const GlobalErrorPage = ({ error, reset }: GlobalErrorPageProps) => {
  return (
    <html lang="en">
      <body className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <div className="card bg-zinc-900 border border-fuchsia-900/40 max-w-lg w-full shadow-2xl">
          <div className="card-body">
            <h2 className="card-title text-error">Uygulama hatasi</h2>
            <p className="text-sm text-zinc-300 break-all">{error.message}</p>
            <div className="card-actions justify-end">
              <button className="btn btn-primary" onClick={reset}>
                Yeniden Yukle
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
};

export default GlobalErrorPage;
