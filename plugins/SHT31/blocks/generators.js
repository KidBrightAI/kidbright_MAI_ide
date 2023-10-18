python.pythonGenerator.forBlock['sht31_i2c_sensor'] = function(block, generator) {    
    var dropdown_addr = block.getFieldValue('addr');
    var dropdown_type = block.getFieldValue('type');    
    generator.definitions_['import_time'] = 'import time';
    generator.definitions_['import_smbus2'] = 'import smbus2';
    generator.definitions_['init_sht31'] = `_sht31 = smbus2.SMBus(2)
_sht31.write_i2c_block_data(${dropdown_addr}, 0x2C, [0x06])
time.sleep(0.5)
`;
    var functionName = generator.provideFunction_(
    '_getSHT31',
    ['def _getSHT31(datatype):',
    '  data = _sht31.read_i2c_block_data('+ dropdown_addr+', 0x00, 6)',
    '  if data is None:',
    '    return False',
    '  temp = data[0] * 256 + data[1]',
    '  cTemp = -45 + (175 * temp / 65535.0)',
    '  fTemp = -49 + (315 * temp / 65535.0)',
    '  humidity = 100 * (data[3] * 256 + data[4]) / 65535.0',    
    '  if datatype == 0:',
    '    return cTemp',
    '  else:',
    '    return humidity'
    ]);              
    var code = `${functionName}(${dropdown_type})`;
    return [code, python.Order.NONE];
  };
