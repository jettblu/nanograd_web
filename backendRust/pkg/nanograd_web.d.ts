/* tslint:disable */
/* eslint-disable */
/**
* @param {string} name
*/
export function greet(name: string): void;
/**
* @param {string} dataset
* @param {number} learning_rate
* @param {number} num_epochs
* @param {Uint32Array} hidden_layer_sizes
* @param {number} train_size
* @param {Function} fn_callback
* @returns {TrainingResult}
*/
export function run_gradient_sample(dataset: string, learning_rate: number, num_epochs: number, hidden_layer_sizes: Uint32Array, train_size: number, fn_callback: Function): TrainingResult;
/**
*/
export class TrainingResult {
  free(): void;
/**
* @param {Float64Array} loss
* @param {Uint32Array} network_dimensions
* @param {Float64Array} predictions
* @param {number} classification_error
*/
  constructor(loss: Float64Array, network_dimensions: Uint32Array, predictions: Float64Array, classification_error: number);
/**
*/
  classification_error: number;
/**
*/
  readonly get_classification_error: number;
/**
*/
  readonly get_loss: Float64Array;
/**
*/
  readonly get_network_dimensions: Uint32Array;
/**
*/
  readonly get_num_epochs: number;
/**
*/
  readonly get_predictions: Float64Array;
/**
*/
  new_loss: number;
/**
*/
  predictions: Float64Array;
}
/**
*/
export class UpdateResult {
  free(): void;
/**
* @param {number} loss
* @param {number} epoch
*/
  constructor(loss: number, epoch: number);
/**
* @returns {string}
*/
  to_json(): string;
/**
*/
  readonly get_epoch: number;
/**
*/
  readonly get_loss: number;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly greet: (a: number, b: number) => void;
  readonly __wbg_updateresult_free: (a: number) => void;
  readonly updateresult_new: (a: number, b: number) => number;
  readonly updateresult_get_epoch: (a: number) => number;
  readonly updateresult_to_json: (a: number, b: number) => void;
  readonly __wbg_trainingresult_free: (a: number) => void;
  readonly trainingresult_new: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => number;
  readonly trainingresult_get_loss: (a: number, b: number) => void;
  readonly trainingresult_get_network_dimensions: (a: number, b: number) => void;
  readonly trainingresult_get_num_epochs: (a: number) => number;
  readonly trainingresult_set_new_loss: (a: number, b: number) => void;
  readonly trainingresult_set_predictions: (a: number, b: number, c: number) => void;
  readonly trainingresult_set_classification_error: (a: number, b: number) => void;
  readonly trainingresult_get_classification_error: (a: number) => number;
  readonly trainingresult_get_predictions: (a: number, b: number) => void;
  readonly run_gradient_sample: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number) => number;
  readonly updateresult_get_loss: (a: number) => number;
  readonly __wbindgen_malloc: (a: number, b: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
  readonly __wbindgen_add_to_stack_pointer: (a: number) => number;
  readonly __wbindgen_free: (a: number, b: number, c: number) => void;
  readonly __wbindgen_exn_store: (a: number) => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;
/**
* Instantiates the given `module`, which can either be bytes or
* a precompiled `WebAssembly.Module`.
*
* @param {SyncInitInput} module
*
* @returns {InitOutput}
*/
export function initSync(module: SyncInitInput): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {InitInput | Promise<InitInput>} module_or_path
*
* @returns {Promise<InitOutput>}
*/
export default function __wbg_init (module_or_path?: InitInput | Promise<InitInput>): Promise<InitOutput>;
