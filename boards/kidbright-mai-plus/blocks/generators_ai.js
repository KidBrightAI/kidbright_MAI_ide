python.pythonGenerator.forBlock['maix3_nn_classify_load'] = function (block, generator) {
  generator.definitions_['from_maix_import_camera'] = 'from maix import camera'
  generator.definitions_['from_maix_import_display'] = 'from maix import display'
  generator.definitions_['from_maix_import_image'] = 'from maix import image'
  generator.definitions_['from_maix_import_nn'] = 'from maix import nn'

  generator.definitions_['class_Classifier'] = `
class _Classifier:
  def __init__(self):
    self.classifier = nn.Classifier(model="/root/model/${workspaceStore.model.hash}.mud", dual_buff=True)

  def classify(self, img):
    self.res = self.classifier.classify(img)
    return self.res
    
  def get_labels(self):
    return self.classifier.labels

_model = _Classifier()
`
  return 'print("Classifier loaded")\n'
}

python.pythonGenerator.forBlock['maix3_nn_classify_classify'] = function (block, generator) {
  var value_image = generator.valueToCode(block, 'image', python.Order.ATOMIC)
  return `_model_result = _model.classify(${value_image})\n`
}

python.pythonGenerator.forBlock['maix3_nn_classify_get_result'] = function (block, generator) {
  var dropdown_data = block.getFieldValue('data')
  let code = ''
  let order = python.Order.NONE

  if (dropdown_data == 'label') {
    code = '_model.get_labels()[_model_result[0][0]] if _model_result else "None"\n'
    block.setOutput(true, 'String')
  } else if (dropdown_data == 'class_id') {
    code = '_model_result[0][0] if _model_result else -1'
    block.setOutput(true, 'Number')
    order = python.Order.ATOMIC
  } else if (dropdown_data == 'probability') {
    code = '_model_result[0][1] if _model_result else 0.0'
    block.setOutput(true, 'Number')
    order = python.Order.ATOMIC
  }

  return [code, order]
}

// voice 
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
_labels = [${workspaceStore.labels.map(label => `"${label.label}"`).sort().join(', ')}]

`

  return 'print(_model.model)\n'
}


//maix3_nn_voice_get_rms
python.pythonGenerator.forBlock['maix3_nn_voice_get_rms'] = function (block, generator) {
  var code = 'voice_mfcc.get_rms(_stream)\n'

  return [code, python.Order.NONE]
}

//maix3_nn_voice_classify
python.pythonGenerator.forBlock['maix3_nn_voice_classify'] = function (block, generator) {
  var number_duration = block.getFieldValue('duration')
  var code = `voice_mfcc.audio_record(_stream, _p, record_sec=${number_duration})\n`
  code += `mfcc_image = image.open('/root/app/mfcc_run.png')\n`
  code += `_model_result = _model.model.forward(mfcc_image, quantize=True)\n`

  //code += `print(_model_result)\n`;
  return code
}

// python.pythonGenerator.forBlock['maix3_nn_voice_classify'] = function(block, generator) {
//   var number_threshold = block.getFieldValue('threshold');
//   var number_duration = block.getFieldValue('duration');

//   var code = `res_listen = voice_mfcc.audio_listener(_stream, _p, threshold=${number_threshold}, record_sec=${number_duration})\n`;
//   code += `if res_listen is not None:\n`;
//   code += `  mfcc_image = image.open('/root/app/mfcc_run.png')\n`;
//   code += `  mfcc_image = mfcc_image.resize(224, 224)\n`;
//   code += `  _model_result = _model.model.forward(mfcc_image, quantize=True)\n`;
//   code += `else:\n`;
//   code += `  _model_result = None\n`;
//   return code;
// };

python.pythonGenerator.forBlock['maix3_nn_voice_get_result'] = function (block, generator) {
  var dropdown_data = block.getFieldValue('data')
  let code = ''
  let order = python.Order.NONE
  if (dropdown_data == 'label') {
    code = '_labels[_model_result.argmax()]\n'
    block.setOutput(true, 'String')
  } else if (dropdown_data == 'class_id') {
    code = '_model_result.argmax()'
    block.setOutput(true, 'Number')
    order = python.Order.ATOMIC
  } else if (dropdown_data == 'probability') {
    code = '_model_result.max()'
    block.setOutput(true, 'Number')
    order = python.Order.ATOMIC
  }

  return [code, order]
}

// yolo
python.pythonGenerator.forBlock['maix3_nn_yolo_load'] = function (block, generator) {
  generator.definitions_['from_maix_import_nn'] = 'from maix import nn'
  generator.definitions_['class_Yolo'] = `
class Yolo:
  labels = [${workspaceStore.labels.map(label => `"${label.label}"`).sort().join(', ')}]
  def __init__(self):    
    from maix import nn
    self.detector = nn.YOLO11(model="/root/model/${workspaceStore.model.hash}.mud", dual_buff=True)
  def __del__(self):
    del self.detector
`

  return '_yolo = Yolo()\n'
}

python.pythonGenerator.forBlock['maix3_nn_yolo_detect'] = function (block, generator) {
  var value_image = generator.valueToCode(block, 'image', python.Order.ATOMIC)
  var number_nms = block.getFieldValue('nms')
  var number_threshold = block.getFieldValue('threshold')

  // TODO: Assemble python into code variable.
  return `_boxes = _yolo.detector.detect(${value_image}, conf_th=${number_threshold}, iou_th=${number_nms})\n`
}

python.pythonGenerator.forBlock['maix3_nn_yolo_get_result_array'] = function (block, generator) {
  var code = '_boxes'

  return [code, python.Order.NONE]
}

//maix3_nn_yolo_get_count
python.pythonGenerator.forBlock['maix3_nn_yolo_get_count'] = function (block, generator) {
  var code = 'len(_boxes)'

  return [code, python.Order.ATOMIC]
}
python.pythonGenerator.forBlock['maix3_nn_yolo_get'] = function (block, generator) {
  var dropdown_data = block.getFieldValue('data')
  var value_obj = generator.valueToCode(block, 'obj', python.Order.ATOMIC)

  if (dropdown_data == "x1") {
    var code = `${value_obj}.x`
    var order = python.Order.ATOMIC
    block.setOutput(true, 'Number')

  } else if (dropdown_data == "y1") {
    var code = `${value_obj}.y`
    var order = python.Order.ATOMIC
    block.setOutput(true, 'Number')

  } else if (dropdown_data == "x2") {
    var code = `(${value_obj}.x+${value_obj}.w)`
    var order = python.Order.ATOMIC
    block.setOutput(true, 'Number')

  } else if (dropdown_data == "y2") {
    var code = `(${value_obj}.y+${value_obj}.h)`
    var order = python.Order.ATOMIC
    block.setOutput(true, 'Number')

  } else if (dropdown_data == "width") {
    var code = `${value_obj}.w`
    var order = python.Order.ATOMIC
    block.setOutput(true, 'Number')

  } else if (dropdown_data == "height") {
    var code = `${value_obj}.h`
    var order = python.Order.ATOMIC
    block.setOutput(true, 'Number')

  } else if (dropdown_data == "label") {
    var code = `_yolo.detector.labels[${value_obj}.class_id]`
    var order = python.Order.NONE
    block.setOutput(true, 'String')

  } else if (dropdown_data == "class_id") {
    var code = `${value_obj}.class_id`
    var order = python.Order.ATOMIC
    block.setOutput(true, 'Number')

  } else if (dropdown_data == "probability") {
    var code = `${value_obj}.score`
    var order = python.Order.ATOMIC
    block.setOutput(true, 'Number')

  }

  return [code, order]
}

