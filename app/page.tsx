import Image from "next/image";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
            Solar Calculator for Commercial Vehicles
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Coming soon: Calculate your solar panel ROI and environmental impact
          </p>
          <div className="mt-8 text-green-600 dark:text-green-400 font-semibold">
            ✅ Deployed successfully on Vercel!
          </div>
        </div>
      </main>
    </div>
  );
}
