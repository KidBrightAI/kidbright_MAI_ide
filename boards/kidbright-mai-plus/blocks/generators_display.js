python.pythonGenerator.forBlock['display_get_width'] = function (block, generator) {
  generator.definitions_['from_maix_import_display'] = 'from maix import display'
  generator.definitions_['init_display'] = 'disp = display.Display()'
  var code = 'disp.width()'

  return [code, python.Order.ATOMIC]
}

python.pythonGenerator.forBlock['display_get_height'] = function (block, generator) {
  generator.definitions_['from_maix_import_display'] = 'from maix import display'
  generator.definitions_['init_display'] = 'disp = display.Display()'
  var code = 'disp.height()'

  return [code, python.Order.ATOMIC]
}

python.pythonGenerator.forBlock['display_resolution'] = function (block, generator) {
  generator.definitions_['from_maix_import_display'] = 'from maix import display'
  var value_width = generator.valueToCode(block, 'width', python.Order.ATOMIC)
  var value_height = generator.valueToCode(block, 'height', python.Order.ATOMIC)

  return `disp = display.Display(width=${value_width}, height=${value_height})\n`
}

python.pythonGenerator.forBlock['display_get_image'] = function (block, generator) {
  // Not directly supported in new API to read back from display
  var code = 'None'

  return [code, python.Order.NONE]
}

python.pythonGenerator.forBlock['display_show'] = function (block, generator) {
  generator.definitions_['from_maix_import_display'] = 'from maix import display'

  // Ensure disp exists.
  if (!generator.definitions_['init_display']) {
    generator.definitions_['init_display'] = 'disp = display.Display()'
  }

  var value_image = generator.valueToCode(block, 'image', python.Order.ATOMIC)

  return `disp.show(${value_image})\n`
}