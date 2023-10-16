python.pythonGenerator.forBlock['maix3_nn_classify_load'] = function(block, generator) {
    // TODO: Assemble python into code variable.
    var code = '...\n';
    return code;
  };
  
  python.pythonGenerator.forBlock['maix3_nn_classify_classify'] = function(block, generator) {
    var value_image = generator.valueToCode(block, 'image', python.Order.ATOMIC);
    // TODO: Assemble python into code variable.
    var code = '...\n';
    return code;
  };
  
  python.pythonGenerator.forBlock['maix3_nn_yolo_load'] = function(block, generator) {
    // TODO: Assemble python into code variable.
    var code = '...\n';
    return code;
  };
  
  python.pythonGenerator.forBlock['maix3_nn_yolo_detect'] = function(block, generator) {
    var value_image = generator.valueToCode(block, 'image', python.Order.ATOMIC);
    // TODO: Assemble python into code variable.
    var code = '...\n';
    return code;
  };
  
  python.pythonGenerator.forBlock['maix3_nn_classify_get_result_array'] = function(block, generator) {
    // TODO: Assemble python into code variable.
    var code = '...';
    // TODO: Change ORDER_NONE to the correct strength.
    return [code, python.Order.NONE];
  };
  
  python.pythonGenerator.forBlock['maix3_nn_yolo_get'] = function(block, generator) {
    var dropdown_data = block.getFieldValue('data');
    var value_obj = generator.valueToCode(block, 'obj', python.Order.ATOMIC);
    // TODO: Assemble python into code variable.
    var code = '...';
    // TODO: Change ORDER_NONE to the correct strength.
    return [code, python.Order.NONE];
  };
  
  python.pythonGenerator.forBlock['maix3_nn_classify_get_result'] = function(block, generator) {
    var dropdown_data = block.getFieldValue('data');
    // TODO: Assemble python into code variable.
    var code = '...';
    // TODO: Change ORDER_NONE to the correct strength.
    return [code, python.Order.NONE];
  };
