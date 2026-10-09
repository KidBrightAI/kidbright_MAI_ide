Blockly.defineBlocksWithJsonArray(
  [{
    "type": "image_draw_string",
    "message0": "%{BKY_KB_MAIPLUS_IMAGE_DRAW_STRING}",
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
    "inputsInline": null,
    "previousStatement": null,
    "nextStatement": null,
    "colour": 120,
    "tooltip": "",
    "helpUrl": "",
  },
  {
    "type": "image_draw_line",
    "message0": "%{BKY_KB_MAIPLUS_IMAGE_DRAW_LINE}",
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
    "inputsInline": null,
    "previousStatement": null,
    "nextStatement": null,
    "colour": 120,
    "tooltip": "",
    "helpUrl": "",
  },
  {
    "type": "image_draw_rectangle",
    "message0": "%{BKY_KB_MAIPLUS_IMAGE_DRAW_RECTANGLE}",
    "args0": [
      {
        "type": "input_value",
        "name": "image",
        "check": "Image",
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
        "type": "input_value",
        "name": "w",
        "check": "Number",
      },
      {
        "type": "input_value",
        "name": "h",
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
    "inputsInline": null,
    "previousStatement": null,
    "nextStatement": null,
    "colour": 120,
    "tooltip": "",
    "helpUrl": "",
  },
  {
    "type": "image_draw_circle",
    "message0": "%{BKY_KB_MAIPLUS_IMAGE_DRAW_CIRCLE}",
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
    "inputsInline": null,
    "previousStatement": null,
    "nextStatement": null,
    "colour": 120,
    "tooltip": "",
    "helpUrl": "",
  },
  {
    "type": "image_draw_ellipse",
    "message0": "%{BKY_KB_MAIPLUS_IMAGE_DRAW_ELLIPSE}",
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
    "inputsInline": null,
    "previousStatement": null,
    "nextStatement": null,
    "colour": 120,
    "tooltip": "",
    "helpUrl": "",
  },
  {
    "type": "image_crop",
    "message0": "%{BKY_KB_MAIPLUS_IMAGE_CROP}",
    "args0": [
      {
        "type": "input_value",
        "name": "image",
        "check": "Image",
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
        "type": "input_value",
        "name": "w",
        "check": "Number",
      },
      {
        "type": "input_value",
        "name": "h",
        "check": "Number",
      },
    ],
    "inputsInline": null,
    "output": "Image",
    "colour": 120,
    "tooltip": "",
    "helpUrl": "",
  },
  {
    "type": "image_resize",
    "message0": "%{BKY_KB_MAIPLUS_IMAGE_RESIZE}",
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
    "type": "image_flip",
    "message0": "%{BKY_KB_MAIPLUS_IMAGE_FLIP}",
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
            "%{BKY_KB_MAIPLUS_IMAGE_FLIP_OPT_HORIZONTAL}",
            "1",
          ],
          [
            "%{BKY_KB_MAIPLUS_IMAGE_FLIP_OPT_VERTICAL}",
            "0",
          ],
          [
            "%{BKY_KB_MAIPLUS_IMAGE_FLIP_OPT_HORIZONTAL_VERTICAL}",
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
    "type": "image_rotate",
    "message0": "%{BKY_KB_MAIPLUS_IMAGE_ROTATE}",
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
    "type": "image_copy",
    "message0": "%{BKY_KB_MAIPLUS_IMAGE_COPY}",
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
    "type": "image_save",
    "message0": "%{BKY_KB_MAIPLUS_IMAGE_SAVE}",
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
    "type": "image_open",
    "message0": "%{BKY_KB_MAIPLUS_IMAGE_OPEN}",
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
    "type": "image_new",
    "message0": "%{BKY_KB_MAIPLUS_IMAGE_NEW}",
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
  },
  {
    "type": "image_draw_cross",
    "message0": "%{BKY_KB_MAIPLUS_IMAGE_DRAW_CROSS}",
    "args0": [
      {
        "type": "input_value",
        "name": "image",
        "check": "Image",
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
        "name": "size",
        "check": "Number",
      },
      {
        "type": "input_value",
        "name": "thickness",
        "check": "Number",
      },
    ],
    "inputsInline": null,
    "previousStatement": null,
    "nextStatement": null,
    "colour": 120,
    "tooltip": "",
    "helpUrl": "",
  },
  {
    "type": "image_draw_arrow",
    "message0": "%{BKY_KB_MAIPLUS_IMAGE_DRAW_ARROW}",
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
    "inputsInline": null,
    "previousStatement": null,
    "nextStatement": null,
    "colour": 120,
    "tooltip": "",
    "helpUrl": "",
  },
  {
    "type": "image_draw_image",
    "message0": "%{BKY_KB_MAIPLUS_IMAGE_DRAW_IMAGE}",
    "args0": [
      {
        "type": "input_value",
        "name": "image",
        "check": "Image",
      },
      {
        "type": "input_value",
        "name": "image2",
        "check": "Image",
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
    ],
    "inputsInline": true,
    "previousStatement": null,
    "nextStatement": null,
    "colour": 120,
    "tooltip": "",
    "helpUrl": "",
  },
  {
    "type": "image_to_format",
    "message0": "%{BKY_KB_MAIPLUS_IMAGE_TO_FORMAT}",
    "args0": [
      {
        "type": "input_value",
        "name": "image",
        "check": "Image",
      },
      {
        "type": "field_dropdown",
        "name": "format",
        "options": [
          ["RGB888", "image.Format.FMT_RGB888"],
          ["RGBA8888", "image.Format.FMT_RGBA8888"],
          ["GRAYSCALE", "image.Format.FMT_GRAYSCALE"],
          ["BGR888", "image.Format.FMT_BGR888"],
          ["JPEG", "image.Format.FMT_JPEG"]
        ]
      }
    ],
    "inputsInline": true,
    "output": "Image",
    "colour": 120,
    "tooltip": "",
    "helpUrl": "",
  },
  {
    "type": "image_to_bytes",
    "message0": "%{BKY_KB_MAIPLUS_IMAGE_TO_BYTES}",
    "args0": [
      {
        "type": "input_value",
        "name": "image",
        "check": "Image",
      },
    ],
    "inputsInline": true,
    "output": null,
    "colour": 120,
    "tooltip": "",
    "helpUrl": "",
  },
  {
    "type": "image_from_bytes",
    "message0": "%{BKY_KB_MAIPLUS_IMAGE_FROM_BYTES}",
    "args0": [
      {
        "type": "input_value",
        "name": "data",
        "check": null,
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
      {
        "type": "field_dropdown",
        "name": "format",
        "options": [
          ["RGB888", "image.Format.FMT_RGB888"],
          ["RGBA8888", "image.Format.FMT_RGBA8888"],
          ["GRAYSCALE", "image.Format.FMT_GRAYSCALE"],
          ["BGR888", "image.Format.FMT_BGR888"],
          ["JPEG", "image.Format.FMT_JPEG"]
        ]
      }
    ],
    "inputsInline": true,
    "output": "Image",
    "colour": 120,
    "tooltip": "",
    "helpUrl": "",
  }],
)
