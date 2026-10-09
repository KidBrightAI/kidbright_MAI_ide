Blockly.defineBlocksWithJsonArray([
  {
    "type": "_i2c_init",
    "message0": "%{BKY_KB_PLUGIN_I2C_UAIP_I2C_INIT}",
    "output": "I2CDevice",
    "colour": 45,
    "tooltip": "",
    "helpUrl": "",
  },
  {
    "type": "_i2c_write",
    "message0": "%{BKY_KB_PLUGIN_I2C_UAIP_I2C_WRITE}",
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
    "message0": "%{BKY_KB_PLUGIN_I2C_UAIP_I2C_READ}",
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
    "message0": "%{BKY_KB_PLUGIN_I2C_UAIP_I2C_SCAN}",
    "output": null,
    "colour": 260,
    "tooltip": "%{BKY_KB_PLUGIN_I2C_UAIP_I2C_SCAN_TOOLTIP}",
    "helpUrl": ""
  },


])
    