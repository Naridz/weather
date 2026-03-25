import Search from "@/components/Search";
import Head from "next/head";

export default function Home() {

  return (
    <>
    <Head>
      <title>Weather App</title>
      <meta name="description" content="Modern weather application" />
    </Head>
      <div className="min-h-screen flex justify-center items-center relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.3),transparent_70%)]" />
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500/30 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1.5s' }} />
        <div className="relative z-10 w-full px-4">
          <Search/>
        </div>
      </div>
    </>
  );
}
