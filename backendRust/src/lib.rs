use js_sys::Function;
use serde::Deserialize;
use wasm_bindgen::prelude::*;
use nanograd::Value;
use nanograd::MLP;
use serde::Serialize;
use serde_json::from_str;

#[wasm_bindgen]
extern "C" {
    fn alert(s: &str);
}

#[wasm_bindgen]
pub fn greet(name: &str) {
    alert(&format!("Hello, {}!", name));
}

#[derive(Serialize, Deserialize)]
#[wasm_bindgen]
pub struct UpdateResult{
    loss: f64,
    epoch: u8,
}

#[wasm_bindgen]
impl UpdateResult{
    #[wasm_bindgen(constructor)]
    pub fn new(loss: f64, epoch: u8) -> UpdateResult {
        UpdateResult {
            loss,
            epoch,
        }
    }

    #[wasm_bindgen(getter)]
    pub fn get_loss(&self) -> f64 {
        self.loss
    }

    #[wasm_bindgen(getter)]
    pub fn get_epoch(&self) -> u8 {
        self.epoch
    }

    // to json string
    pub fn to_json(&self) -> String {
        serde_json::to_string(self).unwrap()
    }
}

#[wasm_bindgen]
pub struct TrainingResult {
    loss: Vec<f64>,
    network_dimensions: Vec<usize>,
    num_epochs: u8,
    predictions: Vec<f64>,
    classification_error: f64,
}

#[wasm_bindgen]
impl TrainingResult {
    #[wasm_bindgen(constructor)]
    pub fn new(loss: Vec<f64>, network_dimensions: Vec<usize>, predictions:Vec<f64>, classification_error:f64) -> TrainingResult {
        TrainingResult {
            loss,
            network_dimensions,
            num_epochs: 0,
            predictions,
            classification_error,
        }
    }

    #[wasm_bindgen(getter)]
    pub fn get_loss(&self) -> Vec<f64> {
        self.loss.clone()
    }
    #[wasm_bindgen(getter)]
    pub fn get_network_dimensions(&self) -> Vec<usize> {
        self.network_dimensions.clone()
    }
    #[wasm_bindgen(getter)]
    pub fn get_num_epochs(&self) -> u8 {
        self.num_epochs
    }

    #[wasm_bindgen(setter)]
    pub fn set_new_loss(&mut self, loss: f64) {
        self.loss.push(loss);
    }

    #[wasm_bindgen(setter)]
    pub fn set_predictions(&mut self, predictions: Vec<f64>) {
        self.predictions = predictions;
    }

    #[wasm_bindgen(setter)]
    pub fn set_classification_error(&mut self, classification_error: f64) {
        self.classification_error = classification_error;
    }

    #[wasm_bindgen(getter)]
    pub fn get_classification_error(&self) -> f64 {
        self.classification_error
    }

    #[wasm_bindgen(getter)]
    pub fn get_predictions(&self) -> Vec<f64> {
        self.predictions.clone()
    }
}

#[derive(Deserialize)]
struct Observation {
    features: Vec<f64>,
    label: f64,
}

#[wasm_bindgen]
pub fn run_gradient_sample(dataset:String, learning_rate: f64, num_epochs: u8, hidden_layer_sizes:Vec<usize>, train_size:u8, fn_callback: Function) -> TrainingResult{
    // assuming 2 input features
    let input_count = 2;
    let mut new_output_dims = hidden_layer_sizes.clone();
    // have final output layer be 1
    new_output_dims.push(1);
    let mlp = MLP::new(input_count, new_output_dims );
    // load data set from json string
    let data: Vec<Observation> = from_str(&dataset).unwrap();
    // set train xs and ys
    let train_xs: Vec<Vec<f64>> = data.iter().map(|o| o.features.clone()).take(train_size as usize).collect::<Vec<Vec<f64>>>();
    let train_ys: Vec<f64> = data.iter().map(|o| o.label).take(train_size as usize).collect::<Vec<f64>>();
    // set test xs and ys
    let test_xs: Vec<Vec<f64>> = data.iter().map(|o| o.features.clone()).skip(train_size as usize).collect::<Vec<Vec<f64>>>();
    let test_ys: Vec<f64> = data.iter().map(|o| o.label).skip(train_size as usize).collect::<Vec<f64>>();
    // combine input count and hidden layer sizes for network dimensions
    let mut layer_sizes = hidden_layer_sizes.clone();
    layer_sizes.insert(0, input_count);
    // insert one for output layer... assuming classification task
    layer_sizes.push(1);
    let mut training_result = TrainingResult::new(vec![], layer_sizes, vec![], 0.0);
    // Training loop
    // We train the network for 100 iterations
    for i in 0..num_epochs {
        // Forward pass
        let ypred: Vec<Value> = train_xs
            .iter()
            .map(|x|
                mlp
                    .forward(
                        x
                            .iter()
                            .map(|x| Value::from(*x))
                            .collect()
                    )[0]
                    .clone()
            )
            .collect();

        // Loss function
        // Here we use the sum of squared errors
        // Read more about it here: https://en.wikipedia.org/wiki/Residual_sum_of_squares
        let ygt = train_ys.iter().map(|y| Value::from(*y));
        let loss: Value = ypred
            .into_iter()
            .zip(ygt)
            .map(|(yp, yg)| (yp - yg).pow(&Value::from(2.0)))
            .sum();

        training_result.loss.push(loss.data());
        training_result.set_predictions(train_ys.clone());
        let new_update = UpdateResult::new(loss.data(), i);
        // run callback after converting to json string
        let _ = fn_callback.call1(&JsValue::NULL, &JsValue::from(new_update.to_json()));
        // Backward pass
        // Note that we clear the gradients before each backward pass
        // This prevents gradients from accumulating
        mlp.parameters()
            .iter()
            .for_each(|p| p.clear_gradient());
        loss.backward();
        // Adjustment
        // Here we use a learning rate of 0.05
        mlp.parameters()
            .iter()
            .for_each(|p| p.adjust(-learning_rate));
    }
            // run forward pass on test set
        let test_ypred: Vec<Value> = test_xs
            .iter()
            .map(|x|
                mlp
                    .forward(
                        x
                            .iter()
                            .map(|x| Value::from(*x))
                            .collect()
                    )[0]
                    .clone()
            )
            .collect();
        // compute classification error
        let test_ypred_floats: Vec<f64> = test_ypred
            .iter()
            .map(|v| v.data())
            .collect();
        // convert to 0 or 1
        let mut test_predictions: Vec<f64> = test_ypred_floats.clone();
        test_predictions.iter_mut().for_each(|p| {
            if *p > 0.5 {
                *p = 1.0;
            } else {
                *p = 0.0;
            }
        });
        let mut test_ys_copy = test_ys.clone();
        test_ys_copy.iter_mut().for_each(|p| {
            if *p > 0.5 {
                *p = 1.0;
            } else {
                *p = 0.0;
            }
        });
        let test_error = test_predictions
            .iter()
            .zip(test_ys_copy.iter())
            .filter(|(p, y)| p != y)
            .count() as f64 / test_predictions.len() as f64;
    // append new predictions to old predictions
    let mut all_preds = training_result.predictions.clone();
    // add new predictions to old predictions
    all_preds.extend(test_ypred_floats);
    training_result.set_predictions(all_preds);
    training_result.set_classification_error(test_error);
    training_result
}



