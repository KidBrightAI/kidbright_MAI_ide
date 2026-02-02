export default {
  id: "VOICE_CLASSIFICATION",
  name: "Voice Classification",
  title: "Time series: การแยกแยะเสียง (Voice Classification)",
  type: "Classifier",
  description: "",
  options: {
    durations : {
      title: "Durations",
      type: 'number',
      value: 3,
    },
  }, // not use yet
  // model: {}, // json of pre-config Model Design, this will register auto by ExtensionManager
  instructions: {
    capture: "VoiceClassification/Instructions/CaptureInstruction.vue",
    annotate: "VoiceClassification/Instructions/AnnotateInstruction.vue",
    train: "VoiceClassification/Instructions/TrainInstruction.vue",
  },

  //components : ['image_classification/components/Capture.vue'] // this will register auto by ExtensionManager
}
  