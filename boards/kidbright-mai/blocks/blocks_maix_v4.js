Blockly.defineBlocksWithJsonArray([
  // Camera Blocks
  {
    "type": "maix4_camera_width",
    "message0": "get camera width",
    "output": "Number",
    "colour": 20,
    "tooltip": "Get the width of the camera frame",
    "helpUrl": "",
  },
  {
    "type": "maix4_camera_height",
    "message0": "get camera height",
    "output": "Number",
    "colour": 20,
    "tooltip": "Get the height of the camera frame",
    "helpUrl": "",
  },
  {
    "type": "maix4_camera_resolution",
    "message0": "set camera resolution %1 width %2 height %3",
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
    "tooltip": "Set the camera resolution",
    "helpUrl": "",
  },
  {
    "type": "maix4_camera_capture",
    "message0": "camera capture",
    "inputsInline": true,
    "output": "Image",
    "colour": 20,
    "tooltip": "Capture an image from the camera",
    "helpUrl": "",
  },
  {
    "type": "maix4_camera_close",
    "message0": "camera close",
    "inputsInline": true,
    "previousStatement": null,
    "nextStatement": null,
    "colour": 20,
    "tooltip": "Close the camera",
    "helpUrl": "",
  },

  // Display Blocks
  {
    "type": "maix4_display_width",
    "message0": "display width",
    "output": "Number",
    "colour": 65,
    "tooltip": "Get display width",
    "helpUrl": "",
  },
  {
    "type": "maix4_display_height",
    "message0": "display height",
    "output": "Number",
    "colour": 65,
    "tooltip": "Get display height",
    "helpUrl": "",
  },
  {
    "type": "maix4_display_resolution",
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
    "tooltip": "Set display resolution",
    "helpUrl": "",
  },
  {
    "type": "maix4_display_show",
    "message0": "display show %1 %2",
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
    "tooltip": "Show image on display",
    "helpUrl": "",
  },

  // Image Blocks (Basic Drawing)
  {
    "type": "maix4_image_draw_string",
    "message0": "Image %1 draw text %2 at X %3 Y %4 color %5 %6 scale %7 thickness %8",
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
    "message0": "New image width %1 height %2 color %3",
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
    "message0": "display camera",
    "previousStatement": null,
    "nextStatement": null,
    "colour": "#5BA58C",
    "tooltip": "Continuously display camera feed",
    "helpUrl": "",
  },
  {
    "type": "maix4_set_display_color",
    "message0": "set display color %1",
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
    "tooltip": "Fill display with color",
    "helpUrl": "",
  },
  {
    "type": "maix4_draw_string",
    "message0": "draw text %1 at X %2 Y %3 color %4 scale %5",
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
    "message0": "forever %1 %2",
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

