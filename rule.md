# KidBright mAI IDE: AI Code Generation Rules (rule.md)

This file serves as the strict guideline for any AI assistant tasked with modifying, refactoring, or extending the **KidBright mAI IDE** codebase. You must adhere to the following architectural, framework, and organizational conventions.

## 1. General Constraints
- **Framework**: Use Vue 3 exclusively with the Composition API (`<script setup>`).
- **Styling**: Use Vuetify 3 (since it's configured in `plugins/vuetify.js`) and SCSS (`@core/scss` and `styles/`).
- **State Management**: Use Pinia (`store/`) when managing cross-component states such as active boards, plugins, or workspace configurations.
- **Do not overwrite core engine unnecessarily**: Subsystems in `src/engine/` (WebSockets, board deployment, storage) are stable. If you need new functionality, prefer adding it via a Plugin or Extension.

## 2. Dealing with Blockly & Code Generation
- The IDE utilizes `blockly` and `blockly/python` to translate visual blocks to python scripts.
- When generating new blocks, use standard Blockly JSON or JavaScript definitions in `blocks/` or `plugins/<plugin_name>/blocks/`.
- Ensure that the Python string generator function handles indentation properly (using `Blockly.Python.INDENT`) since Python relies on strict indentation.

## 3. Creating or Modifying Boards
A board directory (`boards/<board_name>/`) strictly requires:
- `index.js` (Exporting name, description, and ID).
- `toolbox.js` (The XML defining the Blockly sidebar for this board).
- `workspace.json` (Default blocks rendered upon initialization).
- `main.py` (The entry template template containing `##{main}##` where the user's code is injected).
- `scripts/` (Optional python scripts running on the target hardware before/after deployment, e.g., killing old tasks or preparing to run).
- `libs/` (Core python libary files specific to the board firmware).

## 4. Creating AI Extensions (Image, Object, Voice)
AI processes run on Google Colab, and the resulting payload is sent to the KidBright board. Extensions (`extensions/<extension_name>/`) must have:
- `config.js`: Defines ID, name, and paths to views.
- `Instructions/`: Vue components structured into `CaptureInstruction.vue`, `AnnotateInstruction.vue`, and `TrainInstruction.vue`.
- `model-graph.json`: Expected graph structure for the resulting AI model.

## 5. Adding Hardware Plugins
Plugins (`plugins/<plugin_name>/`) are reserved for general hardware components (e.g., DHT11, MQTT). They require:
- `index.js` (Config mapping blocks and categories).
- `blocks/` (Blockly logic specific to this hardware).
- `libs/` (The python script to be transferred to the board upon execution).

## 6. Execution Mindset
- Always use `list_dir` or `find_by_name` to orient yourself within a target folder (`boards`, `plugins`, `extensions`) before proposing new files.
- Double-check how `src/main.js` globs and imports configurations to ensure any newly created entity is automatically picked up without manually altering `main.js`.
