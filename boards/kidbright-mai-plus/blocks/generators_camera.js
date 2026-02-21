python.pythonGenerator.forBlock['camera_width'] = function (block, generator) {
  generator.definitions_['from_maix_import_camera'] = 'from maix import camera'
  generator.definitions_['from_maix_import_display'] = 'from maix import display'
  generator.definitions_['init_display'] = 'disp = display.Display()'
  generator.definitions_['init_camera'] = 'cam = camera.Camera(disp.width(), disp.height())'
  var code = 'cam.width()'

  return [code, python.Order.ATOMIC]
}

python.pythonGenerator.forBlock['camera_height'] = function (block, generator) {
  generator.definitions_['from_maix_import_camera'] = 'from maix import camera'
  generator.definitions_['from_maix_import_display'] = 'from maix import display'
  generator.definitions_['init_display'] = 'disp = display.Display()'
  generator.definitions_['init_camera'] = 'cam = camera.Camera(disp.width(), disp.height())'
  var code = 'cam.height()'

  return [code, python.Order.ATOMIC]
}

python.pythonGenerator.forBlock['camera_resolution'] = function (block, generator) {
  generator.definitions_['from_maix_import_camera'] = 'from maix import camera'
  generator.definitions_['from_maix_import_display'] = 'from maix import display'
  generator.definitions_['init_display'] = 'disp = display.Display()'
  var value_width = generator.valueToCode(block, 'width', python.Order.ATOMIC) || '320'
  var value_height = generator.valueToCode(block, 'height', python.Order.ATOMIC) || '240'

  // Initialize camera object 'cam'
  // 3 for RGB? usually default.
  return `cam = camera.Camera(${value_width}, ${value_height}, 3)\n`
}

python.pythonGenerator.forBlock['camera_capture'] = function (block, generator) {
  generator.definitions_['from_maix_import_camera'] = 'from maix import camera'
  generator.definitions_['from_maix_import_display'] = 'from maix import display'
  generator.definitions_['init_display'] = 'disp = display.Display()'
  generator.definitions_['init_camera'] = 'cam = camera.Camera(disp.width(), disp.height())'
  var code = 'cam.read()'

  return [code, python.Order.NONE]
}

python.pythonGenerator.forBlock['camera_close'] = function (block, generator) {
  generator.definitions_['from_maix_import_camera'] = 'from maix import camera'
  generator.definitions_['from_maix_import_display'] = 'from maix import display'
  generator.definitions_['init_display'] = 'disp = display.Display()'
  generator.definitions_['init_camera'] = 'cam = camera.Camera(disp.width(), disp.height())'
  return 'cam.close()\n'
}