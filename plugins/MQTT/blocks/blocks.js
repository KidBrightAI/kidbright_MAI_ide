//============= MQTT =============//
Blockly.defineBlocksWithJsonArray([
  {
    "type": "mqtt_config",
    "message0": "%{BKY_KB_PLUGIN_MQTT_MQTT_CONFIG}",
    "args0": [
      {
        "type": "input_dummy",
      },
      {
        "type": "input_value",
        "name": "host",
        "check": "String",
        "align": "RIGHT",
      },
      {
        "type": "input_value",
        "name": "port",
        "check": "Number",
        "align": "RIGHT",
      },
      {
        "type": "input_value",
        "name": "client_id",
        "check": "String",
        "align": "RIGHT",
      },
      {
        "type": "input_value",
        "name": "username",
        "check": "String",
        "align": "RIGHT",
      },
      {
        "type": "input_value",
        "name": "password",
        "check": "String",
        "align": "RIGHT",
      },
      {
        "type": "field_checkbox",
        "name": "wait",
        "checked": true,
      },
    ],
    inputsInline: false,
    "previousStatement": null,
    "nextStatement": null,
    "colour": 180,
    "tooltip": "",
    "helpUrl": "",
  },
  {
    "type": "mqtt_on_connected",
    "message0": "%{BKY_KB_PLUGIN_MQTT_MQTT_ON_CONNECTED}",
    "args0": [
      {
        "type": "input_dummy",
      },
      {
        "type": "input_statement",
        "name": "callback",
      },
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": 180,
    "tooltip": "",
    "helpUrl": "",
  },
  {
    "type": "mqtt_is_connect",
    "message0": "%{BKY_KB_PLUGIN_MQTT_MQTT_IS_CONNECT}",
    "output": [
      "Number",
      "Boolean",
    ],
    "colour": 180,
    "tooltip": "",
    "helpUrl": "",
  },
  {
    "type": "mqtt_publish",
    "message0": "%{BKY_KB_PLUGIN_MQTT_MQTT_PUBLISH}",
    "args0": [
      {
        "type": "field_input",
        "name": "topic",
        "text": "",
      },
      {
        "type": "input_value",
        "name": "value",
        "check": [
          "Boolean",
          "Number",
          "String",
        ],
        "align": "RIGHT",
      },
    ],
    "inputsInline": true,
    "previousStatement": null,
    "nextStatement": null,
    "colour": 180,
    "tooltip": "",
    "helpUrl": "",
  },
  {
    "type": "mqtt_subscribe",
    "message0": "%{BKY_KB_PLUGIN_MQTT_MQTT_SUBSCRIBE}",
    "args0": [
      {
        "type": "field_input",
        "name": "topic",
        "text": "",
      },
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": 180,
    "tooltip": "",
    "helpUrl": "",
  },

  //mqtt on message
  {
    "type": "mqtt_on_message",
    "message0": "%{BKY_KB_PLUGIN_MQTT_MQTT_ON_MESSAGE}",
    "args0": [
      {
        "type": "input_dummy",
      },
      {
        "type": "input_statement",
        "name": "callback",
      },
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": 180,
    "tooltip": "",
    "helpUrl": "",
  },

  //mqtt loop
  {
    "type": "mqtt_loop",
    "message0": "%{BKY_KB_PLUGIN_MQTT_MQTT_LOOP}",
    "previousStatement": null,
    "nextStatement": null,
    "colour": 180,
    "tooltip": "",
    "helpUrl": "",
  },
  {
    "type": "mqtt_get_topic",
    "message0": "%{BKY_KB_PLUGIN_MQTT_MQTT_GET_TOPIC}",
    "output": "String",
    "colour": 180,
    "tooltip": "",
    "helpUrl": "",
  },
  {
    "type": "mqtt_get_number",
    "message0": "%{BKY_KB_PLUGIN_MQTT_MQTT_GET_NUMBER}",
    "output": [
      "Number",
      "Boolean",
    ],
    "colour": 180,
    "tooltip": "",
    "helpUrl": "",
  },
  {
    "type": "mqtt_get_text",
    "message0": "%{BKY_KB_PLUGIN_MQTT_MQTT_GET_TEXT}",
    "output": "String",
    "colour": 180,
    "tooltip": "",
    "helpUrl": "",
  },
])

//================================//
