Blockly.defineBlocksWithJsonArray(
  [{
    "type": "maix3_image_draw_string",
    "message0": "Image %1 draw text %2 at X %3 Y %4 color %5 %6 scale %7 thickness %8",
    "args0": [
      {
        "type": "input_value",
        "name": "image",
        "check": "Image"
      },
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
        "type": "input_dummy"
      },
      {
        "type": "input_value",
        "name": "scale",
        "check": "Number"
      },
      {
        "type": "input_value",
        "name": "thickness",
        "check": "Number"
      }
    ],
    "inputsInline": true,
    "previousStatement": null,
    "nextStatement": null,
    "colour": 120,
    "tooltip": "",
    "helpUrl": ""
  },
  {
    "type": "maix3_image_draw_line",
    "message0": "Image %1 draw line at X1 %2 Y1 %3 to X2 %4 Y2 %5 color %6 %7 tickness %8",
    "args0": [
      {
        "type": "input_value",
        "name": "image",
        "check": "Image"
      },
      {
        "type": "input_value",
        "name": "x1",
        "check": "Number"
      },
      {
        "type": "input_value",
        "name": "y1",
        "check": "Number"
      },
      {
        "type": "input_value",
        "name": "x2",
        "check": "Number"
      },
      {
        "type": "input_value",
        "name": "y2",
        "check": "Number"
      },
      {
        "type": "field_colour",
        "name": "color",
        "colour": "#ff0000"
      },
      {
        "type": "input_dummy"
      },
      {
        "type": "input_value",
        "name": "thickness",
        "check": "Number"
      }
    ],
    "inputsInline": true,
    "previousStatement": null,
    "nextStatement": null,
    "colour": 120,
    "tooltip": "",
    "helpUrl": ""
  },
  {
    "type": "maix3_image_draw_rectangle",
    "message0": "Image %1 draw rectangle at X1 %2 Y1 %3 to X2 %4 Y2 %5 color %6 %7 tickness %8 (-1 to fill)",
    "args0": [
      {
        "type": "input_value",
        "name": "image",
        "check": "Image"
      },
      {
        "type": "input_value",
        "name": "x1",
        "check": "Number"
      },
      {
        "type": "input_value",
        "name": "y1",
        "check": "Number"
      },
      {
        "type": "input_value",
        "name": "x2",
        "check": "Number"
      },
      {
        "type": "input_value",
        "name": "y2",
        "check": "Number"
      },
      {
        "type": "field_colour",
        "name": "color",
        "colour": "#ff0000"
      },
      {
        "type": "input_dummy"
      },
      {
        "type": "input_value",
        "name": "thickness",
        "check": "Number"
      }
    ],
    "inputsInline": true,
    "previousStatement": null,
    "nextStatement": null,
    "colour": 120,
    "tooltip": "",
    "helpUrl": ""
  },
  {
    "type": "maix3_image_draw_circle",
    "message0": "Image %1 draw circle at X1 %2 Y1 %3 radius %4 color %5 %6 tickness %7 (-1 to fill)",
    "args0": [
      {
        "type": "input_value",
        "name": "image",
        "check": "Image"
      },
      {
        "type": "input_value",
        "name": "x1",
        "check": "Number"
      },
      {
        "type": "input_value",
        "name": "y1",
        "check": "Number"
      },
      {
        "type": "input_value",
        "name": "radius",
        "check": "Number"
      },
      {
        "type": "field_colour",
        "name": "color",
        "colour": "#ff0000"
      },
      {
        "type": "input_dummy"
      },
      {
        "type": "input_value",
        "name": "thickness",
        "check": "Number"
      }
    ],
    "inputsInline": true,
    "previousStatement": null,
    "nextStatement": null,
    "colour": 120,
    "tooltip": "",
    "helpUrl": ""
  },
  {
    "type": "maix3_image_draw_ellipse",
    "message0": "Image %1 drawellipse at X %2 Y %3 radius x %4 y %5 rotate %6 angle from %7 to %8 color %9 %10 tickness %11 (-1 to fill)",
    "args0": [
      {
        "type": "input_value",
        "name": "image",
        "check": "Image"
      },
      {
        "type": "input_value",
        "name": "x1",
        "check": "Number"
      },
      {
        "type": "input_value",
        "name": "y1",
        "check": "Number"
      },
      {
        "type": "input_value",
        "name": "radius_x",
        "check": "Number"
      },
      {
        "type": "input_value",
        "name": "radius_y",
        "check": "Number"
      },
      {
        "type": "input_value",
        "name": "rotate",
        "check": "Number"
      },
      {
        "type": "input_value",
        "name": "angle_start",
        "check": "Number"
      },
      {
        "type": "input_value",
        "name": "angle_end",
        "check": "Number"
      },
      {
        "type": "field_colour",
        "name": "color",
        "colour": "#ff0000"
      },
      {
        "type": "input_dummy"
      },
      {
        "type": "input_value",
        "name": "thickness",
        "check": "Number"
      }
    ],
    "inputsInline": true,
    "previousStatement": null,
    "nextStatement": null,
    "colour": 120,
    "tooltip": "",
    "helpUrl": ""
  },
  {
    "type": "maix3_image_crop",
    "message0": "Crop Image %1 from X1 %2 Y1 %3 width %4 height %5",
    "args0": [
      {
        "type": "input_value",
        "name": "image",
        "check": "Image"
      },
      {
        "type": "input_value",
        "name": "x1",
        "check": "Number"
      },
      {
        "type": "input_value",
        "name": "y1",
        "check": "Number"
      },
      {
        "type": "input_value",
        "name": "x2",
        "check": "Number"
      },
      {
        "type": "input_value",
        "name": "y2",
        "check": "Number"
      }
    ],
    "inputsInline": true,
    "output": "Image",
    "colour": 120,
    "tooltip": "",
    "helpUrl": ""
  },
  {
    "type": "maix3_image_resize",
    "message0": "Resize image %1 to width %2 height %3",
    "args0": [
      {
        "type": "input_value",
        "name": "image",
        "check": "Image"
      },
      {
        "type": "input_value",
        "name": "width",
        "check": "Number"
      },
      {
        "type": "input_value",
        "name": "height",
        "check": "Number"
      }
    ],
    "inputsInline": true,
    "output": "Image",
    "colour": 120,
    "tooltip": "",
    "helpUrl": ""
  },
  {
    "type": "maix3_image_flip",
    "message0": "Flip image %1 direction %2",
    "args0": [
      {
        "type": "input_value",
        "name": "image",
        "check": "Image"
      },
      {
        "type": "field_dropdown",
        "name": "direction",
        "options": [
          [
            "horizontal",
            "1"
          ],
          [
            "vertical",
            "0"
          ],
          [
            "horizontal & vertical",
            "-1"
          ]
        ]
      }
    ],
    "inputsInline": true,
    "output": "Image",
    "colour": 120,
    "tooltip": "",
    "helpUrl": ""
  },
  {
    "type": "maix3_image_rotate",
    "message0": "Rotate image %1 angle %2",
    "args0": [
      {
        "type": "input_value",
        "name": "image",
        "check": "Image"
      },
      {
        "type": "field_angle",
        "name": "angle",
        "angle": 90
      }
    ],
    "inputsInline": true,
    "output": "Image",
    "colour": 120,
    "tooltip": "",
    "helpUrl": ""
  },
  {
    "type": "maix3_image_copy",
    "message0": "Copy image %1",
    "args0": [
      {
        "type": "input_value",
        "name": "image",
        "check": "Image"
      }
    ],
    "inputsInline": true,
    "output": "Image",
    "colour": 120,
    "tooltip": "",
    "helpUrl": ""
  },
  {
    "type": "maix3_image_save",
    "message0": "Save image %1 to path %2",
    "args0": [
      {
        "type": "input_value",
        "name": "image",
        "check": "Image"
      },
      {
        "type": "field_input",
        "name": "path",
        "text": "./tmp.png"
      }
    ],
    "inputsInline": true,
    "previousStatement": null,
    "nextStatement": null,
    "colour": 120,
    "tooltip": "",
    "helpUrl": ""
  },
  {
    "type": "maix3_image_open",
    "message0": "Open image from path %1",
    "args0": [
      {
        "type": "field_input",
        "name": "path",
        "text": "./tmp.png"
      }
    ],
    "inputsInline": true,
    "output": "Image",
    "colour": 120,
    "tooltip": "",
    "helpUrl": ""
  },
  {
    "type": "maix3_image_new",
    "message0": "New image width %1 height %2 color %3",
    "args0": [
      {
        "type": "input_value",
        "name": "width",
        "check": "Number"
      },
      {
        "type": "input_value",
        "name": "height",
        "check": "Number"
      },
      {
        "type": "field_colour",
        "name": "color",
        "colour": "#000000"
      }
    ],
    "inputsInline": true,
    "output": "Image",
    "colour": 120,
    "tooltip": "",
    "helpUrl": ""
  }]
);
  