python.pythonGenerator.forBlock['maix3_image_draw_string'] = function(block, generator) {
    generator.definitions_['from_maix_import_image'] = 'from maix import image';
    var value_image = generator.valueToCode(block, 'image', python.Order.ATOMIC);
    var value_text = generator.valueToCode(block, 'text', python.Order.ATOMIC);
    var value_x = generator.valueToCode(block, 'x', python.Order.ATOMIC);
    var value_y = generator.valueToCode(block, 'y', python.Order.ATOMIC);
    var colour_color = block.getFieldValue('color');
    var value_scale = generator.valueToCode(block, 'scale', python.Order.ATOMIC);
    var value_thickness = generator.valueToCode(block, 'thickness', python.Order.ATOMIC);
    // extract color rgb from color hex
    var r = parseInt(colour_color.substring(1,3),16);
    var g = parseInt(colour_color.substring(3,5),16);
    var b = parseInt(colour_color.substring(5,7),16);
    var code = `${value_image}.draw_string(${value_x}, ${value_y}, ${value_text}, scale=${value_scale}, color=(${r}, ${g}, ${b}))\n`;
    return code;
  };
  
  python.pythonGenerator.forBlock['maix3_image_draw_line'] = function(block, generator) {
    generator.definitions_['from_maix_import_image'] = 'from maix import image';
    var value_image = generator.valueToCode(block, 'image', python.Order.ATOMIC);
    var value_x1 = generator.valueToCode(block, 'x1', python.Order.ATOMIC);
    var value_y1 = generator.valueToCode(block, 'y1', python.Order.ATOMIC);
    var value_x2 = generator.valueToCode(block, 'x2', python.Order.ATOMIC);
    var value_y2 = generator.valueToCode(block, 'y2', python.Order.ATOMIC);
    var colour_color = block.getFieldValue('color');
    var value_thickness = generator.valueToCode(block, 'thickness', python.Order.ATOMIC);
    // extract color rgb from color hex
    var r = parseInt(colour_color.substring(1,3),16);
    var g = parseInt(colour_color.substring(3,5),16);
    var b = parseInt(colour_color.substring(5,7),16);
    var code = `${value_image}.draw_line(${value_x1}, ${value_y1}, ${value_x2}, ${value_y2}, color=(${r}, ${g}, ${b}), thickness=${value_thickness})\n`;
    return code;
  };
  
  python.pythonGenerator.forBlock['maix3_image_draw_rectangle'] = function(block, generator) {
    generator.definitions_['from_maix_import_image'] = 'from maix import image';
    var value_image = generator.valueToCode(block, 'image', python.Order.ATOMIC);
    var value_x1 = generator.valueToCode(block, 'x1', python.Order.ATOMIC);
    var value_y1 = generator.valueToCode(block, 'y1', python.Order.ATOMIC);
    var value_x2 = generator.valueToCode(block, 'x2', python.Order.ATOMIC);
    var value_y2 = generator.valueToCode(block, 'y2', python.Order.ATOMIC);
    var colour_color = block.getFieldValue('color');
    // extract color rgb from color hex
    var r = parseInt(colour_color.substring(1,3),16);
    var g = parseInt(colour_color.substring(3,5),16);
    var b = parseInt(colour_color.substring(5,7),16);
    var value_thickness = generator.valueToCode(block, 'thickness', python.Order.ATOMIC);    
    var code = `${value_image}.draw_rectangle(${value_x1}, ${value_y1}, ${value_x2}, ${value_y2}, color=(${r}, ${g}, ${b}), thickness=${value_thickness})\n`;
    return code;
  };
  
  python.pythonGenerator.forBlock['maix3_image_draw_circle'] = function(block, generator) {
    generator.definitions_['from_maix_import_image'] = 'from maix import image';
    var value_image = generator.valueToCode(block, 'image', python.Order.ATOMIC);
    var value_x1 = generator.valueToCode(block, 'x1', python.Order.ATOMIC);
    var value_y1 = generator.valueToCode(block, 'y1', python.Order.ATOMIC);
    var value_radius = generator.valueToCode(block, 'radius', python.Order.ATOMIC);
    var colour_color = block.getFieldValue('color');
    var value_thickness = generator.valueToCode(block, 'thickness', python.Order.ATOMIC);
    // extract color rgb from color hex
    var r = parseInt(colour_color.substring(1,3),16);
    var g = parseInt(colour_color.substring(3,5),16);
    var b = parseInt(colour_color.substring(5,7),16);
    var code = `${value_image}.draw_circle(${value_x1}, ${value_y1}, ${value_radius}, color=(${r}, ${g}, ${b}), thickness=${value_thickness})\n`;
    return code;
  };
  
  python.pythonGenerator.forBlock['maix3_image_draw_ellipse'] = function(block, generator) {
    generator.definitions_['from_maix_import_image'] = 'from maix import image';
    var value_image = generator.valueToCode(block, 'image', python.Order.ATOMIC);
    var value_x1 = generator.valueToCode(block, 'x1', python.Order.ATOMIC);
    var value_y1 = generator.valueToCode(block, 'y1', python.Order.ATOMIC);
    var value_radius_x = generator.valueToCode(block, 'radius_x', python.Order.ATOMIC);
    var value_radius_y = generator.valueToCode(block, 'radius_y', python.Order.ATOMIC);
    var value_rotate = generator.valueToCode(block, 'rotate', python.Order.ATOMIC);
    var value_angle_start = generator.valueToCode(block, 'angle_start', python.Order.ATOMIC);
    var value_angle_end = generator.valueToCode(block, 'angle_end', python.Order.ATOMIC);
    var colour_color = block.getFieldValue('color');
    var value_thickness = generator.valueToCode(block, 'thickness', python.Order.ATOMIC);
    // extract color rgb from color hex
    var r = parseInt(colour_color.substring(1,3),16);
    var g = parseInt(colour_color.substring(3,5),16);
    var b = parseInt(colour_color.substring(5,7),16);
    // missing some value
    var code = `${value_image}.draw_ellipse(${value_x1}, ${value_y1}, ${value_radius_x}, ${value_radius_y}, ${value_rotate}, ${value_angle_start}, ${value_angle_end}, color=(${r}, ${g}, ${b}), thickness=${value_thickness})\n`;
    return code;
  };
  
  python.pythonGenerator.forBlock['maix3_image_crop'] = function(block, generator) {
    generator.definitions_['from_maix_import_image'] = 'from maix import image';
    var value_image = generator.valueToCode(block, 'image', python.Order.ATOMIC);
    var value_x1 = generator.valueToCode(block, 'x1', python.Order.ATOMIC);
    var value_y1 = generator.valueToCode(block, 'y1', python.Order.ATOMIC);
    var value_x2 = generator.valueToCode(block, 'x2', python.Order.ATOMIC);
    var value_y2 = generator.valueToCode(block, 'y2', python.Order.ATOMIC);
    var code = `${value_image}.crop(${value_x1}, ${value_y1}, ${value_x2}, ${value_y2})`;
    return [code, python.Order.NONE];
  };
  
  python.pythonGenerator.forBlock['maix3_image_resize'] = function(block, generator) {
    generator.definitions_['from_maix_import_image'] = 'from maix import image';
    var value_image = generator.valueToCode(block, 'image', python.Order.ATOMIC);
    var value_width = generator.valueToCode(block, 'width', python.Order.ATOMIC);
    var value_height = generator.valueToCode(block, 'height', python.Order.ATOMIC);    
    var code = `${value_image}.resize(${value_width}, ${value_height})`;    
    return [code, python.Order.NONE];
  };
  
  python.pythonGenerator.forBlock['maix3_image_flip'] = function(block, generator) {
    generator.definitions_['from_maix_import_image'] = 'from maix import image';
    var value_image = generator.valueToCode(block, 'image', python.Order.ATOMIC);
    var dropdown_direction = block.getFieldValue('direction');    
    var code = `${value_image}.flip(${dropdown_direction})`;    
    return [code, python.Order.NONE];
  };
  
  python.pythonGenerator.forBlock['maix3_image_rotate'] = function(block, generator) {
    generator.definitions_['from_maix_import_image'] = 'from maix import image';
    var value_image = generator.valueToCode(block, 'image', python.Order.ATOMIC);
    var angle_angle = block.getFieldValue('angle');    
    var code = `${value_image}.rotate(${angle_angle})`;    
    return [code, python.Order.NONE];
  };
  
  python.pythonGenerator.forBlock['maix3_image_copy'] = function(block, generator) {
    generator.definitions_['from_maix_import_image'] = 'from maix import image';
    var value_image = generator.valueToCode(block, 'image', python.Order.ATOMIC);    
    var code = `${value_image}.copy()`;
    // TODO: Change ORDER_NONE to the correct strength.
    return [code, python.Order.NONE];
  };
  
  python.pythonGenerator.forBlock['maix3_image_save'] = function(block, generator) {
    generator.definitions_['from_maix_import_image'] = 'from maix import image';
    var value_image = generator.valueToCode(block, 'image', python.Order.ATOMIC);
    var text_path = block.getFieldValue('path');    
    var code = `${value_image}.save("${text_path}")\n`;
    return code;
  };
  
  python.pythonGenerator.forBlock['maix3_image_open'] = function(block, generator) {
    generator.definitions_['from_maix_import_image'] = 'from maix import image';
    var text_path = block.getFieldValue('path');    
    var code = `image.open("${text_path}")`;
    return [code, python.Order.NONE];
  };
  
  python.pythonGenerator.forBlock['maix3_image_new'] = function(block, generator) {
    generator.definitions_['from_maix_import_image'] = 'from maix import image';
    var value_width = generator.valueToCode(block, 'width', python.Order.ATOMIC);
    var value_height = generator.valueToCode(block, 'height', python.Order.ATOMIC);
    var colour_color = block.getFieldValue('color');
    //extract hex color to rgb
    var r = parseInt(colour_color.substring(1,3),16);
    var g = parseInt(colour_color.substring(3,5),16);
    var b = parseInt(colour_color.substring(5,7),16);
    var code = `image.new(size=(${value_width}, ${value_height}), color=(${r}, ${g}, ${b}), mode = "RGB")`;
    return [code, python.Order.NONE];
  };
