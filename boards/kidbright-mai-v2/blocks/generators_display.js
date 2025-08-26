python.pythonGenerator.forBlock['maix3_display_width'] = function(block, generator) {
  generator.definitions_['from_maix_import_display'] = 'from maix import display';
  var code = 'display.width()';  
  return [code, python.Order.ATOMIC];
};

python.pythonGenerator.forBlock['maix3_display_height'] = function(block, generator) {
  generator.definitions_['from_maix_import_display'] = 'from maix import display';
  var code = 'display.height()';  
  return [code, python.Order.ATOMIC];
};

python.pythonGenerator.forBlock['maix3_display_resolution'] = function(block, generator) {
  generator.definitions_['from_maix_import_display'] = 'from maix import display';
  var value_width = generator.valueToCode(block, 'width', python.Order.ATOMIC);
  var value_height = generator.valueToCode(block, 'height', python.Order.ATOMIC);  
  var code = 'display.config((' + value_width + ', ' + value_height + '))\n';
  return code;
};

python.pythonGenerator.forBlock['maix3_display_get_image'] = function(block, generator) {
  generator.definitions_['from_maix_import_display'] = 'from maix import display';  
  var code = 'display.as_image()';  
  return [code, python.Order.NONE];
};

python.pythonGenerator.forBlock['maix3_display_dislay'] = function(block, generator) {
  generator.definitions_['from_maix_import_display'] = 'from maix import display';
  generator.definitions_['from_maix_import_camera'] = 'from maix import camera';
  var value_image = generator.valueToCode(block, 'image', python.Order.ATOMIC);  
  var code = 'display.show(' + value_image + ')\n';
  return code;
};
