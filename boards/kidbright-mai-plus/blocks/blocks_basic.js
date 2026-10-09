Blockly.defineBlocksWithJsonArray([
  {
    "type": "display_camera",
    "message0": "%{BKY_KB_MAIPLUS_DISPLAY_CAMERA}",
    "previousStatement": null,
    "nextStatement": null,
    "colour": "#5BA58C",
    "tooltip": "%{BKY_KB_MAIPLUS_DISPLAY_CAMERA_TOOLTIP}",
    "helpUrl": "",
  },
  {
    "type": "display_fill_color",
    "message0": "%{BKY_KB_MAIPLUS_DISPLAY_FILL_COLOR}",
    "args0": [
      {
        "type": "field_colour",
        "name": "color",
        "colour": "#ff0000",
      },
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": "#5BA58C",
    "tooltip": "%{BKY_KB_MAIPLUS_DISPLAY_FILL_COLOR_TOOLTIP}",
    "helpUrl": "",
  },
  {
    "type": "display_draw_string",
    "message0": "%{BKY_KB_MAIPLUS_DISPLAY_DRAW_STRING}",
    "args0": [
      {
        "type": "input_value",
        "name": "text",
        "check": "String",
      },
      {
        "type": "input_value",
        "name": "x",
        "check": "Number",
      },
      {
        "type": "input_value",
        "name": "y",
        "check": "Number",
      },
      {
        "type": "field_colour",
        "name": "color",
        "colour": "#ff0000",
      },
      {
        "type": "input_value",
        "name": "scale",
        "check": "Number",
      },
    ],
    "inputsInline": true,
    "previousStatement": null,
    "nextStatement": null,
    "colour": "#5BA58C",
    "tooltip": "",
    "helpUrl": "",
  },
  {
    'type': 'text_print',
    'message0': "%{BKY_KB_MAIPLUS_TEXT_PRINT}",
    'args0': [
      {
        'type': 'input_value',
        'name': 'TEXT',
      },
    ],
    'previousStatement': null,
    'nextStatement': null,
    'style': 'text_blocks',
    'tooltip': '%{BKY_KB_MAIPLUS_TEXT_PRINT_TOOLTIP}',
    'helpUrl': '',
  },
  {
    "type": "main_forever",
    "message0": "%{BKY_KB_MAIPLUS_MAIN_FOREVER}",
    "args0": [
      {
        "type": "input_dummy",
      },
      {
        "type": "input_statement",
        "name": "code",
      },
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": "#5BA58C",
    "tooltip": "",
    "helpUrl": "",
  },
])
