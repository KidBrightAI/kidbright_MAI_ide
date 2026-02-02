Blockly.Python['controls_wait'] = function(block) {
  Blockly.Python.definitions_['from_time_import_sleep'] = 'from time import sleep'

  var value_time = Blockly.Python.valueToCode(block, 'time', Blockly.Python.ORDER_ATOMIC)
  
  return `sleep(${value_time})\n`
}

Blockly.Python['controls_forever'] = function(block) {
  var statements_block = Blockly.Python.statementToCode(block, 'block')
  
  return `while True:\n${statements_block || "  pass"}`
}

Blockly.Python['controls_on_start'] = function(block) {
  var statements_block = Blockly.Python.statementToCode(block, 'block')
  const line = statements_block.split(/\r\n|\r|\n/)
  
  return line.map(a => a.substring(2)).join("\n") + "\n"
}

Blockly.Python['controls_forever_no_connect'] = function(block) {
  var statements_block = Blockly.Python.statementToCode(block, 'block')
  
  return `while True:\n${statements_block || "  pass"}\n`
}

Blockly.Python['while_loop'] = function(block) {
  var value_condition = Blockly.Python.valueToCode(block, 'condition', Blockly.Python.ORDER_ATOMIC)
  var statements_DO = Blockly.Python.statementToCode(block, 'DO')
  
  return `while ${value_condition}:\n${statements_DO}`
}
