python.pythonGenerator.forBlock['maix3_display_camera'] = function(block, generator) {
  generator.definitions_['from_maix_import_camera'] = 'from maix import camera'
  generator.definitions_['from_maix_import_display'] = 'from maix import display'
  
  return "try:\n  import js\n  if hasattr(js, 'writePinToKMV'):\n    js.writePinToKMV('DISPLAY_CAMERA', '1')\nexcept Exception:\n  pass\ndisplay.show(camera.capture())\n"
}

var COLOUR_PALETTE_70 = [
  "#ffffff", "#cccccc", "#c0c0c0", "#999999", "#666666", "#333333", "#000000",
  "#ffcccc", "#ff6666", "#ff0000", "#cc0000", "#990000", "#660000", "#330000",
  "#ffcc99", "#ff9966", "#ff9900", "#ff6600", "#cc6600", "#993300", "#663300",
  "#ffff99", "#ffff66", "#ffcc66", "#ffcc33", "#cc9933", "#996633", "#663333",
  "#ffffcc", "#ffff33", "#ffff00", "#ffcc00", "#999900", "#666600", "#333300",
  "#99ff99", "#66ff99", "#33ff33", "#33cc00", "#009900", "#006600", "#003300",
  "#99ffff", "#33ffff", "#66cccc", "#00cccc", "#339999", "#336666", "#003333",
  "#ccffff", "#66ffff", "#33ccff", "#3366ff", "#3333ff", "#000099", "#000066",
  "#ccccff", "#9999ff", "#6666cc", "#6633ff", "#6600cc", "#333399", "#330099",
  "#ffccff", "#ff99ff", "#cc66cc", "#cc33cc", "#993399", "#663366", "#330033"
]

python.pythonGenerator.forBlock['maix3_set_display_color'] = function(block, generator) {
  generator.definitions_['from_maix_import_display'] = 'from maix import display'
  generator.definitions_['from_maix_import_image'] = 'from maix import image'
  generator.definitions_['from_maix_import_camera'] = 'from maix import camera'
  var colour_color = block.getFieldValue('color') || '#ff0000'
  var r = parseInt(colour_color.substr(1,2), 16)
  var g = parseInt(colour_color.substr(3,2), 16)
  var b = parseInt(colour_color.substr(5,2), 16)

  var color_idx = COLOUR_PALETTE_70.indexOf(colour_color.toLowerCase()) + 1
  if (color_idx <= 0) color_idx = 10

  return `try:\n  import js\n  if hasattr(js, 'writePinToKMV'):\n    js.writePinToKMV('DISPLAY_COLOR', '${color_idx}')\nexcept Exception:\n  pass\ndisplay.show(image.new(size = (240, 240),color = (${r}, ${g}, ${b}), mode = "RGB"))\n`
}

python.pythonGenerator.forBlock['maix3_draw_string'] = function(block, generator) {
  generator.definitions_['from_maix_import_display'] = 'from maix import display'
  generator.definitions_['from_maix_import_image'] = 'from maix import image'
  generator.definitions_['from_maix_import_camera'] = 'from maix import camera'

  var value_text = generator.valueToCode(block, 'text', python.Order.NONE) || '""'
  var value_x = generator.valueToCode(block, 'x', python.Order.ATOMIC) || '0'
  var value_y = generator.valueToCode(block, 'y', python.Order.ATOMIC) || '0'
  var colour_color = block.getFieldValue('color') || '#ff0000'
  var value_scale = generator.valueToCode(block, 'scale', python.Order.ATOMIC) || '1'

  // extract color rgb from color hex
  var r = parseInt(colour_color.substring(1,3),16)
  var g = parseInt(colour_color.substring(3,5),16)
  var b = parseInt(colour_color.substring(5,7),16)

  var color_idx = COLOUR_PALETTE_70.indexOf(colour_color.toLowerCase()) + 1
  if (color_idx <= 0) color_idx = 10
  
  return `try:\n  import js\n  if hasattr(js, 'writePinToKMV'):\n    js.writePinToKMV('DRAW_TEXT', '1,%s,%s,%s,%s,%s' % (str(${value_text}), str(${value_x}), str(${value_y}), '${color_idx}', str(${value_scale})))\nexcept Exception:\n  pass\n_display_text_image = image.new(size = (240, 240), color = (0, 0, 0), mode = "RGB")\n_display_text_image.draw_string(${value_x}, ${value_y}, str(${value_text}), scale=${value_scale}, color=(${r}, ${g}, ${b}))\ndisplay.show(_display_text_image)\n`
}

python.pythonGenerator.forBlock['maix3_forever'] = function(block, generator) {
  var statements_code = generator.statementToCode(block, 'code')
  
  return `while True:\n${statements_code || "  pass"}\n`
}
