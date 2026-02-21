Blockly.defineBlocksWithJsonArray(
  [{
    "type": "display_get_width",
    "message0": "display width",
    "output": "Number",
    "colour": 65,
    "tooltip": "",
    "helpUrl": "",
  },
  {
    "type": "display_get_height",
    "message0": "display height",
    "output": "Number",
    "colour": 65,
    "tooltip": "",
    "helpUrl": "",
  },
  {
    "type": "display_resolution",
    "message0": "display set resolution %1 width %2 height %3",
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
    "message0": "get image from display",
    "inputsInline": true,
    "output": "Image",
    "colour": 65,
    "tooltip": "",
    "helpUrl": "",
  },
  {
    "type": "display_show",
    "message0": "display %1 %2",
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
