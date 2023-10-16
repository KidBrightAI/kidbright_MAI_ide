Blockly.defineBlocksWithJsonArray([
  {
    "type": "maix3_camera_width",
    "message0": "get camera width",
    "output": "Number",
    "colour": 20,
    "tooltip": "",
    "helpUrl": ""
  },
  {
    "type": "maix3_camera_height",
    "message0": "get camera height",
    "output": "Number",
    "colour": 20,
    "tooltip": "",
    "helpUrl": ""
  },
  {
    "type": "maix3_camera_resolution",
    "message0": "set camera resolution %1 width %2 height %3",
    "args0": [
      {
        "type": "input_dummy"
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
    "previousStatement": null,
    "nextStatement": null,
    "colour": 20,
    "tooltip": "",
    "helpUrl": ""
  },
  {
    "type": "maix3_camera_capture",
    "message0": "camera capture",
    "inputsInline": true,
    "output": "Image",
    "colour": 20,
    "tooltip": "",
    "helpUrl": ""
  },
  {
    "type": "maix3_camera_close",
    "message0": "camera close",
    "inputsInline": true,
    "previousStatement": null,
    "nextStatement": null,
    "colour": 20,
    "tooltip": "",
    "helpUrl": ""
  }
]);
