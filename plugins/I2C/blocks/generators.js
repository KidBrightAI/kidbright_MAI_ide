  python.pythonGenerator.forBlock['pylibi2c_init'] = function(block, generator) {
    var dropdown_device = block.getFieldValue('device');
    var text_addr = block.getFieldValue('addr');
    generator.definitions_['import_pylibi2c'] = 'import pylibi2c';        
    var code = `pylibi2c.I2CDevice('/dev/i2c-${dropdown_device}', ${text_addr}, iaddr_bytes=0)`;
    return [code, python.Order.NONE];
  };

  python.pythonGenerator.forBlock['pylibi2c_write'] = function(block, generator) {
    var value_device = generator.valueToCode(block, 'device', python.Order.NONE);
    var text_data = block.getFieldValue('data');
    var text_internal_addr = block.getFieldValue('internal_addr');
    generator.definitions_['import_pylibi2c'] = 'import pylibi2c';
    var code = `${value_device}.write(${text_internal_addr}, bytes([${text_data}]))\n`;
    return code;
  };

  python.pythonGenerator.forBlock['pylibi2c_read'] = function(block, generator) {
    var value_device = generator.valueToCode(block, 'device', python.Order.NONE);
    var value_nbyte = generator.valueToCode(block, 'nbyte', python.Order.ATOMIC);
    var text_internal_addr = block.getFieldValue('internal_addr');
    var code = `${value_device}.read(${text_internal_addr},${value_nbyte})`;
    return [code, python.Order.NONE];
  };
