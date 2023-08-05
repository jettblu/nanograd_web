use wasm_bindgen::prelude::*;
use nanograd::Value;
use nanograd::MLP;

#[wasm_bindgen]
extern "C" {
    fn alert(s: &str);
}

#[wasm_bindgen]
pub fn greet(name: &str) {
    alert(&format!("Hello, {}!", name));
}

#[wasm_bindgen]
pub struct TrainingResult {
    loss: Vec<f64>,
    network_dimensions: Vec<usize>,
    num_epochs: u8,
    predictions: Vec<f64>
}

#[wasm_bindgen]
impl TrainingResult {
    #[wasm_bindgen(constructor)]
    pub fn new(loss: Vec<f64>, network_dimensions: Vec<usize>, predictions:Vec<f64>) -> TrainingResult {
        TrainingResult {
            loss,
            network_dimensions,
            num_epochs: 0,
            predictions
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
}

#[wasm_bindgen]
pub fn run_gradient_sample(learning_rate: f64, num_epochs: u8, hidden_layer_sizes:Vec<usize>, fn_callback: js_sys::Function) -> TrainingResult{
    let input_count = 3;
    let mut new_output_dims = hidden_layer_sizes.clone();
    // have final output layer be 1
    new_output_dims.push(1);
    let mlp = MLP::new(input_count, new_output_dims );
    // our training data
    let xs = vec![
        vec![2.0, 3.0, -1.0],
        vec![3.0, -1.0, 0.5],
        vec![0.5, 1.0, 1.0],
        vec![1.0, 1.0, -1.0]
    ];
    //combine input count and hidden layer sizes for network dimensions
    let mut layer_sizes = hidden_layer_sizes.clone();
    layer_sizes.insert(0, input_count);
    // our ground truth
    let ys = vec![1.0, -1.0, -1.0, 1.0];
    let mut training_result = TrainingResult::new(vec![], layer_sizes, vec![]);
    // Training loop
    // We train the network for 100 iterations
    for _ in 0..num_epochs {
        // Forward pass
        let ypred: Vec<Value> = xs
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
        let ypred_floats: Vec<f64> = ypred
            .iter()
            .map(|v| v.data())
            .collect();

        // Loss function
        // Here we use the sum of squared errors
        // Read more about it here: https://en.wikipedia.org/wiki/Residual_sum_of_squares
        let ygt = ys.iter().map(|y| Value::from(*y));
        let loss: Value = ypred
            .into_iter()
            .zip(ygt)
            .map(|(yp, yg)| (yp - yg).pow(&Value::from(2.0)))
            .sum();

        println!("Loss: {} Predictions: {:?}", loss.data(), ypred_floats);
        training_result.loss.push(loss.data());
        training_result.set_predictions(ys.clone());
        let res = fn_callback.call1(&JsValue::NULL, &JsValue::from_f64(loss.data()));
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
    training_result
}
