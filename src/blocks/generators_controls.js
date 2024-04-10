Blockly.Python['controls_wait'] = function(block) {
  Blockly.Python.definitions_['from_time_import_sleep'] = 'from time import sleep';

  var value_time = Blockly.Python.valueToCode(block, 'time', Blockly.Python.ORDER_ATOMIC);
  var code = `sleep(${value_time})\n`;
  return code;
};

Blockly.Python['controls_forever'] = function(block) {
  var statements_block = Blockly.Python.statementToCode(block, 'block');
  var code = `while True:\n${statements_block || "  pass"}`;
  return code;
};

Blockly.Python['controls_on_start'] = function(block) {
  var statements_block = Blockly.Python.statementToCode(block, 'block');
  const line = statements_block.split(/\r\n|\r|\n/);
  const code = line.map(a => a.substring(2)).join("\n") + "\n";
  return code;
};

Blockly.Python['controls_forever_no_connect'] = function(block) {
  var statements_block = Blockly.Python.statementToCode(block, 'block');
  var code = `while True:\n${statements_block || "  pass"}\n`;
  return code;
};

Blockly.Python['while_loop'] = function(block) {
  var value_condition = Blockly.Python.valueToCode(block, 'condition', Blockly.Python.ORDER_ATOMIC);
  var statements_DO = Blockly.Python.statementToCode(block, 'DO');
  var code = `while ${value_condition}:\n${statements_DO}`;
  return code;
};
