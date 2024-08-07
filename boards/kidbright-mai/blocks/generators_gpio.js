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
  generator.definitions_['from_v831adc_import_v83x_ADC'] = 'from v831adc import v83x_ADC';
  generator.definitions_['__adc_key'] = '__adc_key = v83x_ADC()';
  //generator.definitions_['from_evdev_import_InputDevice'] = 'from evdev import InputDevice';
  //generator.definitions_['keys_device'] = 'keys_device = InputDevice("/dev/input/event0")';
  var functionName = generator.provideFunction_(
      '_keyADC_isKeyPressed',
      ['def ' + "_keyADC_isKeyPressed" + '(key):',
      '  adc_val = __adc_key.value()',
      '  if adc_val < 300 and key == "S1":',
      '    return True',
      '  if adc_val > 300 and adc_val < 1000 and key == "S2":',
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
  var code = '(1 - (_gpio_'+dropdown_pin+'.get_value()))';
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

python.pythonGenerator.forBlock['board_get_acc'] = function(block, generator) {
  generator.definitions_['import_msa311'] = 'import msa311';
  generator.definitions_['from_maix_import_i2c'] = 'from maix import i2c';  
  generator.definitions_['_i2c_msa311'] = '_i2c_msa311 = i2c.I2C("/dev/i2c-1", 0x62)';
  generator.definitions_['_msa311'] = '_msa311 = msa311.MSA311(_i2c_msa311)';
  generator.definitions_['_msa311_enable_tap_detection'] = '_msa311.enable_tap_detection()';
  var dropdown_axis = block.getFieldValue('axis');
  var code = `_msa311.acceleration[${dropdown_axis}]`;
  return [code, python.Order.ATOMIC];
};

python.pythonGenerator.forBlock['board_get_acc_tap'] = function(block, generator) {
  generator.definitions_['import_msa311'] = 'import msa311';
  generator.definitions_['from_maix_import_i2c'] = 'from maix import i2c';  
  generator.definitions_['_i2c_msa311'] = '_i2c_msa311 = i2c.I2C("/dev/i2c-1", 0x62)';
  generator.definitions_['_msa311'] = '_msa311 = msa311.MSA311(_i2c_msa311)';
  generator.definitions_['_msa311_enable_tap_detection'] = '_msa311.enable_tap_detection()';
  var code = `_msa311.tapped`;
  return [code, python.Order.ATOMIC];
};

//servo motor
python.pythonGenerator.forBlock['maixpy3_gpio_servo'] = function(block, generator) {
  generator.definitions_['from_servo_import_V831Servo'] = 'from servo import V831Servo';  
  var dropdown_pin = block.getFieldValue('pin');
  generator.definitions_['_servo_' + dropdown_pin] = '_servo_' + dropdown_pin + ' = V831Servo(' + dropdown_pin + ')';
  var value_angle = generator.valueToCode(block, 'angle', python.Order.ATOMIC);  
  var code = '_servo_' + dropdown_pin + '.set_angle(' + value_angle + ')\n';
  return code;
};
