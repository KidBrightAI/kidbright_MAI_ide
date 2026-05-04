python.pythonGenerator.forBlock['sht31_i2c_sensor_uAiP'] = function(block, generator) {    
  var dropdown_addr = block.getFieldValue('addr')
  var dropdown_type = block.getFieldValue('type')    
  generator.definitions_['import_time'] = 'import time'
  generator.definitions_['import_i2c'] = 'from maix import i2c,pinmap\n'
                                          +'import os\n'
                                          +'os.system("insmod /mnt/system/ko/i2c-algo-bit.ko")\n'
                                          +'os.system("insmod /root/i2c-gpio.ko delay_us=1 sda=509 scl=508")\n'
                                          +'pinmap.set_pin_function("A28", "GPIOA28")\n'
                                          +'pinmap.set_pin_function("A29", "GPIOA29")\n'     
  
  generator.definitions_['init_sht31'] = `_sht31 = i2c.I2C(5, i2c.Mode.MASTER)\n`
                                          +`print('start _sht31')\n`
  var functionName = generator.provideFunction_(
    '_getSHT31',
    ['def _getSHT31(datatype):',
      '  _sht31.writeto('+dropdown_addr+', bytes([0x2C,0x06]))',
      '  time.sleep(0.2)',
      '  data = _sht31.readfrom('+ dropdown_addr+',6)',
      '  if data is None:',
      '    return False',
      '  temp = data[0] * 256 + data[1]',
      '  cTemp = -45 + (175 * temp / 65535.0)',
      '  fTemp = -49 + (315 * temp / 65535.0)',
      '  humidity = 100 * (data[3] * 256 + data[4]) / 65535.0',    
      '  if datatype == 0:',
      '    return round(cTemp, 2)',
      '  else:',
      '    return round(humidity,2)'])              
  var code = `${functionName}(${dropdown_type})`
  
  return [code, python.Order.NONE]
}
