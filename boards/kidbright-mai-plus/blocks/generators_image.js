python.pythonGenerator.forBlock['image_new'] = function (block, generator) {
  generator.definitions_['from_maix_import_image'] = 'from maix import image'
  var w = generator.valueToCode(block, 'width', python.Order.ATOMIC)
  var h = generator.valueToCode(block, 'height', python.Order.ATOMIC)
  var c = block.getFieldValue('color')
  var code = `image.Image(${w}, ${h})` // Simplified

  return [code, python.Order.ATOMIC]
}

python.pythonGenerator.forBlock['image_draw_string'] = function (block, generator) {
  var img = generator.valueToCode(block, 'image', python.Order.ATOMIC)
  var text = generator.valueToCode(block, 'text', python.Order.ATOMIC)
  var x = generator.valueToCode(block, 'x', python.Order.ATOMIC)
  var y = generator.valueToCode(block, 'y', python.Order.ATOMIC)
  var color = block.getFieldValue('color')
  var scale = generator.valueToCode(block, 'scale', python.Order.ATOMIC) || "1"
  var thickness = generator.valueToCode(block, 'thickness', python.Order.ATOMIC) || "1"

  var r = parseInt(color.substring(1, 3), 16)
  var g = parseInt(color.substring(3, 5), 16)
  var b = parseInt(color.substring(5, 7), 16)

  return `${img}.draw_string(${x}, ${y}, str(${text}), scale=${scale}, thickness=${thickness}, color=image.Color.from_rgb(${r}, ${g}, ${b}))\n`
}

python.pythonGenerator.forBlock['image_draw_line'] = function (block, generator) {
  generator.definitions_['from_maix_import_image'] = 'from maix import image'
  var value_image = generator.valueToCode(block, 'image', python.Order.NONE)
  var value_x1 = generator.valueToCode(block, 'x1', python.Order.ATOMIC)
  var value_y1 = generator.valueToCode(block, 'y1', python.Order.ATOMIC)
  var value_x2 = generator.valueToCode(block, 'x2', python.Order.ATOMIC)
  var value_y2 = generator.valueToCode(block, 'y2', python.Order.ATOMIC)
  var colour_color = block.getFieldValue('color')
  var value_thickness = generator.valueToCode(block, 'thickness', python.Order.ATOMIC)

  // extract color rgb from color hex
  var r = parseInt(colour_color.substring(1, 3), 16)
  var g = parseInt(colour_color.substring(3, 5), 16)
  var b = parseInt(colour_color.substring(5, 7), 16)

  return `${value_image}.draw_line(${value_x1}, ${value_y1}, ${value_x2}, ${value_y2}, color=image.Color.from_rgb(${r}, ${g}, ${b}), thickness=${value_thickness})\n`
}

python.pythonGenerator.forBlock['image_draw_rectangle'] = function (block, generator) {
  generator.definitions_['from_maix_import_image'] = 'from maix import image'
  var value_image = generator.valueToCode(block, 'image', python.Order.NONE)
  var value_x = generator.valueToCode(block, 'x', python.Order.ATOMIC)
  var value_y = generator.valueToCode(block, 'y', python.Order.ATOMIC)
  var value_w = generator.valueToCode(block, 'w', python.Order.ATOMIC)
  var value_h = generator.valueToCode(block, 'h', python.Order.ATOMIC)
  var colour_color = block.getFieldValue('color')

  // extract color rgb from color hex
  var r = parseInt(colour_color.substring(1, 3), 16)
  var g = parseInt(colour_color.substring(3, 5), 16)
  var b = parseInt(colour_color.substring(5, 7), 16)
  var value_thickness = generator.valueToCode(block, 'thickness', python.Order.ATOMIC)

  return `${value_image}.draw_rect(${value_x}, ${value_y}, ${value_w}, ${value_h}, color=image.Color.from_rgb(${r}, ${g}, ${b}), thickness=${value_thickness})\n`
}

python.pythonGenerator.forBlock['image_draw_circle'] = function (block, generator) {
  generator.definitions_['from_maix_import_image'] = 'from maix import image'
  var value_image = generator.valueToCode(block, 'image', python.Order.NONE)
  var value_x1 = generator.valueToCode(block, 'x1', python.Order.ATOMIC)
  var value_y1 = generator.valueToCode(block, 'y1', python.Order.ATOMIC)
  var value_radius = generator.valueToCode(block, 'radius', python.Order.ATOMIC)
  var colour_color = block.getFieldValue('color')
  var value_thickness = generator.valueToCode(block, 'thickness', python.Order.ATOMIC)

  // extract color rgb from color hex
  var r = parseInt(colour_color.substring(1, 3), 16)
  var g = parseInt(colour_color.substring(3, 5), 16)
  var b = parseInt(colour_color.substring(5, 7), 16)

  return `${value_image}.draw_circle(${value_x1}, ${value_y1}, ${value_radius}, color=image.Color.from_rgb(${r}, ${g}, ${b}), thickness=${value_thickness})\n`
}

