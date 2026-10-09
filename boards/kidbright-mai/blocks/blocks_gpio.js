Blockly.defineBlocksWithJsonArray(
  [
    {
      "type": "maixpy3_gpio_rgb_hex",
      "message0": "%{BKY_KB_MAI_MAIXPY3_GPIO_RGB_HEX}",
      "args0": [
        {
          "type": "field_colour",
          "name": "color",
          "colour": "#ff0000",
        },
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": "#a5745b",
      "tooltip": "",
      "helpUrl": "",
    },
    {
      "type": "maixpy3_gpio_rgb",
      "message0": "%{BKY_KB_MAI_MAIXPY3_GPIO_RGB}",
      "args0": [
        {
          "type": "input_value",
          "name": "r",
          "check": "Number",
        },
        {
          "type": "input_value",
          "name": "g",
          "check": "Number",
        },
        {
          "type": "input_value",
          "name": "b",
          "check": "Number",
        },
      ],
      "inputsInline": true,
      "previousStatement": null,
      "nextStatement": null,
      "colour": "#a5745b",
      "tooltip": "",
      "helpUrl": "",
    },
    {
      "type": "maixpy3_delay",
      "message0": "%{BKY_KB_MAI_MAIXPY3_DELAY}",
      "args0": [
        {
          "type": "input_value",
          "name": "delay",
          "check": "Number",
        },
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": "#a5745b",
      "tooltip": "",
      "helpUrl": "",
    },
    {
      "type": "maixpy3_gpio_when_switch",
      "message0": "%{BKY_KB_MAI_MAIXPY3_GPIO_WHEN_SWITCH}",
      "args0": [
        {
          "type": "field_dropdown",
          "name": "switch",
          "options": [
            [
              "%{BKY_KB_MAI_MAIXPY3_GPIO_WHEN_SWITCH_OPT_S1}",
              "S1",
            ],
            [
              "%{BKY_KB_MAI_MAIXPY3_GPIO_WHEN_SWITCH_OPT_S2}",
              "S2",
            ],
          ],
        },
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
      "colour": "#a5745b",
      "tooltip": "",
      "helpUrl": "",
    },
    {
      "type": "maixpy3_gpio_switch",
      "message0": "%{BKY_KB_MAI_MAIXPY3_GPIO_SWITCH}",
      "args0": [
        {
          "type": "field_dropdown",
          "name": "switch",
          "options": [
            [
              "%{BKY_KB_MAI_MAIXPY3_GPIO_SWITCH_OPT_S1}",
              "S1",
            ],
            [
              "%{BKY_KB_MAI_MAIXPY3_GPIO_SWITCH_OPT_S2}",
              "S2",
            ],
          ],
        },
      ],
      "output": "Boolean",
      "colour": "#a5745b",
      "tooltip": "",
      "helpUrl": "",
    },
    {
      "type": "maixpy3_gpio_buzzer",
      "message0": "%{BKY_KB_MAI_MAIXPY3_GPIO_BUZZER}",
      "args0": [
        {
          "type": "input_dummy",
        },
        {
          "type": "input_value",
          "name": "delay",
          "check": "Number",
        },
      ],
      "inputsInline": true,
      "previousStatement": null,
      "nextStatement": null,
      "colour": "#a5745b",
      "tooltip": "",
      "helpUrl": "",
    },
    {
      "type": "board_get_acc",
      "message0": "%{BKY_KB_MAI_BOARD_GET_ACC}",
      "args0": [
        {
          "type": "field_dropdown",
          "name": "axis",
          "options": [
            [
              "%{BKY_KB_MAI_BOARD_GET_ACC_OPT_0}",
              "0",
            ],
            [
              "%{BKY_KB_MAI_BOARD_GET_ACC_OPT_1}",
              "1",
            ],
            [
              "%{BKY_KB_MAI_BOARD_GET_ACC_OPT_2}",
              "2",
            ],
          ],
        },
      ],
      "output": null,
      "colour": "#a5745b",
      "tooltip": "",
      "helpUrl": "",
    },
    {
      "type": "board_get_acc_tap",
      "message0": "%{BKY_KB_MAI_BOARD_GET_ACC_TAP}",
      "output": "Boolean",
      "colour": "#a5745b",
      "tooltip": "",
      "helpUrl": "",
    },
    {
      "type": "maixpy3_gpio_get",
      "message0": "%{BKY_KB_MAI_MAIXPY3_GPIO_GET}",
      "args0": [
        {
          "type": "field_dropdown",
          "name": "pin",
          "options": [
            [
              "%{BKY_KB_MAI_MAIXPY3_GPIO_GET_OPT_14}",
              "14",
            ],
            [
              "%{BKY_KB_MAI_MAIXPY3_GPIO_GET_OPT_13}",
              "13",
            ],
            [
              "%{BKY_KB_MAI_MAIXPY3_GPIO_GET_OPT_3}",
              "3",
            ],
            [
              "%{BKY_KB_MAI_MAIXPY3_GPIO_GET_OPT_2}",
              "2",
            ],
            [
              "%{BKY_KB_MAI_MAIXPY3_GPIO_GET_OPT_1}",
              "1",
            ],
            [
              "%{BKY_KB_MAI_MAIXPY3_GPIO_GET_OPT_0}",
              "0",
            ],
            [
              "%{BKY_KB_MAI_MAIXPY3_GPIO_GET_OPT_8}",
              "8",
            ],
            [
              "%{BKY_KB_MAI_MAIXPY3_GPIO_GET_OPT_7}",
              "7",
            ],
            [
              "%{BKY_KB_MAI_MAIXPY3_GPIO_GET_OPT_6}",
              "6",
            ],
          ],
        },
      ],
      "output": "Boolean",
      "colour": "#a5745b",
      "tooltip": "",
      "helpUrl": "",
    },
    {
      "type": "maixpy3_gpio_set",
      "message0": "%{BKY_KB_MAI_MAIXPY3_GPIO_SET}",
      "args0": [
        {
          "type": "field_dropdown",
          "name": "pin",
          "options": [
            [
              "%{BKY_KB_MAI_MAIXPY3_GPIO_SET_OPT_14}",
              "14",
            ],
            [
              "%{BKY_KB_MAI_MAIXPY3_GPIO_SET_OPT_13}",
              "13",
            ],
            [
              "%{BKY_KB_MAI_MAIXPY3_GPIO_SET_OPT_3}",
              "3",
            ],
            [
              "%{BKY_KB_MAI_MAIXPY3_GPIO_SET_OPT_2}",
              "2",
            ],
            [
              "%{BKY_KB_MAI_MAIXPY3_GPIO_SET_OPT_1}",
              "1",
            ],
            [
              "%{BKY_KB_MAI_MAIXPY3_GPIO_SET_OPT_0}",
              "0",
            ],
            [
              "%{BKY_KB_MAI_MAIXPY3_GPIO_SET_OPT_8}",
              "8",
            ],
            [
              "%{BKY_KB_MAI_MAIXPY3_GPIO_SET_OPT_7}",
              "7",
            ],
            [
              "%{BKY_KB_MAI_MAIXPY3_GPIO_SET_OPT_6}",
              "6",
            ],
            [
              "%{BKY_KB_MAI_MAIXPY3_GPIO_SET_OPT_9}",
              "9",
            ],
            [
              "%{BKY_KB_MAI_MAIXPY3_GPIO_SET_OPT_10}",
              "10",
            ],
            [
              "%{BKY_KB_MAI_MAIXPY3_GPIO_SET_OPT_11}",
              "11",
            ],
            [
              "%{BKY_KB_MAI_MAIXPY3_GPIO_SET_OPT_12}",
              "12",
            ],
          ],
        },
        {
          "type": "input_dummy",
        },
        {
          "type": "input_value",
          "name": "value",
          "check": [
            "Boolean",
            "Number",
          ],
        },
      ],
      "inputsInline": true,
      "previousStatement": null,
      "nextStatement": null,
      "colour": "#a5745b",
      "tooltip": "",
      "helpUrl": "",
    },

    // servo block for gpio
    {
      "type": "maixpy3_gpio_servo",
      "message0": "%{BKY_KB_MAI_MAIXPY3_GPIO_SERVO}",
      "args0": [
        {
          "type": "field_dropdown",
          "name": "pin",
          "options": [
            [
              "%{BKY_KB_MAI_MAIXPY3_GPIO_SERVO_OPT_6}",
              "6",
            ],
            [
              "%{BKY_KB_MAI_MAIXPY3_GPIO_SERVO_OPT_7}",
              "7",
            ],              
            [
              "%{BKY_KB_MAI_MAIXPY3_GPIO_SERVO_OPT_8}",
              "8",
            ],
          ],
        },
        {
          "type": "input_value",
          "name": "angle",
          "check": "Number",
        },
      ],
      "inputsInline": true,
      "previousStatement": null,
      "nextStatement": null,
      "colour": "#a5745b",
      "tooltip": "",
      "helpUrl": "",
    },
  ],
)
  