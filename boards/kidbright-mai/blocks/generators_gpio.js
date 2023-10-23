python.pythonGenerator.forBlock['maixpy3_delay'] = function(block, generator) {
  generator.definitions_['import_time'] = 'import time';
  var value_delay = generator.valueToCode(block, 'delay', python.Order.ATOMIC);  
  var code = 'time.sleep(' + value_delay + ')\n';
  return code;
};

python.pythonGenerator.forBlock['maixpy3_gpio_when_switch'] = function(block, generator) {
  var dropdown_switch = block.getFieldValue('switch');
  var statements_code = generator.statementToCode(block, 'code');
  // TODO: Assemble python into code variable.
  var code = '...\n';
  return code;
};

python.pythonGenerator.forBlock['maixpy3_gpio_switch'] = function(block, generator) {
  generator.definitions_['from_maix_import_gpio'] = 'from maix import gpio';
  generator.definitions_['from_evdev_import_InputDevice'] = 'from evdev import InputDevice';
  generator.definitions_['keys_device'] = 'keys_device = InputDevice("/dev/input/event0")';
  var functionName = generator.provideFunction_(
      '_isKeyPressed',
      ['def ' + "_isKeyPressed" + '(key):',
      '  event = keys_device.read_one()',      
      '  if event is None:',
      '    return False',
      '  if event.value == 1 and event.code == 0x02 and key == "S1":',
      '    return True',
      '  if event.value == 1 and event.code == 0x03 and key == "S2":',
      '    return True',
      '  return False']);      
  var dropdown_switch = block.getFieldValue('switch');
  var code = `${functionName}("${dropdown_switch}")`;    
  return [code, python.Order.NONE];
};

python.pythonGenerator.forBlock['maixpy3_gpio_buzzer'] = function(block, generator) {
  generator.definitions_['import_os'] = 'import os';
  var value_delay = generator.valueToCode(block, 'delay', python.Order.ATOMIC);  
  var code = "os.system('speaker-test -t sine -f 4000 -l 1 > /dev/null & sleep "+ value_delay+" && kill -9 $!')\n";
  return code;
};

python.pythonGenerator.forBlock['maixpy3_gpio_get'] = function(block, generator) {
  generator.definitions_['from_maix_import_gpio'] = 'from maix import gpio';
  var dropdown_pin = block.getFieldValue('pin');
  generator.definitions_['_gpio_'+dropdown_pin] = '_gpio_'+dropdown_pin+' = gpio.gpio('+dropdown_pin+', "H", 1, line_mode = 2)';
  var code = '_gpio_'+dropdown_pin+'.get_value()';
  return [code, python.Order.ATOMIC];
};

python.pythonGenerator.forBlock['maixpy3_gpio_set'] = function(block, generator) {
  generator.definitions_['from_maix_import_gpio'] = 'from maix import gpio';  
  var dropdown_pin = block.getFieldValue('pin');
  generator.definitions_['_gpio_'+dropdown_pin] = '_gpio_'+dropdown_pin+' = gpio.gpio('+dropdown_pin+', "H", 1)';
  var value_value = generator.valueToCode(block, 'value', python.Order.ATOMIC);  
  //if(value_value == 'True') value_value = '1';
  //if(value_value == 'False') value_value = '0';
  var code = '_gpio_'+dropdown_pin+'.set_value('+value_value+')\n';
  return code;
};

python.pythonGenerator.forBlock['maixpy3_gpio_rgb'] = function(block, generator) {
  var value_r = generator.valueToCode(block, 'r', python.Order.ATOMIC);
  var value_g = generator.valueToCode(block, 'g', python.Order.ATOMIC);
  var value_b = generator.valueToCode(block, 'b', python.Order.ATOMIC);
  // TODO: Assemble python into code variable.
  var code = '...\n';
  return code;
};

python.pythonGenerator.forBlock['maixpy3_gpio_rgb_hex'] = function(block, generator) {
  var colour_color = block.getFieldValue('color');
  // TODO: Assemble python into code variable.
  var code = '...\n';
  return code;
};
