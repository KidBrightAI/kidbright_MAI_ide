export default {
  id: "kidbright-mai-plus",
  name: "KidBright uAI plus",
  description: "บอร์ดสมองกลเพื่อการเรียนรู้ปัญญาประดิษฐ์",
  wsUrl: "ws://10.155.55.1:7899",
  wsShell: "wss://10.155.55.1:5050",
  camera: {
    type: "mjpeg",
    port: 8000,
  },
  image: "images/board.png",
  protocol: "websocket-shell",
  version: "1.0.0",
  chip: "RISC-V",
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

  // MaixCAM support matrix (what this board has been tested with):
  //   Image   — all MobileNet alphas + ResNet-18 run through the CV181x
  //             MLIR→cvimodel pipeline; default = mobilenet-100.
  //   YOLO    — yolo11n / yolo11s (slim_yolo_v2 uses AWNN which CV181x
  //             doesn't run).
  //   Voice   — voice-cnn only (resnet18 path not validated here).
  modelDefaults: {
    IMAGE_CLASSIFICATION: {
      ImageClassification: { modelType: "mobilenet-100" },
    },
    OBJECT_DETECTION: {
      YOLO: { modelType: "yolo11n" },
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
      YOLO: { modelType: ["yolo11n", "yolo11s"] },
    },
    VOICE_CLASSIFICATION: {
      CNNVoice: { modelType: ["voice-cnn"] },
    },
  },
}
