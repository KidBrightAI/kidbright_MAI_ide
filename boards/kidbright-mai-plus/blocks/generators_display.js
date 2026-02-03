python.pythonGenerator.forBlock['maix3_display_width'] = function(block, generator) {
  generator.definitions_['from_maix_import_display'] = 'from maix import display'
  generator.definitions_['init_display'] = 'disp = display.Display()'
  var code = 'disp.width()'  
  
  return [code, python.Order.ATOMIC]
}

python.pythonGenerator.forBlock['maix3_display_height'] = function(block, generator) {
  generator.definitions_['from_maix_import_display'] = 'from maix import display'
  generator.definitions_['init_display'] = 'disp = display.Display()'
  var code = 'disp.height()'  
  
  return [code, python.Order.ATOMIC]
}

python.pythonGenerator.forBlock['maix3_display_resolution'] = function(block, generator) {
  // Resolution is set via config file in MaixPy v4
  return '# display resolution is fixed or set via config\npass\n'
}

python.pythonGenerator.forBlock['maix3_display_get_image'] = function(block, generator) {
  // Not directly supported in new API to read back from display
  var code = 'None'  
  
  return [code, python.Order.NONE]
}

python.pythonGenerator.forBlock['maix3_display_dislay'] = function(block, generator) {
  generator.definitions_['from_maix_import_display'] = 'from maix import display'
  generator.definitions_['init_display'] = 'disp = display.Display()'
  var value_image = generator.valueToCode(block, 'image', python.Order.ATOMIC)  
  
  return 'disp.show(' + value_image + ')\n'
}