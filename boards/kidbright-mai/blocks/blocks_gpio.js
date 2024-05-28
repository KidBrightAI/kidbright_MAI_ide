Blockly.defineBlocksWithJsonArray(
    [
        {
            "type": "maixpy3_gpio_rgb_hex",
            "message0": "Set RGB color %1",
            "args0": [
              {
                "type": "field_colour",
                "name": "color",
                "colour": "#ff0000"
              }
            ],
            "previousStatement": null,
            "nextStatement": null,
            "colour": "#a5745b",
            "tooltip": "",
            "helpUrl": ""
          },
        {
            "type": "maixpy3_gpio_rgb",
            "message0": "Set RGB color red %1 green %2 blue %3",
            "args0": [
              {
                "type": "input_value",
                "name": "r",
                "check": "Number"
              },
              {
                "type": "input_value",
                "name": "g",
                "check": "Number"
              },
              {
                "type": "input_value",
                "name": "b",
                "check": "Number"
              }
            ],
            "inputsInline": true,
            "previousStatement": null,
            "nextStatement": null,
            "colour": "#a5745b",
            "tooltip": "",
            "helpUrl": ""
          },
        {
            "type": "maixpy3_delay",
            "message0": "delay %1 second(s)",
            "args0": [
              {
                "type": "input_value",
                "name": "delay",
                "check": "Number"
              }
            ],
            "previousStatement": null,
            "nextStatement": null,
            "colour": "#a5745b",
            "tooltip": "",
            "helpUrl": ""
          },
        {
        "type": "maixpy3_gpio_when_switch",
        "message0": "When Switch %1 pressed %2 %3",
        "args0": [
          {
            "type": "field_dropdown",
            "name": "switch",
            "options": [
              [
                "S1",
                "S1"
              ],
              [
                "S2",
                "S2"
              ]
            ]
          },
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
        "colour": "#a5745b",
        "tooltip": "",
        "helpUrl": ""
      },
      {
        "type": "maixpy3_gpio_switch",
        "message0": "switch %1 pressed",
        "args0": [
          {
            "type": "field_dropdown",
            "name": "switch",
            "options": [
              [
                "S1",
                "S1"
              ],
              [
                "S2",
                "S2"
              ]
            ]
          }
        ],
        "output": "Boolean",
        "colour": "#a5745b",
        "tooltip": "",
        "helpUrl": ""
      },
      {
        "type": "maixpy3_gpio_buzzer",
        "message0": "Buzzer beep tone %1 delay %2",
        "args0": [
          {
            "type": "input_dummy"
          },
          {
            "type": "input_value",
            "name": "delay",
            "check": "Number"
          }
        ],
        "inputsInline": true,
        "previousStatement": null,
        "nextStatement": null,
        "colour": "#a5745b",
        "tooltip": "",
        "helpUrl": ""
      },
      {
        "type": "board_get_acc",
        "message0": "get acceleration %1",
        "args0": [
          {
            "type": "field_dropdown",
            "name": "axis",
            "options": [
              [
                "x",
                "0"
              ],
              [
                "y",
                "1"
              ],
              [
                "z",
                "2"
              ]
            ]
          }
        ],
        "output": null,
        "colour": "#a5745b",
        "tooltip": "",
        "helpUrl": ""
      },
      {
        "type": "board_get_acc_tap",
        "message0": "is tapped",
        "output": "Boolean",
        "colour": "#a5745b",
        "tooltip": "",
        "helpUrl": ""
      },
      {
        "type": "maixpy3_gpio_get",
        "message0": "read pin %1",
        "args0": [
          {
            "type": "field_dropdown",
            "name": "pin",
            "options": [
              [
                "PH14",
                "14"
              ],
              [
                "PH13",
                "13"
              ],
              [
                "PH3",
                "3"
              ],
              [
                "PH2",
                "2"
              ],
              [
                "PH1",
                "1"
              ],
              [
                "PH0",
                "0"
              ],
              [
                "PH8",
                "8"
              ],
              [
                "PH7",
                "7"
              ],
              [
                "PH6",
                "6"
              ]
            ]
          }
        ],
        "output": "Boolean",
        "colour": "#a5745b",
        "tooltip": "",
        "helpUrl": ""
      },
      {
        "type": "maixpy3_gpio_set",
        "message0": "write pin %1 %2 value %3",
        "args0": [
          {
            "type": "field_dropdown",
            "name": "pin",
            "options": [
              [
                "PH14",
                "14"
              ],
              [
                "PH13",
                "13"
              ],
              [
                "PH3",
                "3"
              ],
              [
                "PH2",
                "2"
              ],
              [
                "PH1",
                "1"
              ],
              [
                "PH0",
                "0"
              ],
              [
                "PH8",
                "8"
              ],
              [
                "PH7",
                "7"
              ],
              [
                "PH6",
                "6"
              ],
              [
                "LED TX",
                "9"
              ],
              [
                "LED RX",
                "10"
              ],
              [
                "LED SCK",
                "11"
              ],
              [
                "LED SDA",
                "12"
              ]
            ]
          },
          {
            "type": "input_dummy"
          },
          {
            "type": "input_value",
            "name": "value",
            "check": [
              "Boolean",
              "Number"
            ]
          }
        ],
        "inputsInline": true,
        "previousStatement": null,
        "nextStatement": null,
        "colour": "#a5745b",
        "tooltip": "",
        "helpUrl": ""
      },
      // servo block for gpio
      {
        "type": "maixpy3_gpio_servo",
        "message0": "Servo motor set pin %1 angle %2",
        "args0": [
          {
            "type": "field_dropdown",
            "name": "pin",
            "options": [
              [
                "PH6",
                "6"
              ],
              [
                "PH7",
                "7"
              ],              
              [
                "PH8",
                "8"
              ],
            ]
          },
          {
            "type": "input_value",
            "name": "angle",
            "check": "Number"
          }
        ],
        "inputsInline": true,
        "previousStatement": null,
        "nextStatement": null,
        "colour": "#a5745b",
        "tooltip": "",
        "helpUrl": ""
      },
    ]
  );
  