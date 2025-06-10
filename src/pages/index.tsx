import Searh from "@/components/Searh";
import Head from "next/head";

export default function Home() {

  return (
    <>
    <Head>
      <title>Weather App</title>
    </Head>
      <div className="bg-radial-[at_25%_25%] from-white to-zinc-900 to-75% min-h-screen flex justify-center items-center">
        <Searh/>
      </div>
    </>
  );
}
