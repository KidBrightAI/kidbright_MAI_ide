export default {
  id: "kidbright-mai",
  name: "KidBright uAI",
  description: "บอร์ดสมองกลเพื่อการเรียนรู้ปัญญาประดิษฐ์",
  image: "images/board.png",
  protocol: "web-adb",
  version: "1.0.0",
  chip: "MaixII",
  firmware: [],
  usb: [
    {
      vendorId: 0x18d1,
      productId: 0x0002,
    },
  ],
  blocks: [
    "blocks/blocks_basic.js",
    "blocks/blocks_camera.js",
    "blocks/blocks_display.js",
    "blocks/blocks_image.js",
    "blocks/blocks_gpio.js",
    "blocks/blocks_ai.js",
    "blocks/generators_basic.js",
    "blocks/generators_image.js",
    "blocks/generators_camera.js",
    "blocks/generators_display.js",
    "blocks/generators_gpio.js",
    "blocks/generators_ai.js",
  ],
  autoCompletion: {},

  // V831 support matrix (what this board has been tested with):
  //   Image   — all MobileNet alphas + ResNet-18 run through the AWNN
  //             int8 pipeline; default = mobilenet-75 as a balance.
  //   YOLO    — only slim_yolo_v2 (YOLO11 needs CV181x MLIR, not AWNN).
  //   Voice   — only voice-cnn (runs CPU numpy fp32; int8 collapses).
  modelDefaults: {
    IMAGE_CLASSIFICATION: {
      ImageClassification: { modelType: "mobilenet-75" },
    },
    OBJECT_DETECTION: {
      YOLO: { modelType: "slim_yolo_v2" },
    },
    VOICE_CLASSIFICATION: {
      CNNVoice: { modelType: "voice-cnn" },
    },
  },
  modelOptions: {
    IMAGE_CLASSIFICATION: {
      ImageClassification: {
        modelType: ["mobilenet-100", "mobilenet-75", "mobilenet-50", "mobilenet-25", "mobilenet-10", "resnet18"],
      },
    },
    OBJECT_DETECTION: {
      YOLO: { modelType: ["slim_yolo_v2"] },
    },
    VOICE_CLASSIFICATION: {
      CNNVoice: { modelType: ["voice-cnn"] },
    },
  },
}
