# KidBright mAI IDE

Welcome to **KidBright mAI (Micro AI) IDE**, a powerful, web-based integrated development environment tailored for the KidBright mAI and mAI Plus boards.

This IDE empowers users to author logic using **Blockly** visual programming and write corresponding Python code for execution. Most importantly, it features an advanced pipeline for training AI models (Image Classification, Object Detection, Voice Classification) seamlessly using Google Colab integration. 

## 🌟 Key Features
- **Visual Programming**: Built on Google Blockly, enabling an intuitive drag-and-drop programming interface.
- **Python Code Generation**: Blocks are converted directly to Python syntax targeting KidBright mAI boards running a Linux/Maix-based runtime.
- **AI Model Pipelines**: Dedicated extensions allow users to capture datasets, annotate data, upload them to Colab for training, and deploy the resulting custom AI models directly to the board.
- **Hardware Integrations**: Support for various sensors, modules, and protocols (I2C, MQTT, NETPIE, DHT, SHT, etc.) out-of-the-box.
- **Dynamic Modular Architecture**: New boards, plugins, and AI extensions can be injected dynamically by simply placing configuration folders into the IDE project.

---

## 📁 Project Architecture & Structure

The codebase is built on **Vue 3** (Composition API) + **Vite** and uses **Pinia** for state management. 

```
KidBright_MAI_IDE/
├── boards/         # Hardware target definitions.
│   ├── kidbright-mai/        # MaixII board (NCNN, web-adb protocol)
│   └── kidbright-mai-plus/   # MaixCAM CV181x board (cvimodel, websocket-shell)
│       # Each board contains block definitions, examples, python boilerplate (main.py), 
│       # workspace layouts and specific execution/deployment scripts.
│       # main.py: kills maixapp/apps processes on start, restarts launcher on exit.
│
├── extensions/     # Subsystems for AI or specialized pipelines.
│   ├── ImageClassification/
│   ├── ObjectDetection/
│   └── VoiceClassification/
│       # Each extension integrates instructions (Capture, Annotate, Train) 
│       # and links to colab pipelines to generate the respective models.
│
├── plugins/        # External hardware or service modules.
│   ├── DHT11, I2C, MQTT, NETPIE, SHT31, iKB1, etc.
│       # Plugins contain their own block logic and Python libraries (`libs/`) 
│       # necessary to run the specific hardware.
│
├── src/            # Main Vue application source code.
│   ├── App.vue / main.js   # Vue application entry points loading boards and plugins.
│   ├── components/         # Reusable Vue components (UI elements).
│   ├── blocks/             # Common IDE built-in block definitions.
│   ├── engine/             # Core connection (WebSockets, SingletonShell, code deployment).
│   ├── store/              # Pinia state stores (Workspace, Plugins, device connection state).
    └── layouts/            # Editor layouts and views.
```

## 🧠 AI Training Pipeline (Extensions)
This IDE significantly simplifies the AI workflow for hardware boards:
1. **Capture**: Instructions provided to use the board's camera/mic to collect a dataset inside the IDE.
2. **Annotate**: Built-in interfaces to label images or voice segments.
3. **Train**: The IDE connects to a Google Colab notebook, uploading the dataset and executing a training job remotely.
4. **Convert**: Trained model is exported to ONNX, then converted to board-specific format (`.cvimodel` for MaixCAM, NCNN for mAI).
5. **Deploy**: The converted model and MUD metadata are sent to the board and executed by Python blocks (`maix` vision libraries).

### Supported Object Detection Models

| Model | Value | Board | FPS | Accuracy | Use Case |
|-------|-------|-------|-----|----------|----------|
| YOLO v2 slim | `slim_yolo_v2` | mAI / mAI Plus | ~30 | Low | Legacy |
| YOLO 11n | `yolo11n` | mAI Plus | ~60 | Medium (mAP 39.5) | Speed mode (default) |
| YOLO 11s | `yolo11s` | mAI Plus | ~20 | High (mAP 47.0) | Accuracy mode |

Model selection is configured in the **YOLO node** (`src/nodes/models/yolo.js`), which outputs `trainConfig.modelType`.

### trainConfig Flow

```
Frontend                                         Backend (Colab)
────────                                         ───────
YOLO Node (yolo.js)
  → modelType, objectThreshold, iouThreshold
Input Node (default-input.js)
  → epochs, batch_size, learning_rate, train_split
Output Node (object-detection-output.js)
  → validateMatrix, saveMethod
                ↓
ModelDesigner.computeGraph()
  → workspaceStore.trainConfig
                ↓
uploadProject() → project.zip
  containing project.json { trainConfig, labels }
  and dataset/ (VOC: JPEGImages/, Annotations/)
                ↓
POST /train { project_id }
                                                 training_task():
                                                   read project.json
                                                   route by modelType
                                                   → train_object_detection_yolo11()
                                                 convert_model():
                                                   ONNX export → model_transform
                                                   → calibration → model_deploy
                                                   → .cvimodel + .mud
                ↓
GET /download_model → model.zip
  → deploy to board via websocket-shell
```

### Conversion Details (MaixCAM / mAI Plus)

- **Method B** (2 output nodes): `/model.23/dfl/conv/Conv_output_0` + `/model.23/Sigmoid_output_0`
- **Input size**: 224x320
- **Quantization**: INT8 via tpu-mlir (CVITEK TPU)
- **Tolerance**: yolo11n = `0.9,0.6` / yolo11s = `0.85,0.5` (hardcoded in backend)
- **MUD file**: `model_type = yolo11`, no `type` field for detection

---

## 🚀 Setup & Development

### Recommended IDE Setup
- [VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=johnsoncodehk.volar).

### Project Setup
```sh
npm install
```

### Compile and Hot-Reload for Development
```sh
npm run dev
```

### Type-Check, Compile and Minify for Production
```sh
npm run build
```

## 📜 Contributing & Rules for AI Agents
If you are an AI assistant helping to maintain this project, please explicitly read and reference the `rule.md` file located in the root of this repository before generating any code.
