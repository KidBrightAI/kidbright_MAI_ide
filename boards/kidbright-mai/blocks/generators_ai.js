// All inference for V831 goes through the runtime libraries in
// boards/kidbright-mai/libs/ — classifier_runtime.py, detector_runtime.py,
// voice_cpu_infer.py. The generator's job is just to wire the student's
// Blockly blocks to those libraries; it does NOT know about file paths,
// NCNN options, or AWNN quirks.
//
// Adding a new inference path = writing a new library module, NOT editing
// hardcoded Python strings in here. The classify/yolo result shape is the
// same as on kidbright-mai-plus so block-side code is portable across boards.

const _labelsList = () =>
  workspaceStore.labels.map(lb => `"${lb.label}"`).sort().join(", ")


// ------------------------------------------------------------- image classify

python.pythonGenerator.forBlock['maix3_nn_classify_load'] = function (block, generator) {
  generator.definitions_['classifier_import'] = 'from classifier_runtime import Classifier'
  generator.definitions_['classifier_init'] = `
_labels = [${_labelsList()}]
_model = Classifier("${workspaceStore.model.hash}", _labels)
_result = None
`
  return 'print("classifier loaded")\n'
}

python.pythonGenerator.forBlock['maix3_nn_classify_classify'] = function (block, generator) {
  const value_image = generator.valueToCode(block, 'image', python.Order.ATOMIC)
  return `_result = _model.classify(${value_image})\n`
}

python.pythonGenerator.forBlock['maix3_nn_classify_get_result'] = function (block, generator) {
  const data = block.getFieldValue('data')
  const key = (data === 'class_id') ? 'class_id'
    : (data === 'probability') ? 'probability'
    : 'label'
  block.setOutput(true, key === 'label' ? 'String' : 'Number')
  return [`_result["${key}"] if _result else ${key === 'label' ? '"None"' : (key === 'class_id' ? '-1' : '0.0')}`, python.Order.ATOMIC]
}


// ---------------------------------------------------------------------- voice

python.pythonGenerator.forBlock['maix3_nn_voice_load'] = function (block, generator) {
  // V831 voice runs on the A7 CPU via numpy fp32 — AWNN int8 collapses
  // small-vocab voice models regardless of preprocessing. See
  // boards/kidbright-mai/libs/voice_cpu_infer.py.
  generator.definitions_['import_voice_cpu_infer'] = 'import voice_cpu_infer'
  generator.definitions_['class_VoiceModel'] = `
_model = voice_cpu_infer.Model("/root/model/${workspaceStore.model.hash}.npz")
_labels = _model.labels
_result = None
`
  return 'print("voice model loaded:", _labels)\n'
}

python.pythonGenerator.forBlock['maix3_nn_voice_get_rms'] = function (block, generator) {
  // Old API exposed an RMS reading from an always-open mic stream. In the CPU
  // path the stream only opens when classify() is called, so return 0 until
  // we decide to reintroduce continuous monitoring.
  return ['0', python.Order.ATOMIC]
}

python.pythonGenerator.forBlock['maix3_nn_voice_classify'] = function (block, generator) {
  const number_duration = block.getFieldValue('duration')
  return `_result = _model.classify(duration=${number_duration})\n`
}

python.pythonGenerator.forBlock['maix3_nn_voice_get_result'] = function (block, generator) {
  const data = block.getFieldValue('data')
  // voice_cpu_infer.Model.classify() returns dict with "label" / "index" / "prob"
  // — translate the block dropdown to that schema.
  const key = (data === 'class_id') ? 'index'
    : (data === 'probability') ? 'prob'
    : 'label'
  block.setOutput(true, key === 'label' ? 'String' : 'Number')
  return [`_result["${key}"]`, python.Order.ATOMIC]
}


// --------------------------------------------------------------- object detect

python.pythonGenerator.forBlock['maix3_nn_yolo_load'] = function (block, generator) {
  generator.definitions_['detector_import'] = 'from detector_runtime import Detector'
  generator.definitions_['detector_init'] = `
_yolo_labels = [${_labelsList()}]
_yolo = Detector("${workspaceStore.model.hash}", _yolo_labels)
_boxes = []
`
  return 'print("yolo loaded")\n'
}

python.pythonGenerator.forBlock['maix3_nn_yolo_detect'] = function (block, generator) {
  const value_image = generator.valueToCode(block, 'image', python.Order.ATOMIC)
  const number_nms = block.getFieldValue('nms')
  const number_threshold = block.getFieldValue('threshold')
  return `_boxes = _yolo.detect(${value_image}, conf=${number_threshold}, iou=${number_nms})\n`
}

python.pythonGenerator.forBlock['maix3_nn_yolo_get_result_array'] = function (block, generator) {
  return ['_boxes', python.Order.NONE]
}

python.pythonGenerator.forBlock['maix3_nn_yolo_get_count'] = function (block, generator) {
  return ['len(_boxes)', python.Order.ATOMIC]
}

python.pythonGenerator.forBlock['maix3_nn_yolo_get'] = function (block, generator) {
  const data = block.getFieldValue('data')
  const value_obj = generator.valueToCode(block, 'obj', python.Order.ATOMIC)

  const stringKeys = { label: `${value_obj}.label` }
  const numberExprs = {
    x1: `${value_obj}.x`,
    y1: `${value_obj}.y`,
    x2: `(${value_obj}.x + ${value_obj}.w)`,
    y2: `(${value_obj}.y + ${value_obj}.h)`,
    width: `${value_obj}.w`,
    height: `${value_obj}.h`,
    class_id: `${value_obj}.class_id`,
    probability: `${value_obj}.score`,
  }

  if (data in stringKeys) {
    block.setOutput(true, 'String')
    return [stringKeys[data], python.Order.ATOMIC]
  }
  if (data in numberExprs) {
    block.setOutput(true, 'Number')
    return [numberExprs[data], python.Order.ATOMIC]
  }
  return ['0', python.Order.ATOMIC]
}
