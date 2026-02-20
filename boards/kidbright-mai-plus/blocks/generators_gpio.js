python.pythonGenerator.forBlock['maixpy3_delay'] = function(block, generator) {
  generator.definitions_['import_time'] = 'import time'
  var value_delay = generator.valueToCode(block, 'delay', python.Order.ATOMIC)  
  
  return 'time.sleep(' + value_delay + ')\n'
}

python.pythonGenerator.forBlock['maixpy3_gpio_when_switch'] = function(block, generator) {
  var dropdown_switch = block.getFieldValue('switch')
  var statements_code = generator.statementToCode(block, 'code')

  // TODO: Assemble python into code variable.
  return '...\n'
}

python.pythonGenerator.forBlock['maixpy3_gpio_switch'] = function(block, generator) {
  generator.definitions_['from_maix_import_gpio'] = 'from maix import adc'
  generator.definitions_['__adc_key'] = '__adc_key = adc.ADC(0, adc.RES_BIT_12)'

  //generator.definitions_['from_evdev_import_InputDevice'] = 'from evdev import InputDevice';
  //generator.definitions_['keys_device'] = 'keys_device = InputDevice("/dev/input/event0")';
  var functionName = generator.provideFunction_(
    '_keyADC_isKeyPressed',
    ['def ' + "_keyADC_isKeyPressed" + '(key):', 
      '  adc_val = __adc_key.read()',
      '  if adc_val < 300 and key == "S1":',
      '    return True',
      '  if adc_val > 300 and adc_val < 1000 and key == "S2":',
      '    return True',
      '  return False'])      
  var dropdown_switch = block.getFieldValue('switch')
  var code = `${functionName}("${dropdown_switch}")`    
  
  return [code, python.Order.NONE]
}

python.pythonGenerator.forBlock['maixpy3_gpio_buzzer'] = function(block, generator) {
  //generator.definitions_['import_os'] = 'import os'
  generator.definitions_['import_audio'] = 'from maix import audio'
  generator.definitions_['import_time'] = 'import time'
  generator.definitions_['__player'] = 'player = audio.Player("/root/beep_mid.wav")'
  
  var value_delay = generator.valueToCode(block, 'delay', python.Order.ATOMIC)  
  
  //return "os.system('speaker-test -t sine -f 4000 -l 1 > /dev/null & sleep "+ value_delay+" && kill -9 $!')\n"
 return "player.play();time.sleep(" + value_delay + ")\n"

}

python.pythonGenerator.forBlock['maixpy3_gpio_get'] = function(block, generator) {
  generator.definitions_['from_maix_import_gpio'] = 'from maix import gpio'
  var dropdown_pin = block.getFieldValue('pin')
  generator.definitions_['_gpio_'+dropdown_pin] = '_gpio_'+dropdown_pin+' = gpio.GPIO(\''+dropdown_pin+'\',gpio.Mode.IN)'
  var code = '_gpio_'+dropdown_pin+'.value()'
  
  return [code, python.Order.ATOMIC]
}

python.pythonGenerator.forBlock['maixpy3_gpio_set'] = function(block, generator) {
  generator.definitions_['from_maix_import_gpio'] = 'from maix import gpio'  
  var dropdown_pin = block.getFieldValue('pin')
  generator.definitions_['_gpio_'+dropdown_pin] = '_gpio_'+dropdown_pin+' = gpio.GPIO(\''+dropdown_pin+'\',gpio.Mode.OUT)'
  var value_value = generator.valueToCode(block, 'value', python.Order.ATOMIC)  

  if(value_value == 'True') value_value = '1';
  if(value_value == 'False') value_value = '0';
  return '_gpio_'+dropdown_pin+'.value('+value_value+')\n'
}

python.pythonGenerator.forBlock['maixpy3_gpio_rgb'] = function(block, generator) {
  var value_r = generator.valueToCode(block, 'r', python.Order.ATOMIC)
  var value_g = generator.valueToCode(block, 'g', python.Order.ATOMIC)
  var value_b = generator.valueToCode(block, 'b', python.Order.ATOMIC)

  // TODO: Assemble python into code variable.
  return '...\n'
}

