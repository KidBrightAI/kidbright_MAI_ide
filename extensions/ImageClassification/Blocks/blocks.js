export default (Blockly, that) => {
  // ========== classification process ========== //
  Blockly.Blocks["tfjs_classification_init_model"] = {
    init: function () {
      this.appendDummyInput().appendField("initial model");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(230);
      this.setTooltip("");
      this.setHelpUrl("");
    },
  };
  Blockly.JavaScript["tfjs_classification_init_model"] = function (block) {
    var code = `await initModel();\n`;
    return code;
  };

  Blockly.Blocks["tfjs_classification_classify"] = {
    init: function () {
      this.appendDummyInput().appendField("classify image");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(230);
      this.setTooltip("");
      this.setHelpUrl("");
    },
  };

  Blockly.JavaScript["tfjs_classification_classify"] = function (block) {
    var code = `await classify();\n`;
    return code;
  };

  Blockly.Blocks["tfjs_classification_get_class_name"] = {
    init: function () {
      this.appendDummyInput().appendField("classify get class name");
      this.setOutput(true, "String");
      this.setColour(230);
      this.setTooltip("");
      this.setHelpUrl("");
    },
  };
  Blockly.JavaScript["tfjs_classification_get_class_name"] = function (block) {
    var code = "(__data ? __labels[__maxIndex] : null)";
    return [code, Blockly.JavaScript.ORDER_NONE];
  };

  Blockly.Blocks["tfjs_classification_get_class_prob"] = {
    init: function () {
      this.appendDummyInput().appendField("classify get class probability");
      this.setOutput(true, "Number");
      this.setColour(230);
      this.setTooltip("");
      this.setHelpUrl("");
    },
  };
  Blockly.JavaScript["tfjs_classification_get_class_prob"] = function (block) {
    var code =
      "(__data ? Math.round( __data[__maxIndex] * 100 * 1e2 ) / 1e2  : null)";
    return [code, Blockly.JavaScript.ORDER_ATOMIC];
  };

  Blockly.Blocks["tfjs_classification_get_class_index"] = {
    init: function () {
      this.appendDummyInput().appendField("classify get class index");
      this.setOutput(true, "Number");
      this.setColour(230);
      this.setTooltip("");
      this.setHelpUrl("");
    },
  };
  Blockly.JavaScript["tfjs_classification_get_class_index"] = function (block) {
    var code = "(__data ? __maxIndex : -1)";
    return [code, Blockly.JavaScript.ORDER_NONE];
  };

  //=====================================//

  Blockly.Blocks["move"] = {
    init: function () {
      this.appendDummyInput()
        .appendField("Linear velocity")
        .appendField(new Blockly.FieldNumber(0, -0.15, 0.15), "lin")
        .appendField("Angular velocity")
        .appendField(new Blockly.FieldNumber(0, -0.5, 0.5), "ang");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(230);
      this.setTooltip("");
      this.setHelpUrl("");
    },
  };
  Blockly.JavaScript["move"] = function (block) {
    var number_lin = block.getFieldValue("lin");
    var number_ang = block.getFieldValue("ang");
    var code = `postMessage({ command : "MOVE", lin : ${number_lin}, ang : ${number_ang} });\n`;
    return code;
  };

  Blockly.Blocks["move_forward_in"] = {
    init: function () {
      this.appendValueInput("speed")
        .setCheck("Number")
        .appendField("Move forward speed");
      this.appendValueInput("duration")
        .setCheck("Number")
        .appendField("duration");
      this.appendDummyInput().appendField("ms");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(230);
      this.setTooltip("move robot ");
      this.setHelpUrl("");
    },
  };
  Blockly.JavaScript["move_forward_in"] = function (block) {
    var value_speed = Blockly.JavaScript.valueToCode(
      block,
      "speed",
      Blockly.JavaScript.ORDER_ATOMIC
    );
    var value_duration = Blockly.JavaScript.valueToCode(
      block,
      "duration",
      Blockly.JavaScript.ORDER_ATOMIC
    );
    var code = `postMessage({ command : "MOVE", lin : ${value_speed}, ang : 0 });
await new Promise(r => setTimeout(r,${value_duration}));
postMessage({ command : "MOVE", lin : 0, ang : 0 });
`;
    return code;
  };

  Blockly.Blocks["move_backward_in"] = {
    init: function () {
      this.appendValueInput("speed")
        .setCheck("Number")
        .appendField("Move backward speed");
      this.appendValueInput("duration")
        .setCheck("Number")
        .appendField("duration");
      this.appendDummyInput().appendField("ms");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(230);
      this.setTooltip("move robot ");
      this.setHelpUrl("");
    },
  };
  Blockly.JavaScript["move_backward_in"] = function (block) {
    var value_speed = Blockly.JavaScript.valueToCode(
      block,
      "speed",
      Blockly.JavaScript.ORDER_ATOMIC
    );
    var value_duration = Blockly.JavaScript.valueToCode(
      block,
      "duration",
      Blockly.JavaScript.ORDER_ATOMIC
    );
    var code = `postMessage({ command : "MOVE", lin : -${value_speed}, ang : 0 });
await new Promise(r => setTimeout(r,${value_duration}));
postMessage({ command : "MOVE", lin : 0, ang : 0 });
`;
    return code;
  };

  Blockly.Blocks["move_turnleft_in"] = {
    init: function () {
      this.appendValueInput("speed")
        .setCheck("Number")
        .appendField("Turn Left speed");
      this.appendValueInput("duration")
        .setCheck("Number")
        .appendField("duration");
      this.appendDummyInput().appendField("ms");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(230);
      this.setTooltip("90 deg ~ 1700ms");
      this.setHelpUrl("");
    },
  };
  Blockly.JavaScript["move_turnleft_in"] = function (block) {
    var value_speed = Blockly.JavaScript.valueToCode(
      block,
      "speed",
      Blockly.JavaScript.ORDER_ATOMIC
    );
    var value_duration = Blockly.JavaScript.valueToCode(
      block,
      "duration",
      Blockly.JavaScript.ORDER_ATOMIC
    );
    var code = `postMessage({ command : "MOVE", lin : 0, ang : ${value_speed} });
await new Promise(r => setTimeout(r,${value_duration}));
postMessage({ command : "MOVE", lin : 0, ang : 0 });
`;
    return code;
  };

  Blockly.Blocks["move_turnright_in"] = {
    init: function () {
      this.appendValueInput("speed")
        .setCheck("Number")
        .appendField("Turn right speed");
      this.appendValueInput("duration")
        .setCheck("Number")
        .appendField("duration");
      this.appendDummyInput().appendField("ms");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(230);
      this.setTooltip("90 deg ~ 1700ms");
      this.setHelpUrl("");
    },
  };
  Blockly.JavaScript["move_turnright_in"] = function (block) {
    var value_speed = Blockly.JavaScript.valueToCode(
      block,
      "speed",
      Blockly.JavaScript.ORDER_ATOMIC
    );
    var value_duration = Blockly.JavaScript.valueToCode(
      block,
      "duration",
      Blockly.JavaScript.ORDER_ATOMIC
    );
    var code = `postMessage({ command : "MOVE", lin : 0, ang : -${value_speed} });
await new Promise(r => setTimeout(r,${value_duration}));
postMessage({ command : "MOVE", lin : 0, ang : 0 });
`;
    return code;
  };

  Blockly.Blocks["stop_move"] = {
    init: function () {
      this.appendDummyInput().appendField("stop robot");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(230);
      this.setTooltip("move robot ");
      this.setHelpUrl("");
    },
  };
  Blockly.JavaScript["stop_move"] = function (block) {
    var code = `postMessage({ command : "MOVE", lin : 0, ang : 0 });\n`;
    return code;
  };

  Blockly.Blocks["delay"] = {
    init: function () {
      this.appendDummyInput()
        .appendField("delay")
        .appendField(new Blockly.FieldNumber(0), "ms")
        .appendField("ms");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(230);
      this.setTooltip("");
      this.setHelpUrl("");
    },
  };
  Blockly.JavaScript["delay"] = function (block) {
    var number_ms = block.getFieldValue("ms");
    var code = "await new Promise(r => setTimeout(r," + number_ms + "));\n";
    return code;
  };

  Blockly.Blocks["term_print"] = {
    init: function () {
      this.appendValueInput("text").setCheck(null).appendField("print");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(160);
      this.setTooltip("");
      this.setHelpUrl("");
    },
  };
  Blockly.JavaScript["term_print"] = function (block) {
    var value_text = Blockly.JavaScript.valueToCode(
      block,
      "text",
      Blockly.JavaScript.ORDER_NONE
    );
    var code = `postMessage({command:"PRINT", msg : ${value_text}+"\\r\\n"});\n`;
    return code;
  };
};
