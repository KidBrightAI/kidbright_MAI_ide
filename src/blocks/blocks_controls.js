Blockly.defineBlocksWithJsonArray([
  {
    "type": "controls_wait",
    "message0": "wait %1 seconds",
    "args0": [
      {
        "type": "input_value",
        "name": "time",
        "check": "Number",
      },
    ],
    "inputsInline": true,
    "previousStatement": null,
    "nextStatement": null,
    "colour": "#D4AC0D",
    "tooltip": "",
    "helpUrl": "",
  },
  {
    "type": "controls_wait_until",
    "message0": "wait until %1",
    "args0": [
      {
        "type": "input_value",
        "name": "condition",
        "check": [
          "Number",
          "Boolean",
        ],
      },
    ],
    "inputsInline": true,
    "previousStatement": null,
    "nextStatement": null,
    "colour": "#D4AC0D",
    "tooltip": "",
    "helpUrl": "",
  },
  {
    "type": "controls_forever",
    "message0": "forever %1 %2",
    "args0": [
      {
        "type": "input_dummy",
      },
      {
        "type": "input_statement",
        "name": "block",
      },
    ],
    "inputsInline": true,
    "previousStatement": null,
    "nextStatement": null,
    "colour": "#D4AC0D",
    "tooltip": "",
    "helpUrl": "",
  },
  {
    "type": "while_loop",
    "message0": "while %1 do %2",
    "args0": [
      {
        "type": "input_value",
        "name": "condition",
        "check": [
          "Boolean",
          "Number",
        ],
      },
      {
        "type": "input_statement",
        "name": "DO",
      },
    ],
    "inputsInline": true,
    "previousStatement": null,
    "nextStatement": null,
    "colour": "#D4AC0D",
    "tooltip": "",
    "helpUrl": "",
  },
])

Blockly.Blocks['controls_on_start'] = {
  init: function () {
    this.appendDummyInput()
      .appendField("on start")
    this.appendStatementInput("block")
      .setCheck(null)
    this.setNextStatement(true, [ "controls_on_start", "controls_forever_no_connect" ])
    this.setColour("#D4AC0D")
    this.setTooltip("")
    this.setHelpUrl("")

    this.setDeletable(false)
    this.setMovable(false)
    this.setEditable(false)
  },
}

Blockly.Blocks['controls_forever_no_connect'] = {
  init: function () {
    this.appendDummyInput()
      .appendField("forever")
    this.appendStatementInput("block")
      .setCheck(null)
    this.setPreviousStatement(true, [ "controls_on_start", "controls_forever_no_connect" ])
    this.setColour("#D4AC0D")
    this.setTooltip("")
    this.setHelpUrl("")

    this.setDeletable(false)
    this.setMovable(false)
    this.setEditable(false)
  },
}


