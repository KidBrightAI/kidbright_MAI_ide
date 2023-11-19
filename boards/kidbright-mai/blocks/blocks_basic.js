Blockly.defineBlocksWithJsonArray([
    {
        "type": "maix3_display_camera",
        "message0": "display camera",
        "previousStatement": null,
        "nextStatement": null,
        "tooltip": "",
        "helpUrl": "",
        "colour": "#5BA58C"
    },
    {
        "type": "maix3_set_display_color",
        "message0": "set display color %1",
        "args0": [
          {
            "type": "field_colour",
            "name": "color",
            "colour": "#ff0000"
          }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": "#5BA58C",
        "tooltip": "",
        "helpUrl": ""
    },
    {
      "type": "maix3_draw_string",
      "message0": "draw text %1 at X %2 Y %3 color %4 scale %5",
      "args0": [
          {
          "type": "input_value",
          "name": "text",
          "check": "String"
          },
          {
          "type": "input_value",
          "name": "x",
          "check": "Number"
          },
          {
          "type": "input_value",
          "name": "y",
          "check": "Number"
          },
          {
          "type": "field_colour",
          "name": "color",
          "colour": "#ff0000"
          },
          {
          "type": "input_value",
          "name": "scale",
          "check": "Number"
          },
      ],
      "inputsInline": true,
      "previousStatement": null,
      "nextStatement": null,
      "colour": "#5BA58C",
      "tooltip": "",
      "helpUrl": ""
    },
    {
      'type': 'text_print',
      'message0': "print console %1",
      'args0': [
          {
          'type': 'input_value',
          'name': 'TEXT',
          },
      ],
      'previousStatement': null,
      'nextStatement': null,
      'style': 'text_blocks',
      'tooltip': 'Print the specified text, number or other value to serial.',
      'helpUrl': '',
    },
    {
      "type": "maix3_forever",
      "message0": "forever %1 %2",
      "args0": [
        {
          "type": "input_dummy"
        },
        {
          "type": "input_statement",
          "name": "code"
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": "#5BA58C",
      "tooltip": "",
      "helpUrl": ""
    }
]);
