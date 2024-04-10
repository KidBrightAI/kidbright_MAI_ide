python.pythonGenerator.forBlock['maix3_display_camera'] = function(block, generator) {
    generator.definitions_['from_maix_import_camera'] = 'from maix import camera';
    generator.definitions_['from_maix_import_display'] = 'from maix import display';
    var code = 'display.show(camera.capture())\n';
    return code;
};

python.pythonGenerator.forBlock['maix3_set_display_color'] = function(block, generator) {
    generator.definitions_['from_maix_import_display'] = 'from maix import display';
    generator.definitions_['from_maix_import_image'] = 'from maix import image';
    generator.definitions_['from_maix_import_camera'] = 'from maix import camera';
    var colour_color = block.getFieldValue('color');
    var r = parseInt(colour_color.substr(1,2), 16);
    var g = parseInt(colour_color.substr(3,2), 16);
    var b = parseInt(colour_color.substr(5,2), 16);

    var code = `display.show(image.new(size = (240, 240),color = (${r}, ${g}, ${b}), mode = "RGB"))\n`;
    return code;
};

python.pythonGenerator.forBlock['maix3_draw_string'] = function(block, generator) {
    generator.definitions_['from_maix_import_display'] = 'from maix import display';
    generator.definitions_['from_maix_import_image'] = 'from maix import image';
    generator.definitions_['from_maix_import_camera'] = 'from maix import camera';
    //generator.definitions_['_display_text_image'] = '_display_text_image = image.new(size = (240, 240), color = (0, 0, 0), mode = "RGB")';
    var value_text = generator.valueToCode(block, 'text', python.Order.NONE);
    var value_x = generator.valueToCode(block, 'x', python.Order.ATOMIC);
    var value_y = generator.valueToCode(block, 'y', python.Order.ATOMIC);
    var colour_color = block.getFieldValue('color');
    var value_scale = generator.valueToCode(block, 'scale', python.Order.ATOMIC);
    // extract color rgb from color hex
    var r = parseInt(colour_color.substring(1,3),16);
    var g = parseInt(colour_color.substring(3,5),16);
    var b = parseInt(colour_color.substring(5,7),16);
    var code = `_display_text_image = image.new(size = (240, 240), color = (0, 0, 0), mode = "RGB")\n_display_text_image.draw_string(${value_x}, ${value_y}, str(${value_text}), scale=${value_scale}, color=(${r}, ${g}, ${b}))\ndisplay.show(_display_text_image)\n`;
    return code;
};

python.pythonGenerator.forBlock['maix3_forever'] = function(block, generator) {
    var statements_code = generator.statementToCode(block, 'code');
    var code = `while True:\n${statements_code || "  pass"}\n`;
    return code;
  };
