Blockly.defineBlocksWithJsonArray([
  // Camera Blocks
  {
    "type": "maix4_camera_width",
    "message0": "%{BKY_KB_MAI_MAIX4_CAMERA_WIDTH}",
    "output": "Number",
    "colour": 20,
    "tooltip": "%{BKY_KB_MAI_MAIX4_CAMERA_WIDTH_TOOLTIP}",
    "helpUrl": "",
  },
  {
    "type": "maix4_camera_height",
    "message0": "%{BKY_KB_MAI_MAIX4_CAMERA_HEIGHT}",
    "output": "Number",
    "colour": 20,
    "tooltip": "%{BKY_KB_MAI_MAIX4_CAMERA_HEIGHT_TOOLTIP}",
    "helpUrl": "",
  },
  {
    "type": "maix4_camera_resolution",
    "message0": "%{BKY_KB_MAI_MAIX4_CAMERA_RESOLUTION}",
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
    "colour": 20,
    "tooltip": "%{BKY_KB_MAI_MAIX4_CAMERA_RESOLUTION_TOOLTIP}",
    "helpUrl": "",
  },
  {
    "type": "maix4_camera_capture",
    "message0": "%{BKY_KB_MAI_MAIX4_CAMERA_CAPTURE}",
    "inputsInline": true,
    "output": "Image",
    "colour": 20,
    "tooltip": "%{BKY_KB_MAI_MAIX4_CAMERA_CAPTURE_TOOLTIP}",
    "helpUrl": "",
  },
  {
    "type": "maix4_camera_close",
    "message0": "%{BKY_KB_MAI_MAIX4_CAMERA_CLOSE}",
    "inputsInline": true,
    "previousStatement": null,
    "nextStatement": null,
    "colour": 20,
    "tooltip": "%{BKY_KB_MAI_MAIX4_CAMERA_CLOSE_TOOLTIP}",
    "helpUrl": "",
  },

  // Display Blocks
  {
    "type": "maix4_display_width",
    "message0": "%{BKY_KB_MAI_MAIX4_DISPLAY_WIDTH}",
    "output": "Number",
    "colour": 65,
    "tooltip": "%{BKY_KB_MAI_MAIX4_DISPLAY_WIDTH_TOOLTIP}",
    "helpUrl": "",
  },
  {
    "type": "maix4_display_height",
    "message0": "%{BKY_KB_MAI_MAIX4_DISPLAY_HEIGHT}",
    "output": "Number",
    "colour": 65,
    "tooltip": "%{BKY_KB_MAI_MAIX4_DISPLAY_HEIGHT_TOOLTIP}",
    "helpUrl": "",
  },
  {
    "type": "maix4_display_resolution",
    "message0": "%{BKY_KB_MAI_MAIX4_DISPLAY_RESOLUTION}",
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
    "tooltip": "%{BKY_KB_MAI_MAIX4_DISPLAY_RESOLUTION_TOOLTIP}",
    "helpUrl": "",
  },
  {
    "type": "maix4_display_show",
    "message0": "%{BKY_KB_MAI_MAIX4_DISPLAY_SHOW}",
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
    "tooltip": "%{BKY_KB_MAI_MAIX4_DISPLAY_SHOW_TOOLTIP}",
    "helpUrl": "",
  },

  // Image Blocks (Basic Drawing)
  {
    "type": "maix4_image_draw_string",
    "message0": "%{BKY_KB_MAI_MAIX4_IMAGE_DRAW_STRING}",
    "args0": [
      {
        "type": "input_value",
        "name": "image",
        "check": "Image",
      },
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
        "type": "input_dummy",
      },
      {
        "type": "input_value",
        "name": "scale",
        "check": "Number",
      },
      {
        "type": "input_value",
        "name": "thickness",
        "check": "Number",
      },
    ],
    "inputsInline": true,
    "previousStatement": null,
    "nextStatement": null,
    "colour": 120,
    "tooltip": "",
    "helpUrl": "",
  },
  {
    "type": "maix4_image_new",
    "message0": "%{BKY_KB_MAI_MAIX4_IMAGE_NEW}",
    "args0": [
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
      {
        "type": "field_colour",
        "name": "color",
        "colour": "#000000",
      },
    ],
    "inputsInline": true,
    "output": "Image",
    "colour": 120,
  },

  // Basic Blocks
  {
    "type": "maix4_display_camera",
    "message0": "%{BKY_KB_MAI_MAIX4_DISPLAY_CAMERA}",
    "previousStatement": null,
    "nextStatement": null,
    "colour": "#5BA58C",
    "tooltip": "%{BKY_KB_MAI_MAIX4_DISPLAY_CAMERA_TOOLTIP}",
    "helpUrl": "",
  },
  {
    "type": "maix4_set_display_color",
    "message0": "%{BKY_KB_MAI_MAIX4_SET_DISPLAY_COLOR}",
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
    "tooltip": "%{BKY_KB_MAI_MAIX4_SET_DISPLAY_COLOR_TOOLTIP}",
    "helpUrl": "",
  },
  {
    "type": "maix4_draw_string",
    "message0": "%{BKY_KB_MAI_MAIX4_DRAW_STRING}",
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
    "type": "maix4_forever",
    "message0": "%{BKY_KB_MAI_MAIX4_FOREVER}",
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

