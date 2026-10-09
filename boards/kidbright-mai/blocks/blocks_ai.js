Blockly.defineBlocksWithJsonArray([{
  "type": "maix3_nn_classify_load",
  "message0": "%{BKY_KB_MAI_MAIX3_NN_CLASSIFY_LOAD}",
  "previousStatement": null,
  "nextStatement": null,
  "colour": 120,
  "tooltip": "",
  "helpUrl": "",
},
{
  "type": "maix3_nn_classify_classify",
  "message0": "%{BKY_KB_MAI_MAIX3_NN_CLASSIFY_CLASSIFY}",
  "args0": [
    {
      "type": "input_value",
      "name": "image",
      "check": "Image",
    },
  ],
  "previousStatement": null,
  "nextStatement": null,
  "colour": 120,
  "tooltip": "",
  "helpUrl": "",
},

//load voice model
{
  "type": "maix3_nn_voice_load",
  "message0": "%{BKY_KB_MAI_MAIX3_NN_VOICE_LOAD}",
  "previousStatement": null,
  "nextStatement": null,
  "colour": 120,
  "tooltip": "",
  "helpUrl": "",
},

//get voice rms level
{
  "type": "maix3_nn_voice_get_rms",
  "message0": "%{BKY_KB_MAI_MAIX3_NN_VOICE_GET_RMS}",
  "output": null,
  "colour": 120,
  "tooltip": "",
  "helpUrl": "",
},
{
  "type": "maix3_nn_voice_classify",
  "message0": "%{BKY_KB_MAI_MAIX3_NN_VOICE_CLASSIFY}",
  "args0": [
    {
      "type": "field_number",
      "name": "duration",
      "value": 3,
      "min": 1,
      "max": 10,
      "precision": 1,
    },
  ],
  "previousStatement": null,
  "nextStatement": null,
  "colour": 120,
  "tooltip": "",
  "helpUrl": "",
},

//get result for voice
{
  "type": "maix3_nn_voice_get_result",
  "message0": "%{BKY_KB_MAI_MAIX3_NN_VOICE_GET_RESULT}",
  "args0": [
    {
      "type": "field_dropdown",
      "name": "data",
      "options": [
        [
          "%{BKY_KB_MAI_MAIX3_NN_VOICE_GET_RESULT_OPT_LABEL}",
          "label",
        ],
        [
          "%{BKY_KB_MAI_MAIX3_NN_VOICE_GET_RESULT_OPT_CLASS_ID}",
          "class id",
        ],
        [
          "%{BKY_KB_MAI_MAIX3_NN_VOICE_GET_RESULT_OPT_PROBABILITY}",
          "probability",
        ],
      ],
    },
  ],
  "inputsInline": true,
  "output": null,
  "colour": 120,
  "tooltip": "",
  "helpUrl": "",
},
{
  "type": "maix3_nn_yolo_load",
  "message0": "%{BKY_KB_MAI_MAIX3_NN_YOLO_LOAD}",
  "previousStatement": null,
  "nextStatement": null,
  "colour": 120,
  "tooltip": "",
  "helpUrl": "",
},
{
  "type": "maix3_nn_yolo_detect",
  "message0": "%{BKY_KB_MAI_MAIX3_NN_YOLO_DETECT}",
  "args0": [
    {
      "type": "input_value",
      "name": "image",
      "check": "Image",
    },
    {
      "type": "field_number",
      "name": "nms",
      "value": 0.3,
      "min": 0.1,
      "max": 1,
      "precision": 0.1,
    },
    {
      "type": "field_number",
      "name": "threshold",
      "value": 0.5,
      "min": 0.1,
      "max": 1,
      "precision": 0.1,
    },
  ],
  "previousStatement": null,
  "nextStatement": null,
  "colour": 120,
  "tooltip": "",
  "helpUrl": "",
},
{
  "type": "maix3_nn_yolo_get_result_array",
  "message0": "%{BKY_KB_MAI_MAIX3_NN_YOLO_GET_RESULT_ARRAY}",
  "output": "Array",
  "colour": 120,
  "tooltip": "",
  "helpUrl": "",
},

//get count of objects detected
{
  "type": "maix3_nn_yolo_get_count",
  "message0": "%{BKY_KB_MAI_MAIX3_NN_YOLO_GET_COUNT}",
  "output": "Number",
  "colour": 120,
  "tooltip": "",
  "helpUrl": "",
},
{
  "type": "maix3_nn_yolo_get",
  "message0": "%{BKY_KB_MAI_MAIX3_NN_YOLO_GET}",
  "args0": [
    {
      "type": "field_dropdown",
      "name": "data",
      "options": [
        [
          "%{BKY_KB_MAI_MAIX3_NN_YOLO_GET_OPT_X1}",
          "x1",
        ],
        [
          "%{BKY_KB_MAI_MAIX3_NN_YOLO_GET_OPT_Y1}",
          "y1",
        ],
        [
          "%{BKY_KB_MAI_MAIX3_NN_YOLO_GET_OPT_X2}",
          "x2",
        ],
        [
          "%{BKY_KB_MAI_MAIX3_NN_YOLO_GET_OPT_Y2}",
          "y2",
        ],
        [
          "%{BKY_KB_MAI_MAIX3_NN_YOLO_GET_OPT_WIDTH}",
          "width",
        ],
        [
          "%{BKY_KB_MAI_MAIX3_NN_YOLO_GET_OPT_HEIGHT}",
          "height",
        ],
        [
          "%{BKY_KB_MAI_MAIX3_NN_YOLO_GET_OPT_LABEL}",
          "label",
        ],
        [
          "%{BKY_KB_MAI_MAIX3_NN_YOLO_GET_OPT_CLASS_ID}",
          "class_id",
        ],
        [
          "%{BKY_KB_MAI_MAIX3_NN_YOLO_GET_OPT_PROBABILITY}",
          "probability",
        ],
      ],
    },
    {
      "type": "input_dummy",
    },
    {
      "type": "input_value",
      "name": "obj",
    },
  ],
  "inputsInline": true,
  "output": null,
  "colour": 120,
  "tooltip": "",
  "helpUrl": "",
},
{
  "type": "maix3_nn_classify_get_result",
  "message0": "%{BKY_KB_MAI_MAIX3_NN_CLASSIFY_GET_RESULT}",
  "args0": [
    {
      "type": "field_dropdown",
      "name": "data",
      "options": [
        [
          "%{BKY_KB_MAI_MAIX3_NN_CLASSIFY_GET_RESULT_OPT_LABEL}",
          "label",
        ],
        [
          "%{BKY_KB_MAI_MAIX3_NN_CLASSIFY_GET_RESULT_OPT_CLASS_ID}",
          "class id",
        ],
        [
          "%{BKY_KB_MAI_MAIX3_NN_CLASSIFY_GET_RESULT_OPT_PROBABILITY}",
          "probability",
        ],
      ],
    },
  ],
  "inputsInline": true,
  "output": null,
  "colour": 120,
  "tooltip": "",
  "helpUrl": "",
}])
