Blockly.defineBlocksWithJsonArray(
  [{
    "type": "maix3_display_width",
    "message0": "%{BKY_KB_MAI_MAIX3_DISPLAY_WIDTH}",
    "output": "Number",
    "colour": 65,
    "tooltip": "",
    "helpUrl": "",
  },
  {
    "type": "maix3_display_height",
    "message0": "%{BKY_KB_MAI_MAIX3_DISPLAY_HEIGHT}",
    "output": "Number",
    "colour": 65,
    "tooltip": "",
    "helpUrl": "",
  },
  {
    "type": "maix3_display_resolution",
    "message0": "%{BKY_KB_MAI_MAIX3_DISPLAY_RESOLUTION}",
    "args0": [
      {
        "type": "input_dummy",
      },
      {
        "type": "input_value",
        "name": "width",
        "check": "Number",
      },
      {
        "type": "input_value",
        "name": "height",
        "check": "Number",
      },
    ],
    "inputsInline": true,
    "previousStatement": null,
    "nextStatement": null,
    "colour": 65,
    "tooltip": "",
    "helpUrl": "",
  },
  {
    "type": "maix3_display_get_image",
    "message0": "%{BKY_KB_MAI_MAIX3_DISPLAY_GET_IMAGE}",
    "inputsInline": true,
    "output": "Image",
    "colour": 65,
    "tooltip": "",
    "helpUrl": "",
  },
  {
    "type": "maix3_display_dislay",
    "message0": "%{BKY_KB_MAI_MAIX3_DISPLAY_DISLAY}",
    "args0": [
      {
        "type": "input_dummy",
      },
      {
        "type": "input_value",
        "name": "image",
        "check": "Image",
      },
    ],
    "inputsInline": true,
    "previousStatement": null,
    "nextStatement": null,
    "colour": 65,
    "tooltip": "",
    "helpUrl": "",
  }],
)
