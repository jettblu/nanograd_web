import Link from "next/link";
import Image from "next/image";
export default function Navbar() {
  return (
    <div className="z-10 w-full items-center justify-between font-mono text-sm lg:flex p-8 mb-6">
      <Link href="/" className="hover:cursor-pointer">
        <p className="fixed left-0 top-0 flex w-full justify-center border-b border-purple-300 bg-gradient-to-b from-purple-100/20 to-purple-100/60 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
          Deep Learning Playground
        </p>
      </Link>
      <div className="fixed bottom-0 left-0 flex flex-row h-48 w-full items-end justify-center bg-gradient-to-t from-white via-white dark:from-black dark:via-black lg:static lg:h-auto lg:w-auto lg:bg-none">
        <Link
          className="pointer-events-none flex place-items-center gap-2 p-8 lg:pointer-events-auto lg:p-0"
          href="/about"
        >
          Nanograd
          <Image
            src="/logo line.png"
            alt="Nanograd Logo"
            width={40}
            height={40}
          />
        </Link>
      </div>
    </div>
  );
}
