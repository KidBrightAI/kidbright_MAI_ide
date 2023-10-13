export default (Blockly, that) => {
  Blockly.Python["init_ros_node"] = function (block) {
    var code =
      "from geometry_msgs.msg import Twist\nimport rospy\nimport time\nrospy.init_node('get_center', anonymous=True)\nvelocity_publisher = rospy.Publisher('/cmd_vel', Twist, queue_size=1)\nvel_msg = Twist()\n";
    code =
      code +
      "import roslib\nimport rospy\nfrom kidbright_tpu.msg import tpu_object\nfrom kidbright_tpu.msg import tpu_objects\nfrom std_msgs.msg import String,Int16MultiArray\n";
    code =
      code +
      "output_publisher = rospy.Publisher('/output', String, queue_size=1)\n";
    code =
      code +
      "def map_value(value,istart,istop,ostart,ostop):\n\treturn round((ostart + (ostop - ostart) * ((value - istart) / (istop - istart))),3)\n";
    return code;
  };

  Blockly.Python["start_object_detector"] = function (block) {
    var cc =
      "import rosnode\nimport subprocess\nimport time\nimport os\ncur_dir_path = os.path.dirname(os.path.realpath(__file__))\nros_nodes = rosnode.get_node_names()\nif not '/image_feature' in ros_nodes:\n";
    cc = cc + "\tcommand='rosrun kidbright_tpu tpu_detect.py '+cur_dir_path\n";
    cc =
      cc +
      "\tprocess = subprocess.Popen(command, shell=True, stdout=subprocess.PIPE)\n\ttime.sleep(10) \n";
    return cc;
  };

  Blockly.Python["yolo_detect"] = function (block) {
    var code =
      "__objects = rospy.wait_for_message('/tpu_objects', tpu_objects, timeout=30).tpu_objects\n";
    return code;
  };

  Blockly.Python["rospy_loop"] = function (block) {
    var statements_name = Blockly.Python.statementToCode(block, "NAME");
    var branch = Blockly.Python.statementToCode(block, "DO");
    branch += "time.sleep(0.01)";
    branch = Blockly.Python.addLoopTrap(branch, block) || Blockly.Python.PASS;
    var code = "while not rospy.is_shutdown():\n" + branch;
    return code;
  };

  Blockly.Python["get_object_attr"] = function (block) {
    var dropdown_data_field = block.getFieldValue("DATA_FIELD");
    var value_var = Blockly.Python.valueToCode(
      block,
      "VAR",
      Blockly.Python.ORDER_ATOMIC
    );
    console.log(block.getFieldValue("DATA_FIELD"));
    var code = value_var + "." + block.getFieldValue("DATA_FIELD");
    return [code, Blockly.Python.ORDER_NONE];
  };

  Blockly.Python["get_objects"] = function (block) {
    var code = "__objects";
    return [code, Blockly.Python.ORDER_NONE];
  };

  Blockly.Python["yolo_get_object_length"] = function (block) {
    var code = "len(__detect)";
    return [code, Blockly.Python.ORDER_ATOMIC];
  };

  Blockly.Python["set_velocity"] = function (block) {
    var number_linear = Blockly.Python.valueToCode(
      block,
      "LINEAR",
      Blockly.Python.ORDER_ATOMIC
    );
    var number_angular = Blockly.Python.valueToCode(
      block,
      "ANGULAR",
      Blockly.Python.ORDER_ATOMIC
    );
    // var number_linear = block.getFieldValue("LINEAR");
    // var number_angular = block.getFieldValue("ANGULAR");
    var code =
      "vel_msg.linear.y = 0\nvel_msg.linear.z = 0\nvel_msg.angular.x = 0\nvel_msg.angular.y = 0\n";
    code =
      code +
      "vel_msg.linear.x = " +
      number_linear +
      "\n" +
      "vel_msg.angular.z = " +
      number_angular +
      "\n";
    code = code + "velocity_publisher.publish(vel_msg)\n";
    return code;
  };

  Blockly.Python["delay"] = function (block) {
    var value_name = Blockly.Python.valueToCode(
      block,
      "NAME",
      Blockly.Python.ORDER_ATOMIC
    );
    var code = "time.sleep(" + value_name + ")\n";
    return code;
  };
  Blockly.Python["forward"] = function (block) {
    var value_speed = Blockly.Python.valueToCode(
      block,
      "NAME",
      Blockly.Python.ORDER_ATOMIC
    );
    var code =
      "vel_msg.linear.y = 0\nvel_msg.linear.z = 0\nvel_msg.angular.x = 0\nvel_msg.angular.y = 0\nvel_msg.angular.z = 0\n";
    code = code + "vel_msg.linear.x = " + value_speed + "/100\n";
    code = code + "velocity_publisher.publish(vel_msg);time.sleep(0.01)\n";
    return code;
  };
  Blockly.Python["backward"] = function (block) {
    var value_speed = Blockly.Python.valueToCode(
      block,
      "NAME",
      Blockly.Python.ORDER_ATOMIC
    );
    var code =
      "vel_msg.linear.y = 0\nvel_msg.linear.z = 0\nvel_msg.angular.x = 0\nvel_msg.angular.y = 0\nvel_msg.angular.z = 0\n";
    code = code + "vel_msg.linear.x = -" + value_speed + "/100\n";
    code = code + "velocity_publisher.publish(vel_msg);time.sleep(0.01)\n";
    return code;
  };
  Blockly.Python["spin_right"] = function (block) {
    var value_speed = Blockly.Python.valueToCode(
      block,
      "NAME",
      Blockly.Python.ORDER_ATOMIC
    );
    var code =
      "vel_msg.linear.x = 0\nvel_msg.linear.y = 0\nvel_msg.linear.z = 0\nvel_msg.angular.x = 0\nvel_msg.angular.y = 0\n";
    code = code + "vel_msg.angular.z = -" + value_speed + "/100\n";
    code = code + "velocity_publisher.publish(vel_msg);time.sleep(0.01)\n";
    return code;
  };
  Blockly.Python["spin_left"] = function (block) {
    var value_speed = Blockly.Python.valueToCode(
      block,
      "NAME",
      Blockly.Python.ORDER_ATOMIC
    );
    var code =
      "vel_msg.linear.x = 0\nvel_msg.linear.y = 0\nvel_msg.linear.z = 0\nvel_msg.angular.x = 0\nvel_msg.angular.y = 0\n";
    code = code + "vel_msg.angular.z = " + value_speed + "/100\n";
    code = code + "velocity_publisher.publish(vel_msg);time.sleep(0.01)\n";
    return code;
  };

  Blockly.Python["stop"] = function (block) {
    var code =
      "vel_msg.linear.x = 0\nvel_msg.linear.y = 0\nvel_msg.linear.z = 0\nvel_msg.angular.x = 0\nvel_msg.angular.y = 0\nvel_msg.angular.z = 0\n";
    code = code + "velocity_publisher.publish(vel_msg);time.sleep(0.01)\n";
    return code;
  };
  Blockly.Python["set_output"] = function (block) {
    var number_pin = block.getFieldValue("Pin");
    var number_logic = Blockly.Python.valueToCode(
      block,
      "Logic",
      Blockly.Python.ORDER_NONE
    );
    var logic = number_logic <= 0 ? "L" : "H";
    var code =
      "output_publisher.publish('" +
      number_pin +
      logic +
      "');time.sleep(0.01)\n";
    return code;
  };
  Blockly.Python["get_input"] = function (block) {
    var number_pin = block.getFieldValue("Pin");
    var number_A = Blockly.Python.valueToCode(
      block,
      "A",
      Blockly.Python.ORDER_NONE
    );
    var number_B = Blockly.Python.valueToCode(
      block,
      "B",
      Blockly.Python.ORDER_NONE
    );
    var code =
      "map_value(rospy.wait_for_message('/inputAN', Int16MultiArray, timeout=4).data[" +
      number_pin +
      "],0,1023," +
      number_A +
      "," +
      number_B +
      ")";
    return [code, Blockly.Python.ORDER_ATOMIC];
  };

  Blockly.Blocks["get_objects"] = {
    init: function () {
      this.appendDummyInput().appendField("get objects");
      this.setOutput(true, null);
      this.setColour(230);
      this.setTooltip("");
      this.setHelpUrl("");
    },
  };

  Blockly.Blocks["start_object_detector"] = {
    init: function () {
      this.appendDummyInput().appendField("Start object detector");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(230);
      this.setTooltip("");
      this.setHelpUrl("");
    },
  };

  Blockly.Blocks["yolo_detect"] = {
    init: function () {
      this.appendDummyInput().appendField("detect object");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(230);
      this.setTooltip("");
      this.setHelpUrl("");
    },
  };

  Blockly.Blocks["init_ros_node"] = {
    init: function () {
      this.appendDummyInput().appendField("ROS node initialization");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(230);
      this.setTooltip("");
      this.setHelpUrl("");
    },
  };

  Blockly.Blocks["rospy_loop"] = {
    init: function () {
      this.appendDummyInput().appendField("ROS LOOP");
      this.appendStatementInput("DO")
        .setCheck(null)
        .setAlign(Blockly.ALIGN_RIGHT);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(230);
      this.setTooltip("");
      this.setHelpUrl("");
    },
  };

  Blockly.Blocks["yolo_get_object_length"] = {
    init: function () {
      this.appendDummyInput().appendField("get detected object count");
      this.setOutput(true, "Number");
      this.setColour(230);
      this.setTooltip("");
      this.setHelpUrl("");
    },
  };

  Blockly.JavaScript["yolo_get_object_length"] = function (block) {
    var code = "len(__detect)";
    return [code, Blockly.Python.ORDER_ATOMIC];
  };

  // Blockly.Blocks["yolo_get_object_info"] = {
  //   init: function () {
  //     this.appendDummyInput()
  //       .appendField("get")
  //       .appendField(
  //         new Blockly.FieldDropdown([
  //           ["classname", "classname"],
  //           ["probability", "probability"],
  //           ["class index", "class_index"],
  //           ["width", "width"],
  //           ["height", "heigh"],
  //           ["centerX", "centerX"],
  //           ["centerY", "centerY"],
  //           ["area", "area"],
  //         ]),
  //         "infotype"
  //       )
  //       .appendField(" of object index");
  //     this.appendValueInput("n").setCheck("Number");
  //     this.setInputsInline(true);
  //     this.setOutput(true, null);
  //     this.setColour(230);
  //     this.setTooltip("");
  //     this.setHelpUrl("");
  //   },
  // };

  // Blockly.JavaScript["yolo_get_object_info"] = function (block) {
  //   var dropdown_infotype = block.getFieldValue("infotype");
  //   var value_n = Blockly.JavaScript.valueToCode(
  //     block,
  //     "n",
  //     Blockly.JavaScript.ORDER_ATOMIC
  //   );
  //   let result = "";
  //   if (dropdown_infotype == "classname") {
  //     result = `__bboxes[${value_n}].class`;
  //   } else if (dropdown_infotype == "probability") {
  //     result = `(Math.round( __bboxes[${value_n}].score * 100 * 1e2 ) / 1e2)`;
  //   } else if (dropdown_infotype == "class_index") {
  //     result = `__bboxes[${value_n}].index`;
  //   } else if (dropdown_infotype == "width") {
  //     result = `__bboxes[${value_n}].width`;
  //   } else if (dropdown_infotype == "heigh") {
  //     result = `__bboxes[${value_n}].height`;
  //   } else if (dropdown_infotype == "centerX") {
  //     result = `__bboxes[${value_n}].centerX`;
  //   } else if (dropdown_infotype == "centerY") {
  //     result = `__bboxes[${value_n}].centerY`;
  //   } else if (dropdown_infotype == "area") {
  //     result = `__bboxes[${value_n}].area`;
  //   }
  //   var code = result;
  //   return [code, Blockly.JavaScript.ORDER_NONE];
  // };

  Blockly.Blocks["get_object_attr"] = {
    init: function () {
      this.appendValueInput("VAR")
        .setCheck(null)
        .appendField("get")
        .appendField(
          new Blockly.FieldDropdown([
            ["cx", "cx"],
            ["cy", "cy"],
            ["width", "width"],
            ["height", "height"],
            ["label", "label"],
            ["confident", "confident"],
          ]),
          "DATA_FIELD"
        )
        .appendField(" from");
      this.setOutput(true, null);
      this.setColour(230);
      this.setTooltip("");
      this.setHelpUrl("");
    },
  };

  Blockly.Blocks["delay"] = {
    init: function () {
      this.appendDummyInput().appendField("delay");
      this.appendValueInput("NAME").setCheck("Number");
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(230);
      this.setTooltip("");
      this.setHelpUrl("");
    },
  };

  Blockly.Blocks["set_velocity"] = {
    init: function () {
      this.appendDummyInput().appendField("move with ");
      this.appendDummyInput().appendField("linear velocity");
      this.appendValueInput("LINEAR").setCheck("Number");
      this.appendDummyInput().appendField("angular velocity");
      this.appendValueInput("ANGULAR").setCheck("Number");
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(120);
      this.setTooltip("");
      this.setHelpUrl("");
    },
  };
  Blockly.Blocks["forward"] = {
    init: function () {
      this.appendDummyInput().appendField("forward at speed");
      this.appendValueInput("NAME").setCheck("Number");
      this.appendDummyInput().appendField("%");
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(120);
      this.setTooltip("set speed 0-100");
      this.setHelpUrl("");
    },
  };
  Blockly.Blocks["backward"] = {
    init: function () {
      this.appendDummyInput().appendField("backward at speed");
      this.appendValueInput("NAME").setCheck("Number");
      this.appendDummyInput().appendField("%");
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(120);
      this.setTooltip("set speed 0-100");
      this.setHelpUrl("");
    },
  };
  Blockly.Blocks["spin_right"] = {
    init: function () {
      this.appendDummyInput().appendField("spin right at speed");
      this.appendValueInput("NAME").setCheck("Number");
      this.appendDummyInput().appendField("%");
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(120);
      this.setTooltip("set speed 0-100");
      this.setHelpUrl("");
    },
  };
  Blockly.Blocks["spin_left"] = {
    init: function () {
      this.appendDummyInput().appendField("spin left at speed");
      this.appendValueInput("NAME").setCheck("Number");
      this.appendDummyInput().appendField("%");
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(120);
      this.setTooltip("set speed 0-100");
      this.setHelpUrl("");
    },
  };
  Blockly.Blocks["stop"] = {
    init: function () {
      this.appendDummyInput().appendField("stop moving");
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(120);
      this.setTooltip("Stop robot");
      this.setHelpUrl("");
    },
  };
  Blockly.Blocks["set_output"] = {
    init: function () {
      this.appendDummyInput().appendField("digital write");
      this.appendDummyInput()
        .appendField("Pin")
        .appendField(
          new Blockly.FieldDropdown([
            ["10", "10"],
            ["15", "15"],
            ["16", "16"],
            ["17", "17"],
            ["18", "18"],
            ["19", "19"],
            ["20", "20"],
            ["21", "21"],
            ["22", "22"],
          ]),
          "Pin"
        );
      this.appendDummyInput().appendField("to");
      this.appendValueInput("Logic").setCheck("Number");
      //this.appendDummyInput(new Blockly.FieldNumber(0), "Logic");
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(120);
      this.setTooltip("set pin {PIN} to {0=LOW,1=HIGH}");
      this.setHelpUrl("");
    },
  };

  Blockly.Blocks["get_input"] = {
    init: function () {
      this.appendDummyInput()
        .appendField("read pin")
        .appendField(
          new Blockly.FieldDropdown([
            ["1", "0"],
            ["2", "1"],
            ["3", "2"],
            ["4", "3"],
            ["5", "4"],
            ["6", "5"],
            ["7", "6"],
            ["8", "7"],
            ["9", "8"],
          ]),
          "Pin"
        );
      this.appendDummyInput().appendField("map from");
      this.appendValueInput("A").setCheck("Number");
      this.appendDummyInput().appendField("to");
      this.appendValueInput("B").setCheck("Number");
      this.setInputsInline(true);
      this.setOutput(true, null);
      this.setColour(120);
      this.setTooltip("return analog value 0-1023");
      this.setHelpUrl("");
    },
  };
};
