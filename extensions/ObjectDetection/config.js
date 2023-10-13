export default {
  id: "OBJECT_DETECTION",
  name: "Object Detection",
  title: "การตรวจจับวัตถุ (Object detection)",
  type: "Detector",
  description: "",
  config: {}, // not use yet
  // model: {}, // json of pre-config Model Design, this will register auto by ExtensionManager
  instructions: {
    capture: "ObjectDetection/Instructions/CaptureInstruction.vue",
    annotate: "ObjectDetection/Instructions/AnnotateInstruction.vue",
    train: "ObjectDetection/Instructions/TrainInstruction.vue",
  },
};
