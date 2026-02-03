python.pythonGenerator.forBlock['maix4_camera_width'] = function (block, generator) {
  var code = 'cam.width()'
  
  return [code, python.Order.ATOMIC]
}

python.pythonGenerator.forBlock['maix4_camera_height'] = function (block, generator) {
  var code = 'cam.height()'
  
  return [code, python.Order.ATOMIC]
}

python.pythonGenerator.forBlock['maix4_camera_resolution'] = function (block, generator) {
  generator.definitions_['from_maix_import_camera'] = 'from maix import camera'
  var value_width = generator.valueToCode(block, 'width', python.Order.ATOMIC) || '320'
  var value_height = generator.valueToCode(block, 'height', python.Order.ATOMIC) || '240'

  // Initialize camera object 'cam'
  // 3 for RGB? usually default.
  return `cam = camera.Camera(${value_width}, ${value_height}, 3)\n`
}

python.pythonGenerator.forBlock['maix4_camera_capture'] = function (block, generator) {
  generator.definitions_['from_maix_import_camera'] = 'from maix import camera'
  var code = 'cam.read()'
  
  return [code, python.Order.NONE]
}

python.pythonGenerator.forBlock['maix4_camera_close'] = function (block, generator) {
  return 'cam.close()\n'
}

// Display
python.pythonGenerator.forBlock['maix4_display_width'] = function (block, generator) {
  generator.definitions_['from_maix_import_display'] = 'from maix import display'
  generator.definitions_['init_display'] = 'disp = display.Display()'
  var code = 'disp.width()'
  
  return [code, python.Order.ATOMIC]
}

python.pythonGenerator.forBlock['maix4_display_height'] = function (block, generator) {
  generator.definitions_['from_maix_import_display'] = 'from maix import display'
  generator.definitions_['init_display'] = 'disp = display.Display()'
  var code = 'disp.height()'
  
  return [code, python.Order.ATOMIC]
}

python.pythonGenerator.forBlock['maix4_display_resolution'] = function (block, generator) {
  generator.definitions_['from_maix_import_display'] = 'from maix import display'
  var value_width = generator.valueToCode(block, 'width', python.Order.ATOMIC)
  var value_height = generator.valueToCode(block, 'height', python.Order.ATOMIC)
  
  return `disp = display.Display(width=${value_width}, height=${value_height})\n`
}

python.pythonGenerator.forBlock['maix4_display_show'] = function (block, generator) {
  generator.definitions_['from_maix_import_display'] = 'from maix import display'

  // Ensure disp exists.
  if (!generator.definitions_['init_display']) {
    generator.definitions_['init_display'] = 'disp = display.Display()'
  }

  var value_image = generator.valueToCode(block, 'image', python.Order.ATOMIC)
  
  return `disp.show(${value_image})\n`
}

// Image
python.pythonGenerator.forBlock['maix4_image_new'] = function (block, generator) {
  generator.definitions_['from_maix_import_image'] = 'from maix import image'
  var w = generator.valueToCode(block, 'width', python.Order.ATOMIC)
  var h = generator.valueToCode(block, 'height', python.Order.ATOMIC)
  var c = block.getFieldValue('color')
  var code = `image.Image(${w}, ${h})` // Simplified
  
  return [code, python.Order.ATOMIC]
}

python.pythonGenerator.forBlock['maix4_image_draw_string'] = function (block, generator) {
  var img = generator.valueToCode(block, 'image', python.Order.ATOMIC)
  var text = generator.valueToCode(block, 'text', python.Order.ATOMIC)
  var x = generator.valueToCode(block, 'x', python.Order.ATOMIC)
  var y = generator.valueToCode(block, 'y', python.Order.ATOMIC)
  var color = block.getFieldValue('color')
  
  return `${img}.draw_string(${x}, ${y}, ${text}, color="${color}")\n`
}

// Basic Blocks Generators
python.pythonGenerator.forBlock['maix4_display_camera'] = function (block, generator) {
  generator.definitions_['from_maix_import_camera'] = 'from maix import camera'
  generator.definitions_['from_maix_import_display'] = 'from maix import display'

  // Ensure cam and disp exist
  if (!generator.definitions_['init_display']) generator.definitions_['init_display'] = 'disp = display.Display()'

  // Use cam directly or init default
  var cam_init = generator.definitions_['init_camera'] ? '' : 'cam = camera.Camera(640, 480)\n'

  if (!generator.definitions_['init_camera']) {
    generator.definitions_['init_camera'] = 'cam = camera.Camera(640, 480)'
  }

  return 'disp.show(cam.read())\n'
}

python.pythonGenerator.forBlock['maix4_set_display_color'] = function (block, generator) {
  generator.definitions_['from_maix_import_display'] = 'from maix import display'
  generator.definitions_['from_maix_import_image'] = 'from maix import image'
  if (!generator.definitions_['init_display']) generator.definitions_['init_display'] = 'disp = display.Display()'

  var colour_color = block.getFieldValue('color')
  var r = parseInt(colour_color.substr(1, 2), 16)
  var g = parseInt(colour_color.substr(3, 2), 16)
  var b = parseInt(colour_color.substr(5, 2), 16)

  return `_tmp_img = image.Image(disp.width(), disp.height())\n_tmp_img.draw_rect(0, 0, disp.width(), disp.height(), color=(${r}, ${g}, ${b}), thickness=-1)\ndisp.show(_tmp_img)\n`
}

python.pythonGenerator.forBlock['maix4_draw_string'] = function (block, generator) {
  generator.definitions_['from_maix_import_display'] = 'from maix import display'
  generator.definitions_['from_maix_import_image'] = 'from maix import image'
  if (!generator.definitions_['init_display']) generator.definitions_['init_display'] = 'disp = display.Display()'

  var value_text = generator.valueToCode(block, 'text', python.Order.NONE)
  var value_x = generator.valueToCode(block, 'x', python.Order.ATOMIC)
  var value_y = generator.valueToCode(block, 'y', python.Order.ATOMIC)
  var colour_color = block.getFieldValue('color')
  var value_scale = generator.valueToCode(block, 'scale', python.Order.ATOMIC)

  var r = parseInt(colour_color.substring(1, 3), 16)
  var g = parseInt(colour_color.substring(3, 5), 16)
  var b = parseInt(colour_color.substring(5, 7), 16)

  // Create a new image to draw on and show, similar to V3 behavior
  return `_display_text_image = image.Image(disp.width(), disp.height())\n_display_text_image.draw_string(${value_x}, ${value_y}, str(${value_text}), scale=${value_scale}, color=(${r}, ${g}, ${b}))\ndisp.show(_display_text_image)\n`
}

python.pythonGenerator.forBlock['maix4_forever'] = function (block, generator) {
  var statements_code = generator.statementToCode(block, 'code')
  
  return `while True:\n${statements_code || "  pass"}\n`
}
