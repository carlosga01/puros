export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center">
      <main className="max-w-2xl">
        <h1 className="text-4xl sm:text-6xl font-bold mb-6">Puros</h1>
        <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-8">
          Your home for everything cigars.
        </p>
        <div className="text-sm text-gray-500 dark:text-gray-400 font-mono">
          Stay tuned for updates
        </div>
      </main>
    </div>
  );
}
