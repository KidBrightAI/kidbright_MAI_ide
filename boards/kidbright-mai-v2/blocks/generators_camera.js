python.pythonGenerator.forBlock['maix3_camera_width'] = function(block, generator) {
  generator.definitions_['from_maix_import_camera'] = 'from maix import camera';
  var code = 'camera.width()';
  return [code, python.Order.ATOMIC];
};

python.pythonGenerator.forBlock['maix3_camera_height'] = function(block, generator) {
  generator.definitions_['from_maix_import_camera'] = 'from maix import camera';
  var code = 'camera.height()';
  return [code, python.Order.ATOMIC];
};

python.pythonGenerator.forBlock['maix3_camera_resolution'] = function(block, generator) {
  generator.definitions_['from_maix_import_camera'] = 'from maix import camera';
  var value_width = generator.valueToCode(block, 'width', python.Order.ATOMIC);
  var value_height = generator.valueToCode(block, 'height', python.Order.ATOMIC);  
  var code = 'camera.camera.config(size=(' + value_width + ', ' + value_height + '))\n';
  return code;
};

python.pythonGenerator.forBlock['maix3_camera_capture'] = function(block, generator) {
  generator.definitions_['from_maix_import_camera'] = 'from maix import camera';
  var code = 'camera.capture()';
  return [code, python.Order.NONE];
};

python.pythonGenerator.forBlock['maix3_camera_close'] = function(block, generator) {
  generator.definitions_['from_maix_import_camera'] = 'from maix import camera';
  var code = 'camera.close()\n';
  return code;
};
