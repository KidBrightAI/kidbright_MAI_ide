python.pythonGenerator.forBlock['maix3_nn_classify_load'] = function(block, generator) {
  generator.definitions_['from_maix_import_nn'] = 'from maix import nn';
  generator.definitions_['class_Resnet'] = `
class _Resnet:
  m = {
    "bin": "/home/model/${workspaceStore.model.hash}.bin",
    "param": "/home/model/${workspaceStore.model.hash}.param"
  }

  options = {
    "model_type": "awnn",
    "inputs": {
      "input0": (224, 224, 3)
    },
    "outputs": {
      "output0": (1, 1, ${workspaceStore.labels.length})
    },
    "first_layer_conv_no_pad": False,
    "mean": [127.5, 127.5, 127.5],
    "norm": [0.00784313725490196, 0.00784313725490196, 0.00784313725490196],
  }

  def __init__(self):
    from maix import nn
    self.model = nn.load(self.m, opt=self.options)

  def __del__(self):
    del self.model

_model = _Resnet()
_labels = [${workspaceStore.labels.map(label => `"${label.label}"`).join(', ')}]
`    
  // var functionName = generator.provideFunction_(
  //     '_isKeyPressed',
  //     ['def ' + "_isKeyPressed" + '(key):',
  //     '  event = keys_device.read_one()',      
  //     '  if event is None:',
  //     '    return False',
  //     '  if event.value == 1 and event.code == 0x02 and key == "S1":',
  //     '    return True',
  //     '  if event.value == 1 and event.code == 0x03 and key == "S2":',
  //     '    return True',
  //     '  return False']);      

    var code = 'print(_model.model)\n';
    return code;
  };
  
  python.pythonGenerator.forBlock['maix3_nn_classify_classify'] = function(block, generator) {
    var value_image = generator.valueToCode(block, 'image', python.Order.ATOMIC);    
    var code = `_model_result = _model.model.forward(${value_image}, quantize=True)\n`;
    return code;
  };
  
  python.pythonGenerator.forBlock['maix3_nn_classify_get_result'] = function(block, generator) {
    var dropdown_data = block.getFieldValue('data');
    let code = '';
    let order = python.Order.NONE;
    if(dropdown_data == 'label'){
      code = '_labels[_model_result.argmax()]\n';
      block.setOutput(true, 'String');
    }else if(dropdown_data == 'class_id'){
      code = '_model_result.argmax()';      
      block.setOutput(true, 'Number');
      order = python.Order.ATOMIC;
    }else if(dropdown_data == 'probability'){
      code = '_model_result.max()';      
      block.setOutput(true, 'Number');
      order = python.Order.ATOMIC;
    }
    return [code, order];
  };

  python.pythonGenerator.forBlock['maix3_nn_yolo_load'] = function(block, generator) {
    generator.definitions_['from_maix_import_nn'] = 'from maix import nn';
    generator.definitions_['class_Resnet'] = `
class Yolo:
  labels = [${workspaceStore.labels.map(label => `"${label.label}"`).join(', ')}]
  anchors = [1.19, 1.98, 2.79, 4.59, 4.53, 8.92, 8.06, 5.29, 10.32, 10.65]
  m = {
    "bin": "/home/model/${workspaceStore.model.hash}.bin",
    "param": "/home/model/${workspaceStore.model.hash}.param"
  }
  options = {
    "model_type":  "awnn",
    "inputs": {
      "input0": (224, 224, 3)
    },
    "outputs": {
      "output0": (7, 7, (1+4+len(labels))*5)
    },
    "mean": [127.5, 127.5, 127.5],
    "norm": [0.0078125, 0.0078125, 0.0078125],
  }
  def __init__(self):    
    from maix.nn import decoder
    self.model = nn.load(self.m, opt=self.options)
    self.decoder = decoder.Yolo2(len(self.labels), self.anchors, net_in_size=(224, 224), net_out_size=(7, 7))
  def __del__(self):
    del self.model
    del self.decoder
`
    var code = '_yolo = Yolo()\n';
    return code;
  };
  
  python.pythonGenerator.forBlock['maix3_nn_yolo_detect'] = function(block, generator) {
    var value_image = generator.valueToCode(block, 'image', python.Order.ATOMIC);
    // TODO: Assemble python into code variable.
    var code = `_out = _yolo.model.forward(${value_image}, quantize=True, layout="hwc")
_boxes, _probs = _yolo.decoder.run(_out, nms=0.3, threshold=0.5, img_size=(224, 224))\n`;
    return code;
  };
  
  python.pythonGenerator.forBlock['maix3_nn_classify_get_result_array'] = function(block, generator) {
    // TODO: Assemble python into code variable.
    var code = '...';
    // TODO: Change ORDER_NONE to the correct strength.
    return [code, python.Order.NONE];
  };
  
  python.pythonGenerator.forBlock['maix3_nn_yolo_get'] = function(block, generator) {
    var dropdown_data = block.getFieldValue('data');
    var value_obj = generator.valueToCode(block, 'obj', python.Order.ATOMIC);
    // TODO: Assemble python into code variable.
    var code = '_boxes';
    // TODO: Change ORDER_NONE to the correct strength.
    return [code, python.Order.NONE];
  };
  
  