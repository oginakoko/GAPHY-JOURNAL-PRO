export function LoadingState({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] text-center p-8">
      <div className="w-12 h-12 mb-4 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
      <p className="text-white/90 text-lg font-medium">{message}</p>
      <p className="text-white/60 text-sm mt-2">Please wait while we fetch your data</p>
    </div>
  );
}