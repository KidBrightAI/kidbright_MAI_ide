Blockly.defineBlocksWithJsonArray([{
    "type": "maix3_nn_classify_load",
    "message0": "load image classification model",
    "previousStatement": null,
    "nextStatement": null,
    "colour": 120,
    "tooltip": "",
    "helpUrl": ""
  },
  {
    "type": "maix3_nn_classify_classify",
    "message0": "Classify Image %1",
    "args0": [
      {
        "type": "input_value",
        "name": "image",
        "check": "Image"
      }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": 120,
    "tooltip": "",
    "helpUrl": ""
  },
  //load voice model
  {
    "type": "maix3_nn_voice_load",
    "message0": "load voice classification model",
    "previousStatement": null,
    "nextStatement": null,
    "colour": 120,
    "tooltip": "",
    "helpUrl": ""
  },
  {
    "type": "maix3_nn_voice_classify",
    "message0": "Classify voice threshold %1 for %2 seconds",
    "args0": [
      {
        "type": "field_number",
        "name": "threshold",
        "value": 120,
        "min": 1,
        "max": 999,
        "precision": 1
      },
      {
        "type": "field_number",
        "name": "duration",
        "value": 3,
        "min": 1,
        "max": 10,
        "precision": 1
      }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": 120,
    "tooltip": "",
    "helpUrl": ""
  },
  //get result for voice
  {
    "type": "maix3_nn_voice_get_result",
    "message0": "get voice %1",
    "args0": [
      {
        "type": "field_dropdown",
        "name": "data",
        "options": [
          [
            "label",
            "label"
          ],
          [
            "class_id",
            "class id"
          ],
          [
            "probability",
            "probability"
          ]
        ]
      }
    ],
    "inputsInline": true,
    "output": null,
    "colour": 120,
    "tooltip": "",
    "helpUrl": ""
  },
  {
    "type": "maix3_nn_yolo_load",
    "message0": "load object detection model",
    "previousStatement": null,
    "nextStatement": null,
    "colour": 120,
    "tooltip": "",
    "helpUrl": ""
  },
  {
    "type": "maix3_nn_yolo_detect",
    "message0": "Detect Image %1 with NMS %2 threshold %3",
    "args0": [
      {
        "type": "input_value",
        "name": "image",
        "check": "Image"
      },
      {
        "type": "field_number",
        "name": "nms",
        "value": 0.3,
        "min": 0.1,
        "max": 1,
        "precision": 0.1
      },
      {
        "type": "field_number",
        "name": "threshold",
        "value": 0.5,
        "min": 0.1,
        "max": 1,
        "precision": 0.1
      }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": 120,
    "tooltip": "",
    "helpUrl": ""
  },
  {
    "type": "maix3_nn_yolo_get_result_array",
    "message0": "get results",
    "output": "Array",
    "colour": 120,
    "tooltip": "",
    "helpUrl": ""
  },
  //get count of objects detected
  {
    "type": "maix3_nn_yolo_get_count",
    "message0": "get object detected count",
    "output": "Number",
    "colour": 120,
    "tooltip": "",
    "helpUrl": ""
  },
  {
    "type": "maix3_nn_yolo_get",
    "message0": "get %1 %2 from object %3",
    "args0": [
      {
        "type": "field_dropdown",
        "name": "data",
        "options": [
          [
            "x1",
            "x1"
          ],
          [
            "y1",
            "y1"
          ],
          [
            "x2",
            "x2"
          ],
          [
            "y2",
            "y2"
          ],
          [
            "width",
            "width"
          ],
          [
            "height",
            "height"
          ],
          [
            "label",
            "label"
          ],
          [
            "class id",
            "class_id"
          ],
          [
            "probability",
            "probability"
          ]
        ]
      },
      {
        "type": "input_dummy"
      },
      {
        "type": "input_value",
        "name": "obj"
      }
    ],
    "inputsInline": true,
    "output": null,
    "colour": 120,
    "tooltip": "",
    "helpUrl": ""
  },
  {
    "type": "maix3_nn_classify_get_result",
    "message0": "get %1",
    "args0": [
      {
        "type": "field_dropdown",
        "name": "data",
        "options": [
          [
            "label",
            "label"
          ],
          [
            "class_id",
            "class id"
          ],
          [
            "probability",
            "probability"
          ]
        ]
      }
    ],
    "inputsInline": true,
    "output": null,
    "colour": 120,
    "tooltip": "",
    "helpUrl": ""
  }]);