python.pythonGenerator.forBlock['image_draw_ellipse'] = function (block, generator) {
  generator.definitions_['from_maix_import_image'] = 'from maix import image'
  var value_image = generator.valueToCode(block, 'image', python.Order.NONE)
  var value_x1 = generator.valueToCode(block, 'x1', python.Order.ATOMIC)
  var value_y1 = generator.valueToCode(block, 'y1', python.Order.ATOMIC)
  var value_radius_x = generator.valueToCode(block, 'radius_x', python.Order.ATOMIC)
  var value_radius_y = generator.valueToCode(block, 'radius_y', python.Order.ATOMIC)
  var value_rotate = generator.valueToCode(block, 'rotate', python.Order.ATOMIC)
  var value_angle_start = generator.valueToCode(block, 'angle_start', python.Order.ATOMIC)
  var value_angle_end = generator.valueToCode(block, 'angle_end', python.Order.ATOMIC)
  var colour_color = block.getFieldValue('color')
  var value_thickness = generator.valueToCode(block, 'thickness', python.Order.ATOMIC)

  // extract color rgb from color hex
  var r = parseInt(colour_color.substring(1, 3), 16)
  var g = parseInt(colour_color.substring(3, 5), 16)
  var b = parseInt(colour_color.substring(5, 7), 16)

  // missing some value
  return `${value_image}.draw_ellipse(${value_x1}, ${value_y1}, ${value_radius_x}, ${value_radius_y}, ${value_rotate}, ${value_angle_start}, ${value_angle_end}, color=image.Color.from_rgb(${r}, ${g}, ${b}), thickness=${value_thickness})\n`
}

python.pythonGenerator.forBlock['image_crop'] = function (block, generator) {
  generator.definitions_['from_maix_import_image'] = 'from maix import image'
  var value_image = generator.valueToCode(block, 'image', python.Order.NONE)
  var value_x = generator.valueToCode(block, 'x', python.Order.ATOMIC)
  var value_y = generator.valueToCode(block, 'y', python.Order.ATOMIC)
  var value_w = generator.valueToCode(block, 'w', python.Order.ATOMIC)
  var value_h = generator.valueToCode(block, 'h', python.Order.ATOMIC)
  var code = `${value_image}.crop(${value_x}, ${value_y}, ${value_w}, ${value_h})`

  return [code, python.Order.NONE]
}

python.pythonGenerator.forBlock['image_resize'] = function (block, generator) {
  generator.definitions_['from_maix_import_image'] = 'from maix import image'
  var value_image = generator.valueToCode(block, 'image', python.Order.NONE)
  var value_width = generator.valueToCode(block, 'width', python.Order.ATOMIC)
  var value_height = generator.valueToCode(block, 'height', python.Order.ATOMIC)
  var code = `${value_image}.resize(${value_width}, ${value_height})`

  return [code, python.Order.NONE]
}

python.pythonGenerator.forBlock['image_flip'] = function (block, generator) {
  generator.definitions_['from_maix_import_image'] = 'from maix import image'
  var value_image = generator.valueToCode(block, 'image', python.Order.NONE)
  var dropdown_direction = block.getFieldValue('direction')
  var code = `${value_image}.flip(${dropdown_direction})`

  return [code, python.Order.NONE]
}

python.pythonGenerator.forBlock['image_rotate'] = function (block, generator) {
  generator.definitions_['from_maix_import_image'] = 'from maix import image'
  var value_image = generator.valueToCode(block, 'image', python.Order.NONE)
  var angle_angle = block.getFieldValue('angle')
  var code = `${value_image}.rotate(${angle_angle})`

  return [code, python.Order.NONE]
}

python.pythonGenerator.forBlock['image_copy'] = function (block, generator) {
  generator.definitions_['from_maix_import_image'] = 'from maix import image'
  var value_image = generator.valueToCode(block, 'image', python.Order.NONE)
  var code = `${value_image}.copy()`

  // TODO: Change ORDER_NONE to the correct strength.
  return [code, python.Order.NONE]
}

python.pythonGenerator.forBlock['image_save'] = function (block, generator) {
  generator.definitions_['from_maix_import_image'] = 'from maix import image'
  var value_image = generator.valueToCode(block, 'image', python.Order.NONE)
  var text_path = block.getFieldValue('path')

  return `${value_image}.save("${text_path}")\n`
}

python.pythonGenerator.forBlock['image_open'] = function (block, generator) {
  generator.definitions_['from_maix_import_image'] = 'from maix import image'
  var value_var = generator.valueToCode(block, 'var', python.Order.NONE)
  var text_path = block.getFieldValue('path')
  console.log(value_var)

  return `${value_var} = image.load("${text_path}")\n`
}

