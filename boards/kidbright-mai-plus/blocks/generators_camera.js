python.pythonGenerator.forBlock['maix3_camera_width'] = function(block, generator) {
  generator.definitions_['from_maix_import_camera'] = 'from maix import camera'
  generator.definitions_['from_maix_import_display'] = 'from maix import display'
  generator.definitions_['init_display'] = 'disp = display.Display()'
  generator.definitions_['init_camera'] = 'cam = camera.Camera(disp.width(), disp.height())'
  var code = 'cam.width()'
  
  return [code, python.Order.ATOMIC]
}

python.pythonGenerator.forBlock['maix3_camera_height'] = function(block, generator) {
  generator.definitions_['from_maix_import_camera'] = 'from maix import camera'
  generator.definitions_['from_maix_import_display'] = 'from maix import display'
  generator.definitions_['init_display'] = 'disp = display.Display()'
  generator.definitions_['init_camera'] = 'cam = camera.Camera(disp.width(), disp.height())'
  var code = 'cam.height()'
  
  return [code, python.Order.ATOMIC]
}

python.pythonGenerator.forBlock['maix3_camera_resolution'] = function(block, generator) {
  generator.definitions_['from_maix_import_camera'] = 'from maix import camera'
  generator.definitions_['from_maix_import_display'] = 'from maix import display'
  generator.definitions_['init_display'] = 'disp = display.Display()'
  generator.definitions_['init_camera'] = 'cam = camera.Camera(disp.width(), disp.height())'
  var value_width = generator.valueToCode(block, 'width', python.Order.ATOMIC)
  var value_height = generator.valueToCode(block, 'height', python.Order.ATOMIC)  
  
  return 'cam.set_resolution(width=' + value_width + ', height=' + value_height + ')\n'
}

python.pythonGenerator.forBlock['maix3_camera_capture'] = function(block, generator) {
  generator.definitions_['from_maix_import_camera'] = 'from maix import camera'
  generator.definitions_['from_maix_import_display'] = 'from maix import display'
  generator.definitions_['init_display'] = 'disp = display.Display()'
  generator.definitions_['init_camera'] = 'cam = camera.Camera(disp.width(), disp.height())'
  var code = 'cam.read()'
  
  return [code, python.Order.NONE]
}

python.pythonGenerator.forBlock['maix3_camera_close'] = function(block, generator) {
  generator.definitions_['from_maix_import_camera'] = 'from maix import camera'
  generator.definitions_['from_maix_import_display'] = 'from maix import display'
  generator.definitions_['init_display'] = 'disp = display.Display()'
  generator.definitions_['init_camera'] = 'cam = camera.Camera(disp.width(), disp.height())'
  
  return 'cam.close()\n'
}