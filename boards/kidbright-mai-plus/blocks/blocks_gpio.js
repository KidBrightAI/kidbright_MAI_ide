Blockly.defineBlocksWithJsonArray(
  [
    // ---- External RGB LED (KidBright blocks) : 3 GPIO pins, digital on/off ----
    // These drive an RGB LED wired to the board's GPIO header. The user selects
    // which pin each colour is connected to. Only IO7 exposes hardware PWM on this
    // board, so a 3-pin RGB LED cannot be dimmed per-colour -> each colour is
    // on/off (>=128 = on). See generators_gpio.js for details.
    {
      "type": "maixpy3_gpio_rgb_hex",
      "message0": "%{BKY_KB_MAIPLUS_MAIXPY3_GPIO_RGB_HEX}",
      "args0": [
        {
          "type": "field_colour",
          "name": "color",
          "colour": "#ff0000",
        },
        {
          "type": "field_dropdown",
          "name": "pin_r",
          "options": [
            ["IO2", "A23"],
            ["IO3", "A27"],
            ["IO4", "A25"],
            ["IO5", "A22"],
            ["IO6", "A24"],
            ["IO7", "P24"],
            ["IO8", "A15"],
          ],
        },
        {
          "type": "field_dropdown",
          "name": "pin_g",
          "options": [
            ["IO2", "A23"],
            ["IO3", "A27"],
            ["IO4", "A25"],
            ["IO5", "A22"],
            ["IO6", "A24"],
            ["IO7", "P24"],
            ["IO8", "A15"],
          ],
        },
        {
          "type": "field_dropdown",
          "name": "pin_b",
          "options": [
            ["IO2", "A23"],
            ["IO3", "A27"],
            ["IO4", "A25"],
            ["IO5", "A22"],
            ["IO6", "A24"],
            ["IO7", "P24"],
            ["IO8", "A15"],
          ],
        },
      ],
      "inputsInline": true,
      "previousStatement": null,
      "nextStatement": null,
      "colour": "#a5745b",
      "tooltip": "%{BKY_KB_MAIPLUS_MAIXPY3_GPIO_RGB_HEX_TOOLTIP}",
      "helpUrl": "",
    },
    {
      "type": "maixpy3_gpio_rgb",
      "message0": "%{BKY_KB_MAIPLUS_MAIXPY3_GPIO_RGB}",
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
        {
          "type": "field_dropdown",
          "name": "pin_r",
          "options": [
            ["IO2", "A23"],
            ["IO3", "A27"],
            ["IO4", "A25"],
            ["IO5", "A22"],
            ["IO6", "A24"],
            ["IO7", "P24"],
            ["IO8", "A15"],
          ],
        },
        {
          "type": "field_dropdown",
          "name": "pin_g",
          "options": [
            ["IO2", "A23"],
            ["IO3", "A27"],
            ["IO4", "A25"],
            ["IO5", "A22"],
            ["IO6", "A24"],
            ["IO7", "P24"],
            ["IO8", "A15"],
          ],
        },
        {
          "type": "field_dropdown",
          "name": "pin_b",
          "options": [
            ["IO2", "A23"],
            ["IO3", "A27"],
            ["IO4", "A25"],
            ["IO5", "A22"],
            ["IO6", "A24"],
            ["IO7", "P24"],
            ["IO8", "A15"],
          ],
        },
      ],
      "inputsInline": true,
      "previousStatement": null,
      "nextStatement": null,
      "colour": "#a5745b",
      "tooltip": "%{BKY_KB_MAIPLUS_MAIXPY3_GPIO_RGB_TOOLTIP}",
      "helpUrl": "",
    },
    // ---- On-board user LED (KidBright block) : led-user via sysfs ----
    // The single on-board light is a leds-gpio device (on/off only). 0 = off,
    // 255 = on. Named "Board LED" so it is not confused with the RGB LED above.
    {
      "type": "board_led",
      "message0": "%{BKY_KB_MAIPLUS_BOARD_LED}",
      "args0": [
        {
          "type": "input_value",
          "name": "brightness",
          "check": "Number",
        },
      ],
      "inputsInline": true,
      "previousStatement": null,
      "nextStatement": null,
      "colour": "#a5745b",
      "tooltip": "%{BKY_KB_MAIPLUS_BOARD_LED_TOOLTIP}",
      "helpUrl": "",
    },
    {
      "type": "maixpy3_delay",
      "message0": "%{BKY_KB_MAIPLUS_MAIXPY3_DELAY}",
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
      "message0": "%{BKY_KB_MAIPLUS_MAIXPY3_GPIO_WHEN_SWITCH}",
      "args0": [
        {
          "type": "field_dropdown",
          "name": "switch",
          "options": [
            [
              "S1",
              "S1",
            ],
            [
              "S2",
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
      "message0": "%{BKY_KB_MAIPLUS_MAIXPY3_GPIO_SWITCH}",
      "args0": [
        {
          "type": "field_dropdown",
          "name": "switch",
          "options": [
            [
              "S1",
              "S1",
            ],
            [
              "S2",
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
      "message0": "%{BKY_KB_MAIPLUS_MAIXPY3_GPIO_BUZZER}",
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
      "message0": "%{BKY_KB_MAIPLUS_BOARD_GET_ACC}",
      "args0": [
        {
          "type": "field_dropdown",
          "name": "axis",
          "options": [
            [
              "x",
              "0",
            ],
            [
              "y",
              "1",
            ],
            [
              "z",
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
      "type": "board_get_gyro",
      "message0": "%{BKY_KB_MAIPLUS_BOARD_GET_GYRO}",
      "args0": [
        {
          "type": "field_dropdown",
          "name": "axis",
          "options": [
            [
              "x",
              "3",
            ],
            [
              "y",
              "4",
            ],
            [
              "z",
              "5",
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
      "message0": "%{BKY_KB_MAIPLUS_BOARD_GET_ACC_TAP}",
      "output": "Boolean",
      "colour": "#a5745b",
      "tooltip": "",
      "helpUrl": "",
    },
    {
      "type": "maixpy3_gpio_get",
      "message0": "%{BKY_KB_MAIPLUS_MAIXPY3_GPIO_GET}",
      "args0": [
        {
          "type": "field_dropdown",
          "name": "pin",
          "options": [
            [
              "IO2",
              "A23",
            ],
            [
              "IO3",
              "A27",
            ],
            [
              "IO4",
              "A25",
            ],
            [
              "IO5",
              "A22",
            ],
            [
              "IO6",
              "A24", 
            ],
            [
              "IO7",
              "P24",
            ],
            [
              "IO8",
              "A15",
            ]
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
      "message0": "%{BKY_KB_MAIPLUS_MAIXPY3_GPIO_SET}",
      "args0": [
        {
          "type": "field_dropdown",
          "name": "pin",
          "options": [
            [
              "IO2",
              "A23",
            ],
            [
              "IO3",
              "A27",
            ],
            [
              "IO4",
              "A25",
            ],
            [
              "IO5",
              "A22",
            ],
            [
              "IO6",
              "A24",
            ],
            [
              "IO7",
              "P24",
            ],
            [
              "IO8",
              "A15",
            ]
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
      "message0": "%{BKY_KB_MAIPLUS_MAIXPY3_GPIO_SERVO}",
      "args0": [
        {
          "type": "field_dropdown",
          "name": "pin",
          "options": [
            [
              "IO7",
              "2",
            ],[
              "UART_TX",
              "7",
            ],[
              "UART_RX",
              "6",
            ]
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
  