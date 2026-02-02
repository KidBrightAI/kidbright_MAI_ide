Blockly.defineBlocksWithJsonArray([  
  {
    "type": "random_seed",
    "message0": "random seed",
    "previousStatement": null,
    "nextStatement": null,
    "colour": "#34495E",
    "tooltip": "initialize the pseudo-random number generator",
    "helpUrl": "",
  },
  {
    "type": "math_map",
    "message0": "map %1 with range from %2 (min) %3 (max) to %4 (min) %5 (max)",
    "args0": [
      {
        "type": "input_value",
        "name": "value",
        "check": "Number",
      },
      {
        "type": "input_value",
        "name": "from_min",
        "check": "Number",
      },
      {
        "type": "input_value",
        "name": "from_max",
        "check": "Number",
      },
      {
        "type": "input_value",
        "name": "to_min",
        "check": "Number",
      },
      {
        "type": "input_value",
        "name": "to_max",
        "check": "Number",
      },
    ],
    "inputsInline": true,
    "output": "Number",
    "colour": "#34495E",
    "tooltip": "",
    "helpUrl": "",
  },
])
