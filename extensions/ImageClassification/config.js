export default {
  id: "IMAGE_CLASSIFICATION",
  name: "Image Classification",
  title: "การแยกแยะรูปภาพ (Image classification)",
  type: "Classifier",
  description: "",
  config: {}, // not use yet
  // model: {}, // json of pre-config Model Design, this will register auto by ExtensionManager
  instructions: {
    capture: "ImageClassification/Instructions/CaptureInstruction.vue",
    annotate: "ImageClassification/Instructions/AnnotateInstruction.vue",
    train: "ImageClassification/Instructions/TrainInstruction.vue",
  },

  //components : ['image_classification/components/Capture.vue'] // this will register auto by ExtensionManager
}
