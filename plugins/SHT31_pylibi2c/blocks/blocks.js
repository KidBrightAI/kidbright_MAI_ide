Blockly.defineBlocksWithJsonArray([
  {
    "type": "sht31_i2c_sensor_pylibi2c",
    "message0": "%{BKY_KB_PLUGIN_SHT31_PYLIBI2C_SHT31_I2C_SENSOR_PYLIBI2C}",
    "args0": [
      {
        "type": "field_dropdown",
        "name": "addr",
        "options": [
          [
            "0x44",
            "0x44",
          ],
          [
            "0x45",
            "0x45",
          ],
        ],
      },
      {
        "type": "field_dropdown",
        "name": "type",
        "options": [
          [
            "%{BKY_KB_PLUGIN_SHT31_PYLIBI2C_SHT31_I2C_SENSOR_PYLIBI2C_OPT_0}",
            "0",
          ],
          [
            "%{BKY_KB_PLUGIN_SHT31_PYLIBI2C_SHT31_I2C_SENSOR_PYLIBI2C_OPT_1}",
            "1",
          ],
        ],
      },
    ],
    "output": "Number",
    "colour": "#8b507c",
    "tooltip": "",
    "helpUrl": "",
  },
])
    