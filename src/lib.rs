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
pub fn run_sample(learning_rate: f64, fn_callback: js_sys::Function) {
    let mlp = MLP::new(3, vec![4, 4, 1]);
    // our training data
    let xs = vec![
        vec![2.0, 3.0, -1.0],
        vec![3.0, -1.0, 0.5],
        vec![0.5, 1.0, 1.0],
        vec![1.0, 1.0, -1.0]
    ];

    // our ground truth
    let ys = vec![1.0, -1.0, -1.0, 1.0];
    // Training loop
    // We train the network for 100 iterations
    for _ in 0..100 {
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
}
