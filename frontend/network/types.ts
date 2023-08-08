export type ITrainingResult = {
  readonly get_loss: Float64Array;
  readonly get_network_dimensions: Uint32Array;
  readonly get_num_epochs: number;
  readonly get_classification_error: number;
  readonly get_predictions: Float64Array;
};

export type IUpdateResult = {
  readonly get_loss: number;
  readonly get_epoch: number;
};
