Blockly.defineBlocksWithJsonArray([
  {
    "type": "_i2c_init",
    "message0": "Initial I2C Device",
    "output": "I2CDevice",
    "colour": 45,
    "tooltip": "",
    "helpUrl": "",
  },
  {
    "type": "_i2c_write",
    "message0": "I2C device  %1 internal addr %2 write data %3",
    "args0": [
      {
        "type": "input_value",
        "name": "device",
        "check": "I2CDevice",
      },
      {
        "type": "field_input",
        "name": "internal_addr",
        "text": "0x0",
      },
      {
        "type": "field_input",
        "name": "data",
        "text": "0x0, 0x1",
      },
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": 45,
    "tooltip": "",
    "helpUrl": "",
  },
  {
    "type": "_i2c_read",
    "message0": "I2C device  %1 internal addr %2 read data # %3 byte(s)",
    "args0": [
      {
        "type": "input_value",
        "name": "device",
        "check": "I2CDevice",
      },
      {
        "type": "field_input",
        "name": "internal_addr",
        "text": "0x0",
      },
      {
        "type": "input_value",
        "name": "nbyte",
        "check": "Number",
      },
    ],
    "output": "Array",
    "colour": 45,
    "tooltip": "",
    "helpUrl": "",
  },
  {
    "type": "_i2c_scan",
    "message0": "I2C Scan device",
    "output": null,
    "colour": 260,
    "tooltip": "Get item from i2c_device list",
    "helpUrl": ""
  },


])
    