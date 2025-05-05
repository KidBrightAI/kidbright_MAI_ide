python.pythonGenerator.forBlock['maix3_nn_classify_load'] = function(block, generator) {
  generator.definitions_['from_maix_import_nn'] = 'from maix import nn';
  generator.definitions_['class_Resnet'] = `
class _Resnet:
  m = {
    "bin": "/root/model/${workspaceStore.model.hash}.bin",
    "param": "/root/model/${workspaceStore.model.hash}.param"
  }

  options = {
    "model_type": "awnn",
    "inputs": {
      "input0": (224, 224, 3)
    },
    "outputs": {
      "output0": (1, 1, ${workspaceStore.labels.map(lb => lb.label).length})
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
_labels = [${ workspaceStore.labels.map(label => `"${label.label}"`).sort().join(', ') }]
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
// voice 
  python.pythonGenerator.forBlock['maix3_nn_voice_load'] = function(block, generator) {
    generator.definitions_['from_maix_import_nn'] = 'from maix import nn';
    generator.definitions_['import_voice_mfcc'] = 'import voice_mfcc';
    generator.definitions_['from_maix_import_image'] = 'from maix import image';

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
_labels = [${ workspaceStore.labels.map(label => `"${label.label}"`).sort().join(', ') }]

`;
    var code = 'print(_model.model)\n';
    return code;
  };


  //maix3_nn_voice_get_rms
  python.pythonGenerator.forBlock['maix3_nn_voice_get_rms'] = function(block, generator) {
    var code = 'voice_mfcc.get_rms(_stream)\n';
    return [code, python.Order.NONE];
  };

  //maix3_nn_voice_classify
  python.pythonGenerator.forBlock['maix3_nn_voice_classify'] = function(block, generator) {
    var number_duration = block.getFieldValue('duration');
    var code = `voice_mfcc.audio_record(_stream, _p, record_sec=${number_duration})\n`;
    code += `mfcc_image = image.open('/root/app/mfcc_run.png')\n`;
    code += `_model_result = _model.model.forward(mfcc_image, quantize=True)\n`;
    code += `print(_model_result)\n`;
    return code;
  };
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

  python.pythonGenerator.forBlock['maix3_nn_voice_get_result'] = function(block, generator) {
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

  // yolo
  python.pythonGenerator.forBlock['maix3_nn_yolo_load'] = function(block, generator) {
    generator.definitions_['from_maix_import_nn'] = 'from maix import nn';
    generator.definitions_['class_Resnet'] = `
class Yolo:
  labels = [${ workspaceStore.labels.map(label => `"${label.label}"`).sort().join(', ') }]
  anchors = [1.19,1.98, 2.79,4.59, 4.53,8.92, 8.06,5.29, 10.32,10.65]
  #anchors = [5.4, 5.38, 1.65, 2.09, 0.8, 1.83, 2.45, 4.14, 0.46, 0.8]
  m = {
    "bin": "/root/model/${workspaceStore.model.hash}.bin",
    "param": "/root/model/${workspaceStore.model.hash}.param"
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
    var number_nms = block.getFieldValue('nms');
    var number_threshold = block.getFieldValue('threshold');
    // TODO: Assemble python into code variable.
    var code = `_out = _yolo.model.forward(${value_image}.tobytes(), quantize=True, layout="hwc")
_boxes, _probs = _yolo.decoder.run(_out, nms=${number_nms}, threshold=${number_threshold}, img_size=(224, 224))\n`;
// restruct two array to one array with properties in python code of _boxes and _probs 
    return code;
  };
  
  python.pythonGenerator.forBlock['maix3_nn_yolo_get_result_array'] = function(block, generator) {
    var code = 'zip(_boxes, _probs)';
    return [code, python.Order.NONE];
  };
  //maix3_nn_yolo_get_count
  python.pythonGenerator.forBlock['maix3_nn_yolo_get_count'] = function(block, generator) {
    var code = 'len(_boxes)';
    return [code, python.Order.ATOMIC];
  };
  python.pythonGenerator.forBlock['maix3_nn_yolo_get'] = function(block, generator) {
    var dropdown_data = block.getFieldValue('data');
    var value_obj = generator.valueToCode(block, 'obj', python.Order.ATOMIC);
    
    if(dropdown_data == "x1"){    
      var code = `${value_obj}[0][0]`;
      var order = python.Order.ATOMIC;
      block.setOutput(true, 'Number');

    } else if(dropdown_data == "y1"){
      var code = `${value_obj}[0][1]`;
      var order = python.Order.ATOMIC;
      block.setOutput(true, 'Number');      

    } else if(dropdown_data == "x2"){
      var code = `(${value_obj}[0][0]+${value_obj}[0][2])`;
      var order = python.Order.ATOMIC;
      block.setOutput(true, 'Number');

    } else if(dropdown_data == "y2"){
      var code = `(${value_obj}[0][1]+${value_obj}[0][3])`;
      var order = python.Order.ATOMIC;
      block.setOutput(true, 'Number');    

    } else if(dropdown_data == "width"){
      var code = `${value_obj}[0][2]`;
      var order = python.Order.ATOMIC;
      block.setOutput(true, 'Number');

    } else if(dropdown_data == "height"){
      var code = `${value_obj}[0][3]`;
      var order = python.Order.ATOMIC;
      block.setOutput(true, 'Number');    

    } else if(dropdown_data == "label"){
      var code = `_yolo.labels[${value_obj}[1][0]]`;
      var order = python.Order.NONE;
      block.setOutput(true, 'String');

    } else if(dropdown_data == "class_id"){
      var code = `${value_obj}[1][0]`;
      var order = python.Order.ATOMIC;
      block.setOutput(true, 'Number');

    } else if(dropdown_data == "probability"){
      var code = `${value_obj}[1][1][${value_obj}[1][0]]`;
      var order = python.Order.ATOMIC;
      block.setOutput(true, 'Number');

    }    
    return [code, order];
  };
  
  