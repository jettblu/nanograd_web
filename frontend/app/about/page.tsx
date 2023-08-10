export default function About() {
  return (
    <div className="w-full mx-auto">
      <div className="">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-semibold text-left">Nanograd</h1>
          <p className="text-left text-purple-500 text-xl">
            A minimal deep learning library.
          </p>
        </div>
      </div>

      <div className="mt-4 prose-lg lg:prose-xl dark:text-gray-300 max-w-3xl mx-auto">
        <p>
          Modern deep learning frameworks are too big. PyTorch and TensorFlow
          are hundreds of thousands of lines of code; their immense complexity
          makes adding new features like hardware acceleration difficult.
        </p>
        <p>
          Nanograd is simple. Less code. Fewer operations. Built with Rust 🦀.
        </p>
        <p>
          {" "}
          <a
            href="https://github.com/jettblu/nanograd_web"
            className="text-purple-300 dark:text-purple-600 hover:text-purple-500 hover:dark:text-purple-500 hover:curosr-pointer transition-colors duration-200"
            target="_blank"
            rel="noopener noreferrer"
          >
            View Playground on GitHub
          </a>
        </p>

        <p>
          <a
            href="https://github.com/jettblu/nanograd"
            className="text-purple-300 dark:text-purple-600 hover:text-purple-500 hover:dark:text-purple-500 hover:curosr-pointer transition-colors duration-200"
            target="_blank"
            rel="noopener noreferrer"
          >
            View Nanograd on GitHub
          </a>
        </p>

        <h3>Features</h3>
        <p>
          Nanograd represents networks as a dynamic DAG. Optimization is handled
          by backpropagation. However, the DAG only operates over scalar values.
          This means every neuron is separated into many add and multiply
          operations: simple, but slow.
        </p>
        <p>The next version of nanograd will swap scalars with tensors.</p>
        <h3>How the Playground Works</h3>
        <p>
          The playground allows people to experiment with neural networks in the
          browser. Change hyperparameters, select a dataset, and add layers: all
          from a slick interface.
        </p>
        <p>
          Training requests are fulfilled by nanograd. Since nanograd is written
          in Rust, the code is first compiled into a WebAssembly Module (WASM).
        </p>
        <p>
          Model preferences are shared with a web worker, and the nanograd WASM
          executes on a separate thread. Results are sent back to the primary
          thread and displayed.
        </p>
      </div>
    </div>
  );
}