python.pythonGenerator.forBlock['maixpy3_gpio_rgb_hex'] = function(block, generator) {
  var colour_color = block.getFieldValue('color')

  // TODO: Assemble python into code variable.
  return '...\n'
}

python.pythonGenerator.forBlock['board_get_acc'] = function(block, generator) {
  generator.definitions_['import_imu'] = 'from maix.ext_dev import imu'
  
  generator.definitions_['_imu'] = '_imu = imu.IMU("qmi8658", mode=imu.Mode.DUAL,\n'
                              +'acc_scale=imu.AccScale.ACC_SCALE_2G,\n'
                              +'acc_odr=imu.AccOdr.ACC_ODR_8000,\n'
                              +'gyro_scale=imu.GyroScale.GYRO_SCALE_16DPS,\n'
                              +'gyro_odr=imu.GyroOdr.GYRO_ODR_8000)'

  var dropdown_axis = block.getFieldValue('axis')
  var code = `_imu.read()[${dropdown_axis}]`
  
  return [code, python.Order.ATOMIC]
}
python.pythonGenerator.forBlock['board_get_gyro'] = function(block, generator) {
  generator.definitions_['import_imu'] = 'from maix.ext_dev import imu'
  
  generator.definitions_['_imu'] = '_imu = imu.IMU("qmi8658", mode=imu.Mode.DUAL,\n'
                              +'acc_scale=imu.AccScale.ACC_SCALE_2G,\n'
                              +'acc_odr=imu.AccOdr.ACC_ODR_8000,\n'
                              +'gyro_scale=imu.GyroScale.GYRO_SCALE_16DPS,\n'
                              +'gyro_odr=imu.GyroOdr.GYRO_ODR_8000)'

  var dropdown_axis = block.getFieldValue('axis')
  var code = `_imu.read()[${dropdown_axis}]`
  
  return [code, python.Order.ATOMIC]
}
python.pythonGenerator.forBlock['board_get_temp'] = function(block, generator) {
  generator.definitions_['import_imu'] = 'from maix.ext_dev import imu'
  
  generator.definitions_['_imu'] = '_imu = imu.IMU("qmi8658", mode=imu.Mode.DUAL,\n'
                              +'acc_scale=imu.AccScale.ACC_SCALE_2G,\n'
                              +'acc_odr=imu.AccOdr.ACC_ODR_8000,\n'
                              +'gyro_scale=imu.GyroScale.GYRO_SCALE_16DPS,\n'
                              +'gyro_odr=imu.GyroOdr.GYRO_ODR_8000)'

  var code = `_imu.read()[6]`
  
  return [code, python.Order.ATOMIC]
}

python.pythonGenerator.forBlock['board_get_acc_tap'] = function(block, generator) {
  generator.definitions_['import_msa311'] = 'import msa311'
  generator.definitions_['from_maix_import_i2c'] = 'from maix import i2c'  
  generator.definitions_['_i2c_msa311'] = '_i2c_msa311 = i2c.I2C("/dev/i2c-1", 0x62)'
  generator.definitions_['_msa311'] = '_msa311 = msa311.MSA311(_i2c_msa311)'
  generator.definitions_['_msa311_enable_tap_detection'] = '_msa311.enable_tap_detection()'
  var code = `_msa311.tapped`
  
  return [code, python.Order.ATOMIC]
}

//servo motor
python.pythonGenerator.forBlock['maixpy3_gpio_servo'] = function(block, generator) {
  generator.definitions_['from_servo_import_V831Servo'] = 'from servo import V831Servo'  
  var dropdown_pin = block.getFieldValue('pin')
  generator.definitions_['_servo_' + dropdown_pin] = '_servo_' + dropdown_pin + ' = V831Servo(' + dropdown_pin + ')'
  var value_angle = generator.valueToCode(block, 'angle', python.Order.ATOMIC)  
  
  return '_servo_' + dropdown_pin + '.set_angle(' + value_angle + ')\n'
}
