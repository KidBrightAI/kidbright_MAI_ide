  python.pythonGenerator.forBlock['pylibi2c_init'] = function(block, generator) {
    var dropdown_device = block.getFieldValue('device');
    var text_addr = block.getFieldValue('addr');
    generator.definitions_['import_pylibi2c'] = 'import pylibi2c';        
    var code = `_i2c_${dropdown_device} = pylibi2c.I2CDevice('/dev/i2c-${dropdown_device}', ${text_addr}, iaddr_bytes=0)\n`;
    return code;
  };

  python.pythonGenerator.forBlock['pylibi2c_write'] = function(block, generator) {
    var dropdown_device = block.getFieldValue('device');
    var text_data = block.getFieldValue('data');
    generator.definitions_['import_pylibi2c'] = 'import pylibi2c';
    var code = `_i2c_${dropdown_device}.write(0x0, bytes([${text_data}]))\n`;
    return code;
  };

  python.pythonGenerator.forBlock['pylibi2c_read'] = function(block, generator) {
    var dropdown_device = block.getFieldValue('device');
    var value_nbyte = generator.valueToCode(block, 'nbyte', python.Order.ATOMIC);
    var code = `_i2c_${dropdown_device}.read(0x0,${value_nbyte})`;
    return [code, python.Order.NONE];
  };
