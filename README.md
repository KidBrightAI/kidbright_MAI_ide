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
├── boards/         # Harware target definitions.
│   ├── kidbright-mai/
│   └── kidbright-mai-plus/
│       # Each board contains block definitions, examples, python boilerplate (main.py), 
│       # workspace layouts and specific execution/deployment scripts.
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
4. **Deploy**: The trained model graph (`model-graph.json`) and weights are sent to the board and executed by Python blocks (`maix` vision libraries).

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