python.pythonGenerator.forBlock['image_new_maix3'] = function (block, generator) {
  generator.definitions_['from_maix_import_image'] = 'from maix import image'
  var value_width = generator.valueToCode(block, 'width', python.Order.ATOMIC)
  var value_height = generator.valueToCode(block, 'height', python.Order.ATOMIC)
  var colour_color = block.getFieldValue('color')

  //extract hex color to rgb
  var r = parseInt(colour_color.substring(1, 3), 16)
  var g = parseInt(colour_color.substring(3, 5), 16)
  var b = parseInt(colour_color.substring(5, 7), 16)
  var code = `image.Image(${value_width}, ${value_height}, image.Format.FMT_RGB888)`

  return [code, python.Order.NONE]
}

python.pythonGenerator.forBlock['image_draw_cross'] = function (block, generator) {
  generator.definitions_['from_maix_import_image'] = 'from maix import image'
  var value_image = generator.valueToCode(block, 'image', python.Order.NONE)
  var value_x = generator.valueToCode(block, 'x', python.Order.ATOMIC)
  var value_y = generator.valueToCode(block, 'y', python.Order.ATOMIC)
  var colour_color = block.getFieldValue('color')
  var value_size = generator.valueToCode(block, 'size', python.Order.ATOMIC)
  var value_thickness = generator.valueToCode(block, 'thickness', python.Order.ATOMIC)

  var r = parseInt(colour_color.substring(1, 3), 16)
  var g = parseInt(colour_color.substring(3, 5), 16)
  var b = parseInt(colour_color.substring(5, 7), 16)

  return `${value_image}.draw_cross(${value_x}, ${value_y}, color=image.Color.from_rgb(${r}, ${g}, ${b}), size=${value_size}, thickness=${value_thickness})\n`
}

python.pythonGenerator.forBlock['image_draw_arrow'] = function (block, generator) {
  generator.definitions_['from_maix_import_image'] = 'from maix import image'
  var value_image = generator.valueToCode(block, 'image', python.Order.NONE)
  var value_x1 = generator.valueToCode(block, 'x1', python.Order.ATOMIC)
  var value_y1 = generator.valueToCode(block, 'y1', python.Order.ATOMIC)
  var value_x2 = generator.valueToCode(block, 'x2', python.Order.ATOMIC)
  var value_y2 = generator.valueToCode(block, 'y2', python.Order.ATOMIC)
  var colour_color = block.getFieldValue('color')
  var value_thickness = generator.valueToCode(block, 'thickness', python.Order.ATOMIC)

  var r = parseInt(colour_color.substring(1, 3), 16)
  var g = parseInt(colour_color.substring(3, 5), 16)
  var b = parseInt(colour_color.substring(5, 7), 16)

  return `${value_image}.draw_arrow(${value_x1}, ${value_y1}, ${value_x2}, ${value_y2}, color=image.Color.from_rgb(${r}, ${g}, ${b}), thickness=${value_thickness})\n`
}

python.pythonGenerator.forBlock['image_draw_image'] = function (block, generator) {
  generator.definitions_['from_maix_import_image'] = 'from maix import image'
  var value_image = generator.valueToCode(block, 'image', python.Order.NONE)
  var value_image2 = generator.valueToCode(block, 'image2', python.Order.NONE)
  var value_x = generator.valueToCode(block, 'x', python.Order.ATOMIC)
  var value_y = generator.valueToCode(block, 'y', python.Order.ATOMIC)

  return `${value_image}.draw_image(${value_x}, ${value_y}, ${value_image2})\n`
}

python.pythonGenerator.forBlock['image_to_format'] = function (block, generator) {
  generator.definitions_['from_maix_import_image'] = 'from maix import image'
  var value_image = generator.valueToCode(block, 'image', python.Order.NONE)
  var dropdown_format = block.getFieldValue('format')

  var code = `${value_image}.to_format(${dropdown_format})`
  return [code, python.Order.NONE]
}

python.pythonGenerator.forBlock['image_to_bytes'] = function (block, generator) {
  generator.definitions_['from_maix_import_image'] = 'from maix import image'
  var value_image = generator.valueToCode(block, 'image', python.Order.NONE)

  var code = `${value_image}.to_bytes()`
  return [code, python.Order.NONE]
}

python.pythonGenerator.forBlock['image_from_bytes'] = function (block, generator) {
  generator.definitions_['from_maix_import_image'] = 'from maix import image'
  var value_data = generator.valueToCode(block, 'data', python.Order.NONE)
  var value_width = generator.valueToCode(block, 'width', python.Order.ATOMIC)
  var value_height = generator.valueToCode(block, 'height', python.Order.ATOMIC)
  var dropdown_format = block.getFieldValue('format')

  var code = `image.from_bytes(${value_width}, ${value_height}, ${dropdown_format}, ${value_data})`
  return [code, python.Order.NONE]
}
