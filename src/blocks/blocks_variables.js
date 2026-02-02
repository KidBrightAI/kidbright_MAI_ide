Blockly.defineBlocksWithJsonArray([
  
])

/*
if (Blockly.Blocks['math_change']) {
  delete Blockly.Blocks['math_change'];
}
*/
// Copy from blockly\core\variables.js
Blockly.Variables.flyoutCategoryBlocks = function(workspace) {
  var variableModelList = workspace.getVariablesOfType('')

  var xmlList = []
  if (variableModelList.length > 0) {
    // New variables are added to the end of the variableModelList.
    var mostRecentVariable = variableModelList[variableModelList.length - 1]
    if (Blockly.Blocks['variables_set']) {
      var block = Blockly.utils.xml.createElement('block')
      block.setAttribute('type', 'variables_set')
      block.setAttribute('gap', Blockly.Blocks['math_change'] ? 8 : 24)
      block.appendChild(
        Blockly.Variables.generateVariableFieldDom(mostRecentVariable))
      var value = Blockly.Xml.textToDom(
        '<value name="VALUE">' +
          '<shadow type="math_number">' +
          '<field name="NUM">1</field>' +
          '</shadow>' +
          '</value>')
      block.appendChild(value)
      xmlList.push(block)
    }
    if (Blockly.Blocks['math_change']) {
      var block = Blockly.utils.xml.createElement('block')
      block.setAttribute('type', 'math_change')
      block.setAttribute('gap', Blockly.Blocks['variables_get'] ? 20 : 8)
      block.appendChild(
        Blockly.Variables.generateVariableFieldDom(mostRecentVariable))
      var value = Blockly.Xml.textToDom(
        '<value name="DELTA">' +
          '<shadow type="math_number">' +
          '<field name="NUM">1</field>' +
          '</shadow>' +
          '</value>')
      block.appendChild(value)
      xmlList.push(block)
    }

    if (Blockly.Blocks['variables_get']) {
      variableModelList.sort(Blockly.VariableModel.compareByName)
      for (var i = 0, variable; (variable = variableModelList[i]); i++) {
        var block = Blockly.utils.xml.createElement('block')
        block.setAttribute('type', 'variables_get')
        block.setAttribute('gap', 8)
        block.appendChild(Blockly.Variables.generateVariableFieldDom(variable))
        xmlList.push(block)
      }
    }
  }
  
  return xmlList
}
