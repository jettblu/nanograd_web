"use client";

import { useState, createContext } from "react";
import type { ReactNode } from "react";

const initial: IWASMContext = {
  loadWASM: async () => false,
};

export const WASMContext = createContext(initial);

export const WASMContextProvider: React.FC<WASMContextProviderProps> = ({
  children,
}) => {
  async function loadWASMInternal() {
    if (state.nanograd) {
      console.log("WASM already loaded");
      return false;
    }
    console.log("Loading WASM...");
    const nanograd = await import("nanograd_web");
    await nanograd.default();
    console.log("WASM loaded");
    setState({ nanograd, loadWASM: loadWASMInternal });
    return true;
  }
  const [state, setState] = useState<IWASMContext>({
    ...initial,
    loadWASM: loadWASMInternal,
  });

  // This has to run only once: https://github.com/rustwasm/wasm-bindgen/issues/3153
  // Though, in development React renders twice when Strict Mode is enabled: https://reactjs.org/docs/strict-mode.html
  // That's why it must be limited to a single mount run

  loadWASMInternal();

  return <WASMContext.Provider value={state}>{children}</WASMContext.Provider>;
};

interface IWASMContext {
  nanograd?: typeof import("nanograd_web");
  loadWASM: () => Promise<boolean>;
}

interface WASMContextProviderProps {
  children: ReactNode;
}
