Blockly.defineBlocksWithJsonArray(
  [{
    "type": "maix3_image_draw_string",
    "message0": "%{BKY_KB_MAI_MAIX3_IMAGE_DRAW_STRING}",
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
    "type": "maix3_image_draw_line",
    "message0": "%{BKY_KB_MAI_MAIX3_IMAGE_DRAW_LINE}",
    "args0": [
      {
        "type": "input_value",
        "name": "image",
        "check": "Image",
      },
      {
        "type": "input_value",
        "name": "x1",
        "check": "Number",
      },
      {
        "type": "input_value",
        "name": "y1",
        "check": "Number",
      },
      {
        "type": "input_value",
        "name": "x2",
        "check": "Number",
      },
      {
        "type": "input_value",
        "name": "y2",
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
    "type": "maix3_image_draw_rectangle",
    "message0": "%{BKY_KB_MAI_MAIX3_IMAGE_DRAW_RECTANGLE}",
    "args0": [
      {
        "type": "input_value",
        "name": "image",
        "check": "Image",
      },
      {
        "type": "input_value",
        "name": "x1",
        "check": "Number",
      },
      {
        "type": "input_value",
        "name": "y1",
        "check": "Number",
      },
      {
        "type": "input_value",
        "name": "x2",
        "check": "Number",
      },
      {
        "type": "input_value",
        "name": "y2",
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
    "type": "maix3_image_draw_circle",
    "message0": "%{BKY_KB_MAI_MAIX3_IMAGE_DRAW_CIRCLE}",
    "args0": [
      {
        "type": "input_value",
        "name": "image",
        "check": "Image",
      },
      {
        "type": "input_value",
        "name": "x1",
        "check": "Number",
      },
      {
        "type": "input_value",
        "name": "y1",
        "check": "Number",
      },
      {
        "type": "input_value",
        "name": "radius",
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
    "type": "maix3_image_draw_ellipse",
    "message0": "%{BKY_KB_MAI_MAIX3_IMAGE_DRAW_ELLIPSE}",
    "args0": [
      {
        "type": "input_value",
        "name": "image",
        "check": "Image",
      },
      {
        "type": "input_value",
        "name": "x1",
        "check": "Number",
      },
      {
        "type": "input_value",
        "name": "y1",
        "check": "Number",
      },
      {
        "type": "input_value",
        "name": "radius_x",
        "check": "Number",
      },
      {
        "type": "input_value",
        "name": "radius_y",
        "check": "Number",
      },
      {
        "type": "input_value",
        "name": "rotate",
        "check": "Number",
      },
      {
        "type": "input_value",
        "name": "angle_start",
        "check": "Number",
      },
      {
        "type": "input_value",
        "name": "angle_end",
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
    "type": "maix3_image_crop",
    "message0": "%{BKY_KB_MAI_MAIX3_IMAGE_CROP}",
    "args0": [
      {
        "type": "input_value",
        "name": "image",
        "check": "Image",
      },
      {
        "type": "input_value",
        "name": "x1",
        "check": "Number",
      },
      {
        "type": "input_value",
        "name": "y1",
        "check": "Number",
      },
      {
        "type": "input_value",
        "name": "x2",
        "check": "Number",
      },
      {
        "type": "input_value",
        "name": "y2",
        "check": "Number",
      },
    ],
    "inputsInline": true,
    "output": "Image",
    "colour": 120,
    "tooltip": "",
    "helpUrl": "",
  },
  {
    "type": "maix3_image_resize",
    "message0": "%{BKY_KB_MAI_MAIX3_IMAGE_RESIZE}",
    "args0": [
      {
        "type": "input_value",
        "name": "image",
        "check": "Image",
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
    "output": "Image",
    "colour": 120,
    "tooltip": "",
    "helpUrl": "",
  },
  {
    "type": "maix3_image_flip",
    "message0": "%{BKY_KB_MAI_MAIX3_IMAGE_FLIP}",
    "args0": [
      {
        "type": "input_value",
        "name": "image",
        "check": "Image",
      },
      {
        "type": "field_dropdown",
        "name": "direction",
        "options": [
          [
            "%{BKY_KB_MAI_MAIX3_IMAGE_FLIP_OPT_1}",
            "1",
          ],
          [
            "%{BKY_KB_MAI_MAIX3_IMAGE_FLIP_OPT_0}",
            "0",
          ],
          [
            "%{BKY_KB_MAI_MAIX3_IMAGE_FLIP_OPT_MINUS_1}",
            "-1",
          ],
        ],
      },
    ],
    "inputsInline": true,
    "output": "Image",
    "colour": 120,
    "tooltip": "",
    "helpUrl": "",
  },
  {
    "type": "maix3_image_rotate",
    "message0": "%{BKY_KB_MAI_MAIX3_IMAGE_ROTATE}",
    "args0": [
      {
        "type": "input_value",
        "name": "image",
        "check": "Image",
      },
      {
        "type": "field_angle",
        "name": "angle",
        "angle": 90,
      },
    ],
    "inputsInline": true,
    "output": "Image",
    "colour": 120,
    "tooltip": "",
    "helpUrl": "",
  },
  {
    "type": "maix3_image_copy",
    "message0": "%{BKY_KB_MAI_MAIX3_IMAGE_COPY}",
    "args0": [
      {
        "type": "input_value",
        "name": "image",
        "check": "Image",
      },
    ],
    "inputsInline": true,
    "output": "Image",
    "colour": 120,
    "tooltip": "",
    "helpUrl": "",
  },
  {
    "type": "maix3_image_save",
    "message0": "%{BKY_KB_MAI_MAIX3_IMAGE_SAVE}",
    "args0": [
      {
        "type": "input_value",
        "name": "image",
        "check": "Image",
      },
      {
        "type": "field_input",
        "name": "path",
        "text": "./tmp.png",
      },
    ],
    "inputsInline": true,
    "previousStatement": null,
    "nextStatement": null,
    "colour": 120,
    "tooltip": "",
    "helpUrl": "",
  },

  // {
  //   "type": "maix3_image_open",
  //   "message0": "Open image from path %1 to variable %2",
  //   "args0": [
  //     {
  //       "type": "field_input",
  //       "name": "path",
  //       "text": "./tmp.png"
  //     },
  //   ],
  //   "inputsInline": true,
  //   "output": "Image",
  //   "colour": 120,
  //   "tooltip": "",
  //   "helpUrl": ""
  // },
  {
    "type": "maix3_image_open",
    "message0": "%{BKY_KB_MAI_MAIX3_IMAGE_OPEN}",
    "args0": [
      {
        "type": "field_input",
        "name": "path",
        "text": "./tmp.png",
      },
      {
        "type": "input_dummy",
      },
      {
        "type": "input_value",
        "name": "var",
        "check": "",
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
    "type": "maix3_image_new",
    "message0": "%{BKY_KB_MAI_MAIX3_IMAGE_NEW}",
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
    "tooltip": "",
    "helpUrl": "",
  }],
)
  