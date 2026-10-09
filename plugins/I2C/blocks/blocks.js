Blockly.defineBlocksWithJsonArray([
  {
    "type": "pylibi2c_init",
    "message0": "%{BKY_KB_PLUGIN_I2C_PYLIBI2C_INIT}",
    "args0": [
      {
        "type": "field_dropdown",
        "name": "device",
        "options": [
          [
            "2",
            "2",
          ],
          [
            "0",
            "0",
          ],
          [
            "1",
            "1",
          ],
          [
            "3",
            "3",
          ],
        ],
      },
      {
        "type": "field_input",
        "name": "addr",
        "text": "0x44",
      },
    ],
    "output": "I2CDevice",
    "colour": 45,
    "tooltip": "",
    "helpUrl": "",
  },
  {
    "type": "pylibi2c_write",
    "message0": "%{BKY_KB_PLUGIN_I2C_PYLIBI2C_WRITE}",
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
    "type": "pylibi2c_read",
    "message0": "%{BKY_KB_PLUGIN_I2C_PYLIBI2C_READ}",
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
])
    