import Navbar from "@/components/navigation/Navbar";
import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Nanograd",
  description:
    "A minimal deep learning library. Built with Rust and WebAssembly. Try it out!",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} lg:mb-8 mb-[250px] px-3`}>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
