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
