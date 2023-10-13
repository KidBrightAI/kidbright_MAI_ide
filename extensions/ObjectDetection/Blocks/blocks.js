export default (Blockly, that) => {
  // ========== classification process ========== //
  Blockly.Blocks["tfjs_yolo_init_model"] = {
    init: function () {
      this.appendDummyInput()
        .appendField("Initial model with")
        .appendField("IoU threshold")
        .appendField(new Blockly.FieldNumber(0.5, 0.1, 0.99), "iot_threshold")
        .appendField(" object threshold")
        .appendField(
          new Blockly.FieldNumber(0.5, 0.1, 0.99),
          "object_threshold"
        );
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(230);
      this.setTooltip("");
      this.setHelpUrl("");
    },
  };
  Blockly.JavaScript["tfjs_yolo_init_model"] = function (block) {
    var iou_threshold = block.getFieldValue("iot_threshold");
    var obj_threshold = block.getFieldValue("object_threshold");
    var code = `await initModel(${iou_threshold}, ${obj_threshold});\n`;
    return code;
  };

  Blockly.Blocks["tfjs_yolo_detect"] = {
    init: function () {
      this.appendDummyInput().appendField("detect object");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(230);
      this.setTooltip("");
      this.setHelpUrl("");
    },
  };
  Blockly.JavaScript["tfjs_yolo_detect"] = function (block) {
    var code = `await detect()\n`;
    return code;
  };

  Blockly.Blocks["tfjs_yolo_get_object_length"] = {
    init: function () {
      this.appendDummyInput().appendField("get detected object count");
      this.setOutput(true, "Number");
      this.setColour(230);
      this.setTooltip("");
      this.setHelpUrl("");
    },
  };

  Blockly.JavaScript["tfjs_yolo_get_object_length"] = function (block) {
    var code = "(__bboxes.length || 0)";
    return [code, Blockly.JavaScript.ORDER_ATOMIC];
  };

  Blockly.Blocks["tfjs_yolo_get_object_info"] = {
    init: function () {
      this.appendDummyInput()
        .appendField("get")
        .appendField(
          new Blockly.FieldDropdown([
            ["classname", "classname"],
            ["probability", "probability"],
            ["class index", "class_index"],
            ["width", "width"],
            ["height", "heigh"],
            ["centerX", "centerX"],
            ["centerY", "centerY"],
            ["area", "area"],
          ]),
          "infotype"
        )
        .appendField(" of object index");
      this.appendValueInput("n").setCheck("Number");
      this.setInputsInline(true);
      this.setOutput(true, null);
      this.setColour(230);
      this.setTooltip("");
      this.setHelpUrl("");
    },
  };

  Blockly.JavaScript["tfjs_yolo_get_object_info"] = function (block) {
    var dropdown_infotype = block.getFieldValue("infotype");
    var value_n = Blockly.JavaScript.valueToCode(
      block,
      "n",
      Blockly.JavaScript.ORDER_ATOMIC
    );
    let result = "";
    if (dropdown_infotype == "classname") {
      result = `__bboxes[${value_n}].class`;
    } else if (dropdown_infotype == "probability") {
      result = `(Math.round( __bboxes[${value_n}].score * 100 * 1e2 ) / 1e2)`;
    } else if (dropdown_infotype == "class_index") {
      result = `__bboxes[${value_n}].index`;
    } else if (dropdown_infotype == "width") {
      result = `__bboxes[${value_n}].width`;
    } else if (dropdown_infotype == "heigh") {
      result = `__bboxes[${value_n}].height`;
    } else if (dropdown_infotype == "centerX") {
      result = `__bboxes[${value_n}].centerX`;
    } else if (dropdown_infotype == "centerY") {
      result = `__bboxes[${value_n}].centerY`;
    } else if (dropdown_infotype == "area") {
      result = `__bboxes[${value_n}].area`;
    }
    var code = result;
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
    var code = `postMessage({ command : "MOVE", lin : ${value_speed}, ang : 0 });
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
