importScripts("https://cdn.jsdelivr.net/npm/@tensorflow/tfjs");

let processing = false;
let sourceCode = "";

let __model = null;
let __labels = [];
let __image = null;
let __data = null;
let __maxIndex = 0;

let responseCallback = null;
let requestCommand = null;

const requestData = async function (cmd, addition) {
  requestCommand = cmd;
  let postMessageData = { command: "REQUEST", data: cmd };
  if (addition) {
    postMessageData = Object.assign(postMessageData, addition);
  }
  postMessage(postMessageData);
  let responseCommand = new Promise((resolve) => (responseCallback = resolve));
  let res = await responseCommand;
  return res;
};

const loadingModel = async function () {
  let modelInfo = await requestData("MODEL");
  __model = await tf.loadLayersModel(
    tf.io.fromMemory(
      modelInfo.modelJson.modelTopology,
      modelInfo.modelJson.weightsManifest[0].weights,
      modelInfo.weight
    )
  );
};

const __classify = async function (img) {
  let inputShape = __model.layers[0].inputSpec[0].shape;
  const batched = tf.tidy(() => {
    const normalized = tf.add(tf.mul(tf.cast(img, "float32"), 2 / 255.0), -1); //min -1 to max 1
    let resized = tf.image.resizeBilinear(
      normalized,
      [inputShape[1], inputShape[2]],
      true
    ); //alignCorners = true;
    const batched = tf.reshape(resized, [
      -1,
      inputShape[1],
      inputShape[2],
      inputShape[3],
    ]); //return tf.expandDims(img);
    return batched;
  });
  let res = await __model.predict(batched);
  return res;
};

const initModel = async function () {
  postMessage({ command: "PRINT", msg: "Loading model\r\n" });
  await loadingModel();
  postMessage({ command: "PRINT", msg: "Loading labels\r\n" });
  postMessage({
    command: "PRINT",
    msg: "Label : " + __labels.join(",") + "\r\n",
  });
  let inputShape = __model.layers[0].inputSpec[0].shape;
  postMessage({
    command: "PRINT",
    msg: "Model Input Shape : " + inputShape.join(",") + "\r\n",
  });
  postMessage({ command: "PRINT", msg: "Preloading model\r\n" });
  const zeroTensor = tf.zeros(
    [1, inputShape[1], inputShape[2], inputShape[3]],
    "int32"
  );
  const result = await __model.predict(zeroTensor);
  const res = await result.data();
  result.dispose();
  zeroTensor.dispose();
  postMessage({ command: "PRINT", msg: "Preload model success\r\n" });
  postMessage({ command: "PRINT", msg: "Model loaded\r\n" });
};

const classify = async function () {
  __image = await requestData("IMAGE");
  let __image_tensor = await tf.browser.fromPixels(__image);
  let __res = await __classify(__image_tensor);
  __data = __res.dataSync();
  __maxIndex = __res.argMax(1).dataSync()[0];
};

onmessage = async (event) => {
  if (event.data.command == "RUN") {
    sourceCode = event.data.code;
    __labels = event.data.labels;
    if (!processing) {
      processing = true;
      process();
    }
  } else if (event.data.command == "RESPONSE") {
    if (event.data.subcommand == requestCommand) {
      responseCallback(event.data.data);
    }
  }
};

const process = function () {
  try {
    eval(sourceCode);
  } catch (err) {
    postMessage({
      command: "PRINT",
      msg: "ERROR !!! \r\n" + err.message,
    });
  }
};
