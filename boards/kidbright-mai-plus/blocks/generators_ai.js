// All inference for MaixCAM (CV181x) goes through the runtime libraries
// in boards/kidbright-mai-plus/libs/ — classifier_runtime.py and
// detector_runtime.py wrap the native nn.Classifier / nn.YOLO11, and
// voice still uses the legacy voice_mfcc + nn.load path (unchanged).
//
// The classify / yolo result shape matches what kidbright-mai emits, so
// a student's Blockly program runs on either board without source edits.

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
// MaixCAM voice still uses the original AWNN-style .bin/.param path via
// voice_mfcc. No CPU numpy rewrite here — keep legacy behaviour.

python.pythonGenerator.forBlock['maix3_nn_voice_load'] = function (block, generator) {
  generator.definitions_['from_maix_import_nn'] = 'from maix import nn'
  generator.definitions_['import_voice_mfcc'] = 'import voice_mfcc'
  generator.definitions_['from_maix_import_image'] = 'from maix import image'

  generator.definitions_['class_Resnet'] = `
class _Resnet:
  m = {
    "bin": "/root/model/${workspaceStore.model.hash}.bin",
    "param": "/root/model/${workspaceStore.model.hash}.param"
  }

  options = {
    "model_type": "awnn",
    "inputs": {
      "input0": (147, 13, 3)
    },
    "outputs": {
      "output0": (1, 1, ${workspaceStore.labels.map(lb => lb.label).length})
    },
    "first_layer_conv_no_pad": True,
    "mean": [127.5, 127.5, 127.5],
    "norm": [0.00784313725490196, 0.00784313725490196, 0.00784313725490196],
  }

  def __init__(self):
    from maix import nn
    self.model = nn.load(self.m, opt=self.options)

  def __del__(self):
    del self.model

_p, _stream = voice_mfcc.start_stream()
if _stream is None:
  print("Error: _stream is None")
  exit()
else:
  print("Success: _stream is not None")
_model = _Resnet()
_labels = [${_labelsList()}]

`

  return 'print(_model.model)\n'
}


python.pythonGenerator.forBlock['maix3_nn_voice_get_rms'] = function (block, generator) {
  return ['voice_mfcc.get_rms(_stream)', python.Order.NONE]
}

python.pythonGenerator.forBlock['maix3_nn_voice_classify'] = function (block, generator) {
  const number_duration = block.getFieldValue('duration')
  let code = `voice_mfcc.audio_record(_stream, _p, record_sec=${number_duration})\n`
  code += `mfcc_image = image.open('/root/app/mfcc_run.png')\n`
  code += `mfcc_image = mfcc_image.resize(147, 13)\n`
  code += `_model_result = _model.model.forward(mfcc_image, quantize=True)\n`
  return code
}

python.pythonGenerator.forBlock['maix3_nn_voice_get_result'] = function (block, generator) {
  const data = block.getFieldValue('data')
  let code = ''
  let order = python.Order.NONE
  if (data === 'label') {
    code = '_labels[_model_result.argmax()]'
    block.setOutput(true, 'String')
    order = python.Order.ATOMIC
  } else if (data === 'class_id') {
    code = '_model_result.argmax()'
    block.setOutput(true, 'Number')
    order = python.Order.ATOMIC
  } else if (data === 'probability') {
    code = '_model_result.max()'
    block.setOutput(true, 'Number')
    order = python.Order.ATOMIC
  }
  return [code, order]
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
