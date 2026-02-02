//============= MQTT =============//
python.pythonGenerator.forBlock['mqtt_config'] = function(block, generator) {   
  var value_host = generator.valueToCode(block, 'host', python.Order.NONE) || "'broker.emqx.io'"
  var value_port = generator.valueToCode(block, 'port', python.Order.ATOMIC) || '1883'
  var value_client_id = generator.valueToCode(block, 'client_id', python.Order.NONE) || "'KidBrightMAI-" + Math.floor(Math.random() * 1000) + "'"
  var value_username = generator.valueToCode(block, 'username', python.Order.NONE) || "''"
  var value_password = generator.valueToCode(block, 'password', python.Order.NONE) || "''"
  var checkbox_wait = block.getFieldValue('wait') == 'TRUE'
  console.log(block.getFieldValue('wait'))
  generator.definitions_['import_paho'] = 'import paho.mqtt.client as mqtt'
  generator.definitions_['import_sys'] = 'import sys'
  generator.definitions_['import_signal'] = 'import signal'
  var function_name = generator.provideFunction_(
    'wait_internet_connection',
    ['def wait_internet_connection():',
      '  import time',
      '  import socket',
      '  _timeout = 60',
      '  while _timeout > 0:',
      '    try:',    
      '      socket.gethostbyname("google.com")',
      '      print("Internet connected")',
      '      break',
      '    except socket.gaierror:',    
      '      pass',
      '    time.sleep(1)',
      '    _timeout -= 1',
      '    print("Wait for internet connection...")'])
  var code = ""
  if (checkbox_wait) {
    console.log("Wait for internet connection...")
    code += `${function_name}()\n`
  }    
  code += `client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2,${value_client_id})  
client.connect(${value_host}, ${value_port}, 60)
try:
  client.on_connect = on_connect
except NameError:
  print('NameError')
  pass
try:
  client.on_message = on_message
except NameError:
  print('NameError')
  pass
client.loop_start()
`
  
  return code
}
python.pythonGenerator.forBlock['mqtt_on_connected'] = function(block, generator) {
  var statements_callback = generator.statementToCode(block, 'callback')
  generator.definitions_['import_paho'] = 'import paho.mqtt.client as mqtt'
  const indentedValueString = generator.prefixLines(statements_callback, generator.INDENT)
  generator.definitions_['mqtt_on_connect'] = `def on_connect(client, userdata, flags, rc, properties=None):
${statements_callback}
`
  
  return '\n'
}

python.pythonGenerator.forBlock['mqtt_is_connect'] = function(block, generator) {
  generator.definitions_['import_paho'] = 'import paho.mqtt.client as mqtt'
  let code = `client.is_connected()`
  
  return [code, python.Order.NONE]
}

python.pythonGenerator.forBlock['mqtt_publish'] = function(block, generator) {
  generator.definitions_['import_paho'] = 'import paho.mqtt.client as mqtt'
  var text_topic = block.getFieldValue('topic')
  var value_value = generator.valueToCode(block, 'value', python.Order.ATOMIC) || '""'
  
  return `client.publish("${text_topic}", ${value_value})\n`
}

python.pythonGenerator.forBlock['mqtt_subscribe'] = function(block, generator) {
  generator.definitions_['import_paho'] = 'import paho.mqtt.client as mqtt'
  var text_topic = block.getFieldValue('topic')
  
  return `client.subscribe("${text_topic}")\n`
}

//on_message
python.pythonGenerator.forBlock['mqtt_on_message'] = function(block, generator) {
  var statements_callback = generator.statementToCode(block, 'callback')
  generator.definitions_['import_paho'] = 'import paho.mqtt.client as mqtt'
  const indentedValueString = generator.prefixLines(statements_callback, generator.INDENT)
  generator.definitions_['mqtt_on_message'] = `def on_message(client, userdata, msg):
${statements_callback}
`
  
  return '\n'
}

//mqtt_loop
python.pythonGenerator.forBlock['mqtt_loop'] = function(block, generator) {
  generator.definitions_['import_paho'] = 'import paho.mqtt.client as mqtt'
  
  return `client.loop()\n`
}

python.pythonGenerator.forBlock['mqtt_get_topic'] = function(block, generator) {
  var code = 'msg.topic'
  
  return [code, python.Order.NONE]
}

python.pythonGenerator.forBlock['mqtt_get_number'] = function(block, generator) {
  var code = 'int(msg.payload)'
  
  return [code, python.Order.ATOMIC]
}

python.pythonGenerator.forBlock['mqtt_get_text'] = function(block, generator) {
  var code = 'msg.payload.decode("utf-8")'
  
  return [code, python.Order.NONE]
}

//============================================//
