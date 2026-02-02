Blockly.defineBlocksWithJsonArray([
  {
    "type": "sht31_i2c_sensor",
    "message0": "SHT31 address %1 read %2",
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
            "temperature (°C)",
            "0",
          ],
          [
            "humidity (%RH)",
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
    