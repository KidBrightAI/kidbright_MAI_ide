export default (Blockly, that) => {
  // ========== classification process ========== //
  Blockly.Python["start_image_classification"] = function (block) {
    var cc =
      "import rosnode\nimport subprocess\nimport time\nimport os\ncur_dir_path = os.path.dirname(os.path.realpath(__file__))\nros_nodes = rosnode.get_node_names()\nif not '/image_class' in ros_nodes:\n"
    cc =
      cc + "\tcommand='rosrun kidbright_tpu tpu_classify.py ' + cur_dir_path\n"
    cc =
      cc +
      "\tprocess = subprocess.Popen(command, shell=True, stdout=subprocess.PIPE)\n\ttime.sleep(10) \n"

    return cc
  }

  Blockly.Python["init_ros_node"] = function (block) {
    var code =
      "from geometry_msgs.msg import Twist\nimport rospy\nimport time\nrospy.init_node('get_center', anonymous=True)\nvelocity_publisher = rospy.Publisher('/cmd_vel', Twist, queue_size=1)\nvel_msg = Twist()\n"
    code =
      code +
      "import roslib\nimport rospy\nfrom kidbright_tpu.msg import tpu_object\nfrom kidbright_tpu.msg import tpu_objects\nfrom std_msgs.msg import String,Int16MultiArray\n"
    code =
      code +
      "output_publisher = rospy.Publisher('/output', String, queue_size=1)\n"
    code =
      code +
      "def map_value(value,istart,istop,ostart,ostop):\n\treturn round((ostart + (ostop - ostart) * ((value - istart) / (istop - istart))),3)\n"

    //code = code  + "import json\nlist_input = {\"1\":-1,\"2\":-1,\"3\":-1,\"4\":-1,\"5\":-1,\"6\":-1,\"7\":-1,\"8\":-1,\"9\":-1}\ndef get_input_callback(d):\n\tglobal list_input\n\tlist_input = json.loads(d.data)\nrospy.Subscriber(\"/input\", String, get_input_callback)\n";
    //code = code  + "import json\nlist_input = [-1,-1,-1,-1,-1,-1,-1,-1,-1]\ndef get_input_callback(d):\n\tglobal list_input\n\tlist_input = d.data\nrospy.Subscriber(\"/inputAN\", Int16MultiArray, get_input_callback)\n";
    return code
  }

  Blockly.Python["set_velocity"] = function (block) {
    var number_linear = Blockly.Python.valueToCode(
      block,
      "LINEAR",
      Blockly.Python.ORDER_ATOMIC,
    )
    var number_angular = Blockly.Python.valueToCode(
      block,
      "ANGULAR",
      Blockly.Python.ORDER_ATOMIC,
    )

    // var number_linear = block.getFieldValue("LINEAR");
    // var number_angular = block.getFieldValue("ANGULAR");
    var code =
      "vel_msg.linear.y = 0\nvel_msg.linear.z = 0\nvel_msg.angular.x = 0\nvel_msg.angular.y = 0\n"
    code =
      code +
      "vel_msg.linear.x = " +
      number_linear +
      "\n" +
      "vel_msg.angular.z = " +
      number_angular +
      "\n"
    code = code + "velocity_publisher.publish(vel_msg)\n"
    
    return code
  }

  Blockly.Python["rospy_loop"] = function (block) {
    var statements_name = Blockly.Python.statementToCode(block, "NAME")
    var branch = Blockly.Python.statementToCode(block, "DO")
    branch = Blockly.Python.addLoopTrap(branch, block) || Blockly.Python.PASS
    
    return "while not rospy.is_shutdown():\n" + branch
  }
  Blockly.Python["robot_classification_classify"] = function (block) {
    return `__output = rospy.wait_for_message('/tpu_objects', tpu_objects, timeout=4).tpu_objects\n`
  }
  Blockly.Python["get_class"] = function (block) {
    var code = "__output[0].label"
    
    return [code, Blockly.Python.ORDER_NONE]
  }

  Blockly.Python["get_confident"] = function (block) {
    var code = "(__output[0].confident * 100)"
    
    return [code, Blockly.Python.ORDER_NONE]
  }

  Blockly.Python["delay"] = function (block) {
    var value_name = Blockly.Python.valueToCode(
      block,
      "NAME",
      Blockly.Python.ORDER_ATOMIC,
    )
    
    return "time.sleep(" + value_name + ")\n"
  }

  Blockly.Python["forward"] = function (block) {
    var value_speed = Blockly.Python.valueToCode(
      block,
      "NAME",
      Blockly.Python.ORDER_ATOMIC,
    )
    var code =
      "vel_msg.linear.y = 0\nvel_msg.linear.z = 0\nvel_msg.angular.x = 0\nvel_msg.angular.y = 0\nvel_msg.angular.z = 0\n"
    code = code + "vel_msg.linear.x = " + value_speed + "/100\n"
    code = code + "velocity_publisher.publish(vel_msg);time.sleep(0.01)\n"
    
    return code
  }
  Blockly.Python["backward"] = function (block) {
    var value_speed = Blockly.Python.valueToCode(
      block,
      "NAME",
      Blockly.Python.ORDER_ATOMIC,
    )
    var code =
      "vel_msg.linear.y = 0\nvel_msg.linear.z = 0\nvel_msg.angular.x = 0\nvel_msg.angular.y = 0\nvel_msg.angular.z = 0\n"
    code = code + "vel_msg.linear.x = -" + value_speed + "/100\n"
    code = code + "velocity_publisher.publish(vel_msg);time.sleep(0.01)\n"
    
    return code
  }
  Blockly.Python["spin_right"] = function (block) {
    var value_speed = Blockly.Python.valueToCode(
      block,
      "NAME",
      Blockly.Python.ORDER_ATOMIC,
    )
    var code =
      "vel_msg.linear.x = 0\nvel_msg.linear.y = 0\nvel_msg.linear.z = 0\nvel_msg.angular.x = 0\nvel_msg.angular.y = 0\n"
    code = code + "vel_msg.angular.z = -" + value_speed + "/100\n"
    code = code + "velocity_publisher.publish(vel_msg);time.sleep(0.01)\n"
    
    return code
  }
  Blockly.Python["spin_left"] = function (block) {
    var value_speed = Blockly.Python.valueToCode(
      block,
      "NAME",
      Blockly.Python.ORDER_ATOMIC,
    )
    var code =
      "vel_msg.linear.x = 0\nvel_msg.linear.y = 0\nvel_msg.linear.z = 0\nvel_msg.angular.x = 0\nvel_msg.angular.y = 0\n"
    code = code + "vel_msg.angular.z = " + value_speed + "/100\n"
    code = code + "velocity_publisher.publish(vel_msg);time.sleep(0.01)\n"
    
    return code
  }

  Blockly.Python["stop"] = function (block) {
    var code =
      "vel_msg.linear.x = 0\nvel_msg.linear.y = 0\nvel_msg.linear.z = 0\nvel_msg.angular.x = 0\nvel_msg.angular.y = 0\nvel_msg.angular.z = 0\n"
    code = code + "velocity_publisher.publish(vel_msg);time.sleep(0.01)\n"
    
    return code
  }
  Blockly.Python["set_output"] = function (block) {
    var number_pin = block.getFieldValue("Pin")
    var number_logic = Blockly.Python.valueToCode(
      block,
      "Logic",
      Blockly.Python.ORDER_NONE,
    )
    var logic = number_logic <= 0 ? "L" : "H"
    
    return "output_publisher.publish('" +
      number_pin +
      logic +
      "');time.sleep(0.01)\n"
  }
  Blockly.Python["get_input"] = function (block) {
    var number_pin = block.getFieldValue("Pin")
    var number_A = Blockly.Python.valueToCode(
      block,
      "A",
      Blockly.Python.ORDER_NONE,
    )
    var number_B = Blockly.Python.valueToCode(
      block,
      "B",
      Blockly.Python.ORDER_NONE,
    )
    var code =
      "map_value(rospy.wait_for_message('/inputAN', Int16MultiArray, timeout=4).data[" +
      number_pin +
      "],0,1023," +
      number_A +
      "," +
      number_B +
      ")"
    
    return [code, Blockly.Python.ORDER_ATOMIC]
  }

  Blockly.Blocks["robot_classification_classify"] = {
    init: function () {
      this.appendDummyInput().appendField("classify image")
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour(230)
      this.setTooltip("")
      this.setHelpUrl("")
    },
  }

  Blockly.Blocks["get_class"] = {
    init: function () {
      this.appendDummyInput().appendField("get class")
      this.setOutput(true, null)
      this.setColour(230)
      this.setTooltip("")
      this.setHelpUrl("")
    },
  }

  Blockly.Blocks["get_confident"] = {
    init: function () {
      this.appendDummyInput().appendField("get confident")
      this.setOutput(true, null)
      this.setColour(230)
      this.setTooltip("")
      this.setHelpUrl("")
    },
  }

  Blockly.Blocks["start_image_classification"] = {
    init: function () {
      this.appendDummyInput().appendField("Start image classification")
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour(230)
      this.setTooltip("")
      this.setHelpUrl("")
    },
  }

  Blockly.Blocks["init_ros_node"] = {
    init: function () {
      this.appendDummyInput().appendField("ROS node initialization")
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour(230)
      this.setTooltip("")
      this.setHelpUrl("")
    },
  }

  Blockly.Blocks["rospy_loop"] = {
    init: function () {
      this.appendDummyInput().appendField("ROS LOOP")
      this.appendStatementInput("DO")
        .setCheck(null)
        .setAlign(Blockly.ALIGN_RIGHT)
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour(230)
      this.setTooltip("")
      this.setHelpUrl("")
    },
  }

  Blockly.Blocks["delay"] = {
    init: function () {
      this.appendDummyInput().appendField("delay")
      this.appendValueInput("NAME").setCheck("Number")
      this.setInputsInline(true)
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour(230)
      this.setTooltip("")
      this.setHelpUrl("")
    },
  }

  Blockly.Blocks["set_velocity"] = {
    init: function () {
      this.appendDummyInput().appendField("move with ")
      this.appendDummyInput().appendField("linear velocity")
      this.appendValueInput("LINEAR").setCheck("Number")
      this.appendDummyInput().appendField("angular velocity")
      this.appendValueInput("ANGULAR").setCheck("Number")
      this.setInputsInline(true)
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour(120)
      this.setTooltip("")
      this.setHelpUrl("")
    },
  }
  Blockly.Blocks["forward"] = {
    init: function () {
      this.appendDummyInput().appendField("forward at speed")
      this.appendValueInput("NAME").setCheck("Number")
      this.appendDummyInput().appendField("%")
      this.setInputsInline(true)
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour(120)
      this.setTooltip("set speed 0-100")
      this.setHelpUrl("")
    },
  }
  Blockly.Blocks["backward"] = {
    init: function () {
      this.appendDummyInput().appendField("backward at speed")
      this.appendValueInput("NAME").setCheck("Number")
      this.appendDummyInput().appendField("%")
      this.setInputsInline(true)
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour(120)
      this.setTooltip("set speed 0-100")
      this.setHelpUrl("")
    },
  }
  Blockly.Blocks["spin_right"] = {
    init: function () {
      this.appendDummyInput().appendField("spin right at speed")
      this.appendValueInput("NAME").setCheck("Number")
      this.appendDummyInput().appendField("%")
      this.setInputsInline(true)
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour(120)
      this.setTooltip("set speed 0-100")
      this.setHelpUrl("")
    },
  }
  Blockly.Blocks["spin_left"] = {
    init: function () {
      this.appendDummyInput().appendField("spin left at speed")
      this.appendValueInput("NAME").setCheck("Number")
      this.appendDummyInput().appendField("%")
      this.setInputsInline(true)
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour(120)
      this.setTooltip("set speed 0-100")
      this.setHelpUrl("")
    },
  }
  Blockly.Blocks["stop"] = {
    init: function () {
      this.appendDummyInput().appendField("stop moving")
      this.setInputsInline(true)
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour(120)
      this.setTooltip("Stop robot")
      this.setHelpUrl("")
    },
  }
  Blockly.Blocks["set_output"] = {
    init: function () {
      this.appendDummyInput().appendField("digital write")
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
          "Pin",
        )
      this.appendDummyInput().appendField("to")
      this.appendValueInput("Logic").setCheck("Number")

      //this.appendDummyInput(new Blockly.FieldNumber(0), "Logic");
      this.setInputsInline(true)
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour(120)
      this.setTooltip("set pin {PIN} to {0=LOW,1=HIGH}")
      this.setHelpUrl("")
    },
  }

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
          "Pin",
        )
      this.appendDummyInput().appendField("map from")
      this.appendValueInput("A").setCheck("Number")
      this.appendDummyInput().appendField("to")
      this.appendValueInput("B").setCheck("Number")
      this.setInputsInline(true)
      this.setOutput(true, null)
      this.setColour(120)
      this.setTooltip("return analog value 0-1023")
      this.setHelpUrl("")
    },
  }
}
