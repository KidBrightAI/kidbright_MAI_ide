Blockly.defineBlocksWithJsonArray([
  {
    "type": "maix3_display_camera",
    "message0": "%{BKY_KB_MAI_MAIX3_DISPLAY_CAMERA}",
    "previousStatement": null,
    "nextStatement": null,
    "tooltip": "",
    "helpUrl": "",
    "colour": "#5BA58C",
  },
  {
    "type": "maix3_set_display_color",
    "message0": "%{BKY_KB_MAI_MAIX3_SET_DISPLAY_COLOR}",
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
    "tooltip": "",
    "helpUrl": "",
  },
  {
    "type": "maix3_draw_string",
    "message0": "%{BKY_KB_MAI_MAIX3_DRAW_STRING}",
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
    'message0': "%{BKY_KB_MAI_TEXT_PRINT}",
    'args0': [
      {
        'type': 'input_value',
        'name': 'TEXT',
      },
    ],
    'previousStatement': null,
    'nextStatement': null,
    'style': 'text_blocks',
    'tooltip': "%{BKY_KB_MAI_TEXT_PRINT_TOOLTIP}",
    'helpUrl': '',
  },
  {
    "type": "maix3_forever",
    "message0": "%{BKY_KB_MAI_MAIX3_FOREVER}",
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
