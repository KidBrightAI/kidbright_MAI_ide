importScripts("https://cdn.jsdelivr.net/npm/@tensorflow/tfjs");

let processing = false;
let sourceCode = "";

const MAX_BOXES = 10;
let __model = null;
let __anchors = [];
let __labels = [];
let __image = null;
let __data = null;
let __bboxes = [];
let __iouth = 0.5;
let __objth = 0.5;

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

const initModel = async function (iou_threshold, obj_threshold) {
  __iouth = iou_threshold;
  __objth = obj_threshold;
  postMessage({ command: "PRINT", msg: "Loading model\r\n" });
  await loadingModel();
  postMessage({ command: "PRINT", msg: "Loading labels\r\n" });
  postMessage({
    command: "PRINT",
    msg: "Label : " + __labels.join(",") + "\r\n",
  });
  postMessage({
    command: "PRINT",
    msg: "Anchors : " + __anchors.join(",") + "\r\n",
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

const __detect = async function (img, obj_threshold, iou_threshold) {
  let inputShape = __model.layers[0].inputSpec[0].shape;
  const batched = tf.tidy(() => {
    const normalized = tf.add(tf.mul(tf.cast(img, "float32"), 2 / 255.0), -1); //min -1 to max 1
    let resized = tf.image.resizeBilinear(
      normalized,
      [inputShape[1], inputShape[2]],
      true
    ); //alignCorners = true;
    const batched = tf.reshape(resized, [-1, inputShape[1], inputShape[2], 3]); //return tf.expandDims(img);
    return batched;
  });
  let res = await __model.predict(batched);
  //TODO : check img.shape, may be cast to [img.shape[1],img.shape[0]]
  //console.log("img shape = ", img.shape);
  let boxes = await postProcess(
    res,
    __anchors,
    __labels.length,
    __labels,
    [img.shape[0], img.shape[1]],
    MAX_BOXES,
    obj_threshold,
    iou_threshold
  );
  return boxes;
};

const detect = async function () {
  __image = await requestData("IMAGE");
  let __image_tensor = await tf.browser.fromPixels(__image);
  __bboxes = await __detect(__image_tensor, __objth, __iouth);
  postMessage({ command: "RESULT", data: __bboxes });
};

// this.result = __bboxes;
// this.term.write("\\rdetection result, found box(es) = " + __bboxes.length);
// if(this.result.length){
//   this.term.write(" (0 [" +
//     " x1:" + __bboxes[0].left.toFixed(1) +
//     " ,y1:" + __bboxes[0].top.toFixed(1) +
//     " ,x2:" + __bboxes[0].right.toFixed(1) +
//     " ,y2:" + __bboxes[0].bottom.toFixed(1) +
//     " ,area:" + __bboxes[0].area.toFixed(2) +
//     " ,label:" + __bboxes[0].class +
//     " ,prob:" + __bboxes[0].score.toFixed(4) +
//   " ])" );
// }

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

onmessage = async (event) => {
  if (event.data.command == "RUN") {
    sourceCode = event.data.code;
    __labels = event.data.labels;
    __anchors = event.data.anchors;
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
//========== yolo decoder ===========//
const yoloHead = function (feats, anchors, numClasses, inputShape) {
  const numAnchors = anchors.shape[0];
  const anchorsTensor = tf.reshape(anchors, [1, 1, numAnchors, 2]); //height, width, num_anchors, box_params
  const gridShape = feats.shape.slice(1, 3); //height, width
  const gridY = tf.tile(tf.reshape(tf.range(0, gridShape[0]), [-1, 1, 1, 1]), [
    1,
    gridShape[1],
    1,
    1,
  ]);
  const gridX = tf.tile(tf.reshape(tf.range(0, gridShape[1]), [1, -1, 1, 1]), [
    gridShape[0],
    1,
    1,
    1,
  ]);
  const grid = tf.concat([gridX, gridY], 3).cast(feats.dtype);
  feats = feats.reshape([
    gridShape[0],
    gridShape[1],
    numAnchors,
    numClasses + 5,
  ]);
  const [xy, wh, con, probs] = tf.split(feats, [2, 2, 1, numClasses], 3);
  const boxXy = tf.div(tf.add(tf.sigmoid(xy), grid), gridShape.reverse());
  const boxWh = tf.div(tf.mul(tf.exp(wh), anchorsTensor), inputShape.reverse());
  const boxConfidence = tf.sigmoid(con);
  const boxClassProbs = tf.softmax(probs);
  return [boxXy, boxWh, boxConfidence, boxClassProbs];
};
const yoloCorrectBoxes = function (boxXy, boxWh, imageShape) {
  const boxYx = tf.concat(tf.split(boxXy, 2, 3).reverse(), 3);
  const boxHw = tf.concat(tf.split(boxWh, 2, 3).reverse(), 3);
  // Scale boxes back to original image shape.
  const boxMins = tf.mul(tf.sub(boxYx, tf.div(boxHw, 2)), imageShape);
  const boxMaxes = tf.mul(tf.add(boxYx, tf.div(boxHw, 2)), imageShape);
  const boxes = tf.concat(
    [...tf.split(boxMins, 2, 3), ...tf.split(boxMaxes, 2, 3)],
    3
  );
  return boxes;
};

const yoloBoxesAndScores = function (
  feats,
  anchors,
  numClasses,
  inputShape,
  imageShape
) {
  const [boxXy, boxWh, boxConfidence, boxClassProbs] = yoloHead(
    feats,
    anchors,
    numClasses,
    inputShape
  );
  let boxes = yoloCorrectBoxes(boxXy, boxWh, imageShape);
  boxes = boxes.reshape([-1, 4]);
  let boxScores = tf.mul(boxConfidence, boxClassProbs);
  boxScores = tf.reshape(boxScores, [-1, numClasses]);
  return [boxes, boxScores];
};

const postProcess = async function (
  outputs,
  anchors,
  numClasses,
  classNames,
  imageShape,
  maxBoxes,
  scoreThreshold,
  iouThreshold
) {
  const [boxes, boxScores] = tf.tidy(() => {
    const anchorsTensor = tf.tensor1d(anchors).reshape([-1, 2]);
    const inputShape = outputs.shape.slice(1, 3); //[7,10]
    const [boxes, boxScores] = yoloBoxesAndScores(
      outputs,
      anchorsTensor,
      numClasses,
      inputShape,
      imageShape
    );
    return [boxes, boxScores];
  });

  let boxes_ = [];
  let scores_ = [];
  let classes_ = [];

  const _classes = tf.argMax(boxScores, -1);
  const _boxScores = tf.max(boxScores, -1);
  const nmsIndex = await tf.image.nonMaxSuppressionAsync(
    boxes,
    _boxScores,
    maxBoxes,
    iouThreshold,
    scoreThreshold
  );
  if (nmsIndex.size) {
    tf.tidy(() => {
      const classBoxes = tf.gather(boxes, nmsIndex);
      const classBoxScores = tf.gather(_boxScores, nmsIndex);
      classBoxes.split(nmsIndex.size).map((box) => {
        boxes_.push(box.dataSync());
      });
      classBoxScores.dataSync().map((score) => {
        scores_.push(score);
      });
      classes_ = _classes.gather(nmsIndex).dataSync();
    });
  }
  _boxScores.dispose();
  _classes.dispose();
  nmsIndex.dispose();
  boxes.dispose();
  boxScores.dispose();
  return boxes_.map((box, i) => {
    const top = Math.max(0, box[0]);
    const left = Math.max(0, box[1]);
    const bottom = Math.min(imageShape[0], box[2]);
    const right = Math.min(imageShape[1], box[3]);
    const height = bottom - top;
    const width = right - left;
    const area = width * height;
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    return {
      top,
      left,
      bottom,
      right,
      height,
      width,
      area,
      centerX,
      centerY,
      score: scores_[i],
      index: classes_[i],
      class: classNames[classes_[i]],
    };
  });
};
//============== end yolo decoder ==============//
