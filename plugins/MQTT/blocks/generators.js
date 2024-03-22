//============= MQTT =============//
python.pythonGenerator.forBlock['mqtt_config'] = function(block, generator) {   
  var value_host = generator.valueToCode(block, 'host', python.Order.NONE) || "'broker.emqx.io'";
  var value_port = generator.valueToCode(block, 'port', python.Order.ATOMIC) || '1883';
  var value_client_id = generator.valueToCode(block, 'client_id', python.Order.NONE) || "'KidBrightMAI-" + Math.floor(Math.random() * 1000) + "'";
  var value_username = generator.valueToCode(block, 'username', python.Order.NONE) || "''";
  var value_password = generator.valueToCode(block, 'password', python.Order.NONE) || "''";
  generator.definitions_['import_paho'] = 'import paho.mqtt.client as mqtt';
  var code = `client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2,${value_client_id})
client.connect(${value_host}, ${value_port}, 60)
client.loop_start()
try:
  client.on_connect = on_connect
except NameError:
  print('NameError')
  pass
try:
  client.on_message = on_message
except NameError:
  pass
`;
  return code;
};
python.pythonGenerator.forBlock['mqtt_on_connected'] = function(block, generator) {
  var statements_callback = generator.statementToCode(block, 'callback');
  generator.definitions_['import_paho'] = 'import paho.mqtt.client as mqtt';
  generator.definitions_['mqtt_on_connect'] = `def on_connect(client, userdata, flags, rc, properties=None):
  ${statements_callback}
`;
  return '';
};

python.pythonGenerator.forBlock['mqtt_is_connect'] = function(block, generator) {
  generator.definitions_['import_paho'] = 'import paho.mqtt.client as mqtt';
  let code = `client.is_connected()`;
  return [code, python.Order.NONE];
};

python.pythonGenerator.forBlock['mqtt_publish'] = function(block, generator) {
  generator.definitions_['import_paho'] = 'import paho.mqtt.client as mqtt';
  var text_topic = block.getFieldValue('topic');
  var value_value = generator.valueToCode(block, 'value', python.Order.ATOMIC) || '""';
  var code = `client.publish("${text_topic}", ${value_value})\n`;
  return code;
};

python.pythonGenerator.forBlock['mqtt_subscribe'] = function(block, generator) {
  generator.definitions_['import_paho'] = 'import paho.mqtt.client as mqtt';
  var text_topic = block.getFieldValue('topic');
  var code = `client.subscribe("${text_topic}")\n`;
  return code;
};

//on_message
python.pythonGenerator.forBlock['mqtt_on_message'] = function(block, generator) {
  var statements_callback = generator.statementToCode(block, 'callback');
  generator.definitions_['import_paho'] = 'import paho.mqtt.client as mqtt';
  generator.definitions_['mqtt_on_message'] = `def on_message(client, userdata, msg):
  _event_data = {
    "topic": msg.topic,
    "message": msg.payload.decode()
  }
  ${statements_callback}
`;
  return '';
};

//mqtt_loop
python.pythonGenerator.forBlock['mqtt_loop'] = function(block, generator) {
  generator.definitions_['import_paho'] = 'import paho.mqtt.client as mqtt';
  var code = `client.loop()\n`;
  return code;
};

python.pythonGenerator.forBlock['mqtt_get_topic'] = function(block, generator) {
  var code = '_event_data.topic';
  return [code, python.Order.NONE];
};

python.pythonGenerator.forBlock['mqtt_get_number'] = function(block, generator) {
  var code = 'int(_event_data.message)';
  return [code, python.Order.ATOMIC];
};

python.pythonGenerator.forBlock['mqtt_get_text'] = function(block, generator) {
  var code = '_event_data.message';
  return [code, python.Order.NONE];
};
//============================================//
