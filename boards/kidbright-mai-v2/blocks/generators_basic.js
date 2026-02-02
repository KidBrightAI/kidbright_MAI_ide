python.pythonGenerator.forBlock['maix3_display_camera'] = function(block, generator) {
  generator.definitions_['from_maix_import_camera'] = 'from maix import camera'
  generator.definitions_['from_maix_import_display'] = 'from maix import display'
  generator.definitions_['init_display'] = 'disp = display.Display()'
  generator.definitions_['init_camera'] = 'cam = camera.Camera(disp.width(), disp.height())'
  
  return 'disp.show(cam.read())\n'
}

python.pythonGenerator.forBlock['maix3_set_display_color'] = function(block, generator) {
  generator.definitions_['from_maix_import_display'] = 'from maix import display'
  generator.definitions_['from_maix_import_image'] = 'from maix import image'
  generator.definitions_['init_display'] = 'disp = display.Display()'
  var colour_color = block.getFieldValue('color')
  var r = parseInt(colour_color.substr(1,2), 16)
  var g = parseInt(colour_color.substr(3,2), 16)
  var b = parseInt(colour_color.substr(5,2), 16)

  return `_img = image.Image(disp.width(), disp.height())\n_img.draw_rect(0, 0, disp.width(), disp.height(), color=image.Color.from_rgb(${r}, ${g}, ${b}), thickness=-1)\ndisp.show(_img)\n`
}

python.pythonGenerator.forBlock['maix3_draw_string'] = function(block, generator) {
  generator.definitions_['from_maix_import_display'] = 'from maix import display'
  generator.definitions_['from_maix_import_image'] = 'from maix import image'
  generator.definitions_['init_display'] = 'disp = display.Display()'
    
  var value_text = generator.valueToCode(block, 'text', python.Order.NONE)
  var value_x = generator.valueToCode(block, 'x', python.Order.ATOMIC)
  var value_y = generator.valueToCode(block, 'y', python.Order.ATOMIC)
  var colour_color = block.getFieldValue('color')
  var value_scale = generator.valueToCode(block, 'scale', python.Order.ATOMIC)

  // extract color rgb from color hex
  var r = parseInt(colour_color.substring(1,3),16)
  var g = parseInt(colour_color.substring(3,5),16)
  var b = parseInt(colour_color.substring(5,7),16)
  
  return `_display_text_image = image.Image(disp.width(), disp.height())\n_display_text_image.draw_string(${value_x}, ${value_y}, str(${value_text}), scale=${value_scale}, color=image.Color.from_rgb(${r}, ${g}, ${b}))\ndisp.show(_display_text_image)\n`
}

python.pythonGenerator.forBlock['maix3_forever'] = function(block, generator) {
  generator.definitions_['from_maix_import_app'] = 'from maix import app'
  var statements_code = generator.statementToCode(block, 'code')
  
  return `while not app.need_exit():\n${statements_code || "  pass"}\n`
}