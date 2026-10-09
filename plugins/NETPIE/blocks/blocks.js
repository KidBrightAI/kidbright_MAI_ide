const MAX_INSTANCES = {
  'netpie_connect' : 1,
}

Blockly.defineBlocksWithJsonArray(
  [{
    "type": "netpie_connect",
    "message0": "%{BKY_KB_PLUGIN_NETPIE_NETPIE_CONNECT}",
    "args0": [
      {
        "type": "input_dummy",
      },
      {
        "type": "input_value",
        "name": "device_id",
        "check": "String",
        "align": "RIGHT",
      },
      {
        "type": "input_value",
        "name": "device_token",
        "check": "String",
        "align": "RIGHT",
      },
      {
        "type": "field_checkbox",
        "name": "sub_private_msg",
        "align": "RIGHT",
        "checked": true,
      },
      {
        "type": "input_dummy",
        "align": "RIGHT",
      },
      {
        "type": "field_checkbox",
        "name": "sub_shadow_updated",
        "align": "RIGHT",
        "checked": true,
      },
    ],
    "inputsInline": false,
    "previousStatement": null,
    "nextStatement": null,
    "colour": "#4A7CCC",
    "tooltip": "",
    "helpUrl": "",
  },

  {
    "type": "netpie_on_connected",
    "message0": "%{BKY_KB_PLUGIN_NETPIE_NETPIE_ON_CONNECTED}",
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
    "colour": "#4A7CCC",
  },

  {
    "type": "netpie_on_disconnected",
    "message0": "%{BKY_KB_PLUGIN_NETPIE_NETPIE_ON_DISCONNECTED}",
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
    "colour": "#4A7CCC",
  },


  {
    "type": "netpie_publish",
    "message0": "%{BKY_KB_PLUGIN_NETPIE_NETPIE_PUBLISH}",
    "args0": [
      {
        "type": "field_input",
        "name": "topic",
        "text": "home/switch",
      },
      {
        "type": "input_value",
        "name": "payload",
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
    "colour": "#339980",
    "tooltip": "",
    "helpUrl": "",
  },

  {
    "type": "netpie_subscribe",
    "message0": "%{BKY_KB_PLUGIN_NETPIE_NETPIE_SUBSCRIBE}",
    "args0": [
      {
        "type": "field_input",
        "name": "topic",
        "text": "home/switch",
      },
    ],
    "inputsInline": true,
    "previousStatement": null,
    "nextStatement": null,
    "colour": "#339980",
    "tooltip": "",
    "helpUrl": "",
  },


  {
    "type": "netpie_on_reveived_msg",
    "message0": "%{BKY_KB_PLUGIN_NETPIE_NETPIE_ON_REVEIVED_MSG}",
    "args0": [
      {
        "type": "field_input",
        "name": "topic",
        "text": "home/#",
      },
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
    "colour": "#339980",
  },


  {
    "type": "netpie_msg_payload",
    "message0": "%{BKY_KB_PLUGIN_NETPIE_NETPIE_MSG_PAYLOAD}",
    "args0": [
      {
        "type": "field_dropdown",
        "name": "datatype",
        "options": [
          [
            "%{BKY_KB_PLUGIN_NETPIE_NETPIE_MSG_PAYLOAD_OPT_STRING}",
            "string",
          ],
          [
            "%{BKY_KB_PLUGIN_NETPIE_NETPIE_MSG_PAYLOAD_OPT_INT}",
            "int",
          ],
          [
            "%{BKY_KB_PLUGIN_NETPIE_NETPIE_MSG_PAYLOAD_OPT_FLOAT}",
            "float",
          ],
        ],
      },

    ],
    "inputsInline": true,
    "output": null,
    "colour": "#339980",
  },


  {
    "type": "netpie_write_shadow_field",
    "message0": "%{BKY_KB_PLUGIN_NETPIE_NETPIE_WRITE_SHADOW_FIELD}",
    "args0": [
      {
        "type": "input_value",
        "name": "field",
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
    "colour": "#c76b99",
    "tooltip": "",
    "helpUrl": "",
  },


  {
    "type": "netpie_read_shadow",
    "message0": "%{BKY_KB_PLUGIN_NETPIE_NETPIE_READ_SHADOW}",
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
    "colour": "#c76b99",
  },


  {
    "type": "netpie_on_shadow_updated",
    "message0": "%{BKY_KB_PLUGIN_NETPIE_NETPIE_ON_SHADOW_UPDATED}",
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
    "colour": "#c76b99",
  },


  {
    "type": "netpie_shadow_field",
    "message0": "%{BKY_KB_PLUGIN_NETPIE_NETPIE_SHADOW_FIELD}",
    "args0": [
      {
        "type": "input_value",
        "name": "field",
        "text": "",
      },
      {
        "type": "field_dropdown",
        "name": "datatype",
        "options": [
          [
            "%{BKY_KB_PLUGIN_NETPIE_NETPIE_SHADOW_FIELD_OPT_INT}",
            "int",
          ],
          [
            "%{BKY_KB_PLUGIN_NETPIE_NETPIE_SHADOW_FIELD_OPT_FLOAT}",
            "float",
          ],
          [
            "%{BKY_KB_PLUGIN_NETPIE_NETPIE_SHADOW_FIELD_OPT_STRING}",
            "string",
          ],
          [
            "%{BKY_KB_PLUGIN_NETPIE_NETPIE_SHADOW_FIELD_OPT_BOOL}",
            "bool",
          ],
        ],
      },
    ],
    "inputsInline": true,
    "output": null,
    "colour": "#c76b99",
    "tooltip": "",
    "helpUrl": "",
  },


  {
    "type": "netpie_on_reveived_private_msg",
    "message0": "%{BKY_KB_PLUGIN_NETPIE_NETPIE_ON_REVEIVED_PRIVATE_MSG}",
    "args0": [
      {
        "type": "field_input",
        "name": "topic",
        "text": "command",
      },
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
    "colour": "#d27e4b",
  },


  {
    "type": "netpie_private_msg_payload",
    "message0": "%{BKY_KB_PLUGIN_NETPIE_NETPIE_PRIVATE_MSG_PAYLOAD}",
    "args0": [
      {
        "type": "field_dropdown",
        "name": "datatype",
        "options": [
          [
            "%{BKY_KB_PLUGIN_NETPIE_NETPIE_PRIVATE_MSG_PAYLOAD_OPT_STRING}",
            "string",
          ],
          [
            "%{BKY_KB_PLUGIN_NETPIE_NETPIE_PRIVATE_MSG_PAYLOAD_OPT_INT}",
            "int",
          ],
          [
            "%{BKY_KB_PLUGIN_NETPIE_NETPIE_PRIVATE_MSG_PAYLOAD_OPT_FLOAT}",
            "float",
          ],
        ],
      },

    ],
    "inputsInline": true,
    "output": null,
    "colour": "#d27e4b",
  },


  {
    "type": "netpie_push",
    "message0": "%{BKY_KB_PLUGIN_NETPIE_NETPIE_PUSH}",
    "args0": [
      {
        "type": "field_input",
        "name": "title",
        "text": "KidBright Alert",
      },
      {
        "type": "input_value",
        "name": "body",
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
    "colour": "#cdac4c",
    "tooltip": "",
    "helpUrl": "",
  },


  {
    "type": "netpie_text",
    "message0": "\"%1\"",
    "args0": [
      {
        "type": "field_input",
        "name": "value",
        "text": "Hello",
        "check": [
          "String",
        ],
      },
    ],
    "inputsInline": true,
    "output": null,
    "colour": "#b3b3b3",
  },

  {
    "type": "netpie_number",
    "message0": "%1",
    "args0": [
      {
        "type": "field_input",
        "name": "value",
        "text": "1",
        "check": [
          "Number",
        ],
      },
    ],
    "inputsInline": true,
    "output": null,
    "colour": "#b3b3b3",
  },


  {
    "type": "netpie_boolean",
    "message0": "%1",
    "args0": [
      {
        "type": "field_dropdown",
        "name": "value",
        "options": [
          [
            "%{BKY_KB_PLUGIN_NETPIE_NETPIE_BOOLEAN_OPT_TRUE}",
            "True",
          ],
          [
            "%{BKY_KB_PLUGIN_NETPIE_NETPIE_BOOLEAN_OPT_FALSE}",
            "False",
          ],
        ],
      },
    ],
    "inputsInline": true,
    "output": null,
    "colour": "#b3b3b3",
  }])

setTimeout(function() {
  let workspaces = Blockly.Workspace.getAll()
  if (workspaces.length > 0) {
    let workspace = workspaces[0]
    workspace.addChangeListener(function(event) {
      if (event.type == Blockly.Events.BLOCK_CREATE) {
        event.ids.forEach(function(blockid) {
          let block = workspace.getBlockById(blockid)

          if (block && MAX_INSTANCES[block.type]) {
            let instances = workspace.getAllBlocks().filter(b => b.type === block.type)
            if (instances.length > MAX_INSTANCES[block.type]) {
              block.dispose(true, true)
            }
          }
        })
      }
    })
  }
}, 1000)
