Blockly.defineBlocksWithJsonArray(
  [{
    "type": "display_get_width",
    "message0": "%{BKY_KB_MAIPLUS_DISPLAY_GET_WIDTH}",
    "output": "Number",
    "colour": 65,
    "tooltip": "",
    "helpUrl": "",
  },
  {
    "type": "display_get_height",
    "message0": "%{BKY_KB_MAIPLUS_DISPLAY_GET_HEIGHT}",
    "output": "Number",
    "colour": 65,
    "tooltip": "",
    "helpUrl": "",
  },
  {
    "type": "display_resolution",
    "message0": "%{BKY_KB_MAIPLUS_DISPLAY_RESOLUTION}",
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
    "type": "display_get_image",
    "message0": "%{BKY_KB_MAIPLUS_DISPLAY_GET_IMAGE}",
    "inputsInline": true,
    "output": "Image",
    "colour": 65,
    "tooltip": "",
    "helpUrl": "",
  },
  {
    "type": "display_show",
    "message0": "%{BKY_KB_MAIPLUS_DISPLAY_SHOW}",
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
