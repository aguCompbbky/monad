"use client";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

const ErrorPage = ({ error, reset }: ErrorPageProps) => {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="card bg-base-200 border border-fuchsia-900/40 max-w-lg w-full shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-error">Bir hata olustu</h2>
          <p className="text-sm text-base-content/70 break-all">{error.message}</p>
          <div className="card-actions justify-end">
            <button className="btn btn-primary" onClick={reset}>
              Tekrar Dene
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;
