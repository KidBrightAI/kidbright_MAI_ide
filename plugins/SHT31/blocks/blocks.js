Blockly.defineBlocksWithJsonArray([
  {
    "type": "sht31_i2c_sensor",
    "message0": "%{BKY_KB_PLUGIN_SHT31_SHT31_I2C_SENSOR}",
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
            "%{BKY_KB_PLUGIN_SHT31_SHT31_I2C_SENSOR_OPT_0}",
            "0",
          ],
          [
            "%{BKY_KB_PLUGIN_SHT31_SHT31_I2C_SENSOR_OPT_1}",
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
    