import { Oi } from "next/font/google";

const oi = Oi({
  subsets: ["latin"],
  weight: "400",
});

export default function ContactPage() {
  return (
    <div className="w-full h-screen">
      <div>
        <h1>Contact Page</h1>
        <p>This is the contact page</p>
      </div>

      <div className="px-2 md:px-4 w-full h-[90vh]">
        <div className="bg-gradient-to-b p-4 w-full h-full border-2 rounded-t-2xl from-violet-200 to-violet-600">
          <div className="relative h-full">
            <h1
              className={`${oi.className} absolute md:bottom-0 text-white left-0 text-5xl md:text-3xl xl:text-9xl font-bold`}
            >
              Hello
            </h1>
          </div>
        </div>
      </div>

      <footer className="w-full border-2">h1</footer>
    </div>
  );
}