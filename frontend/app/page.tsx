import React from "react";

import { GradientDescent } from "@/components/GradientDescent";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      <div className="mx-auto max-w-7xl w-full">
        <GradientDescent />
      </div>
    </main>
  );
}
