function Loading({ message = "Loading..." }) {
  return (
    <div className="flex min-h-[calc(100vh-140px)] flex-col items-center justify-center bg-slate-50 px-4">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600"></div>
      {message && (
        <p className="mt-4 text-sm font-medium text-slate-500 animate-pulse">
          {message}
        </p>
      )}
    </div>
  );
}

export default Loading;

