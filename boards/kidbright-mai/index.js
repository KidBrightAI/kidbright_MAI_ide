export default {
  id: "kidbright-mai",
  name: "KidBright uAI",
  description: "บอร์ดสมองกลเพื่อการเรียนรู้ปัญญาประดิษฐ์",
  image: "images/board.png",
  protocol: "web-adb",
  pictureDir: "/root",
  version: "1.0.0",
  chip: "MaixII",
  firmware: [],
  usb: [
    {
      vendorId: 0x18d1,
      productId: 0x0002,
    },
  ],
  // Scripts the IDE manages on this board. V1 has no boot-critical
  // scripts (mjpg/voice_stream are spawned on-demand), so needsReboot
  // is false everywhere — new copies take effect on the next session.
  // Hash-driven change detection; see V2 metadata for the design note.
  managedScripts: [
    { name: "mjpg.py",         version: "1.0.0", dest: "/root/scripts/mjpg.py",         needsReboot: false },
    { name: "voice_stream.py", version: "1.0.0", dest: "/root/scripts/voice_stream.py", needsReboot: false },
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
  //   Image   — ResNet-18 (default) runs end-to-end at ~16.5 fps on the AWNN
  //             NPU: all regular Conv + ReLU, zero DepthwiseConv, so every
  //             layer stays on NPU. MobileNet variants are available but
  //             slow (~1.8 fps) because V831 AWNN falls back to CPU for
  //             ConvolutionDepthWise regardless of activation type —
  //             measured 2026-04-19 with dog_cat_classify, 224×224 input.
  //   YOLO    — only slim_yolo_v2 (YOLO11 needs CV181x MLIR, not AWNN).
  //   Voice   — only voice-cnn (runs CPU numpy fp32; int8 collapses).
  modelDefaults: {
    IMAGE_CLASSIFICATION: {
      ImageClassification: { modelType: "resnet18" },
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
        // resnet18 first — it's the default and the only one that hits NPU speed.
        // mobilenet-* are kept for the size/accuracy tradeoff but run ~1.8 fps.
        modelType: ["resnet18", "mobilenet-100", "mobilenet-75", "mobilenet-50", "mobilenet-25", "mobilenet-10"],
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
