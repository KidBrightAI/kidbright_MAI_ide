Blockly.defineBlocksWithJsonArray([
  {
    "type": "pylibi2c_init",
    "message0": "Initial I2C device  %1 address %2",
    "args0": [
      {
        "type": "field_dropdown",
        "name": "device",
        "options": [
          [
            "2",
            "2"
          ],
          [
            "0",
            "0"
          ],
          [
            "1",
            "1"
          ],
          [
            "3",
            "3"
          ]
        ]
      },
      {
        "type": "field_input",
        "name": "addr",
        "text": "0x44"
      }
    ],
    "output": "I2CDevice",
    "colour": 45,
    "tooltip": "",
    "helpUrl": ""
  },
  {
    "type": "pylibi2c_write",
    "message0": "I2C device  %1 write data %2",
    "args0": [
      {
        "type": "input_value",
        "name": "device",
        "check": "I2CDevice"
      },
      {
        "type": "field_input",
        "name": "data",
        "text": "0x0, 0x1"
      }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": 45,
    "tooltip": "",
    "helpUrl": ""
  },
  {
    "type": "pylibi2c_read",
    "message0": "I2C device  %1 read data # %2 byte(s)",
    "args0": [
      {
        "type": "input_value",
        "name": "device",
        "check": "I2CDevice"
      },
      {
        "type": "input_value",
        "name": "nbyte",
        "check": "Number"
      }
    ],
    "output": "Array",
    "colour": 45,
    "tooltip": "",
    "helpUrl": ""
  }
]);
    