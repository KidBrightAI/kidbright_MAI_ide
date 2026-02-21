python.pythonGenerator.forBlock['_i2c_init'] = function(block, generator) {
  generator.definitions_['import_i2c'] = 'from maix import i2c,pinmap\n'
                                          +'import os\n'
                                          +'os.system("insmod /mnt/system/ko/i2c-algo-bit.ko")\n'
                                          +'os.system("insmod /root/i2c-gpio.ko delay_us=1 sda=509 scl=508")\n'
                                          +'pinmap.set_pin_function("A28", "GPIOA28")\n'
                                          +'pinmap.set_pin_function("A29", "GPIOA29")\n'
                                          +'bus = i2c.I2C(5, i2c.Mode.MASTER)\n'     
  var code = `i2c.I2C(5, i2c.Mode.MASTER)`


  
  return [code, python.Order.NONE]
}

python.pythonGenerator.forBlock['_i2c_write'] = function(block, generator) {
  var value_device = generator.valueToCode(block, 'device', python.Order.NONE)
  var text_data = block.getFieldValue('data')
  var text_internal_addr = block.getFieldValue('internal_addr')
  generator.definitions_['import_i2c'] = 'from maix import i2c,pinmap\n'
                                          +'import os\n'
                                          +'os.system("insmod /mnt/system/ko/i2c-algo-bit.ko")\n'
                                          +'os.system("insmod /root/i2c-gpio.ko delay_us=1 sda=509 scl=508")\n'
                                          +'pinmap.set_pin_function("A28", "GPIOA28")\n'
                                          +'pinmap.set_pin_function("A29", "GPIOA29")\n'
                                          +'bus = i2c.I2C(5, i2c.Mode.MASTER)\n'

  return `${value_device}.writeto(${text_internal_addr}, bytes([${text_data}]))\n`
}

python.pythonGenerator.forBlock['_i2c_read'] = function(block, generator) {
  var value_device = generator.valueToCode(block, 'device', python.Order.NONE)
  var value_nbyte = generator.valueToCode(block, 'nbyte', python.Order.ATOMIC)
  var text_internal_addr = block.getFieldValue('internal_addr')
  var code = `${value_device}.readfrom(${text_internal_addr},${value_nbyte})`
  
  return [code, python.Order.NONE]
}
python.pythonGenerator.forBlock['_i2c_scan'] = function(block, generator) {

  generator.definitions_['import_i2c'] = 'from maix import i2c,pinmap\n'
                                          +'import os\n'
                                          +'os.system("insmod /mnt/system/ko/i2c-algo-bit.ko")\n'
                                          +'os.system("insmod /root/i2c-gpio.ko delay_us=1 sda=509 scl=508")\n'
                                          +'pinmap.set_pin_function("A28", "GPIOA28")\n'
                                          +'pinmap.set_pin_function("A29", "GPIOA29")\n'
                                          +'bus = i2c.I2C(5, i2c.Mode.MASTER)\n'

  var code = `[hex(x) for x in bus.scan()]`
  
  return [code, python.Order.NONE]
  

}
