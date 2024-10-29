let cb_netpie_on_connected_count = 0;
let cb_netpie_on_disconnected_count = 0;
let cb_netpie_on_reveived_msg_count = 0;
let cb_netpie_read_shadow_count = 0;
let cb_netpie_on_shadow_updated_count = 0;

function objectDotToBracket(path) {
    return path.split('.').map(item => `['${item}']`).join('');
}

function objectDotToJSON(path, val) {
    let out = {};
    let value;
    let a = path.split('.');
    for (let i=a.length-1; i>=0; i--) {
      if (value === undefined) {
        out[a[i]] = val;
      }
      else {
        out[a[i]] = {...value};
      }
      value = out;
      out = {}
    }
    return value;
}

function globalVariableDeclaration(block, generator) {
    let globals = [];
    let workspace = block.workspace;
    let variables = Blockly.Variables.allUsedVarModels(workspace) || [];
    for (let i = 0, variable; variable = variables[i]; i++) {
      globals.push(variable.name);
    }
    return globals.length ?
        generator.INDENT + 'global ' + globals.join(', ') : '';
}

function globalCodeDeclaration(block, generator) {
    generator.definitions_['import_enums'] = 'import enums';
    generator.definitions_['import_matcher'] = 'import matcher';
    generator.definitions_['import_packettypes'] = 'import packettypes';
    generator.definitions_['import_properties'] = 'import properties';
    generator.definitions_['import_publish'] = 'import publish';
    generator.definitions_['import_reasoncodes'] = 'import reasoncodes';
    generator.definitions_['import_subscribe'] = 'import subscribe';
    generator.definitions_['import_subscribeoptions'] = 'import subscribeoptions';
    generator.definitions_['import_mqttclient'] = 'import mqttclient as MQTT';
    generator.definitions_['import_netpie'] = 'import netpie as NETPIE';

    generator.definitions_['new_microgear'] = 'microgear = NETPIE.Microgear()';
}

python.pythonGenerator.forBlock['netpie_connect'] = function(block, generator) {
    globalCodeDeclaration(block, generator);

    let device_id = generator.valueToCode(block, 'device_id', python.Order.ATOMIC) || '';
    let device_token = generator.valueToCode(block, 'device_token', python.Order.ATOMIC) || '';
    let sub_private_msg = block.getFieldValue('sub_private_msg').toLowerCase() == 'true';
    let sub_shadow_updated = block.getFieldValue('sub_shadow_updated').toLowerCase() == 'true';
    
    let code = `microgear.setDeviceCredential(${device_id}, ${device_token})\n`;
    if (sub_private_msg) code += `microgear.subscribe('@private/#')\n`;
    if (sub_shadow_updated) code += `microgear.subscribe('@shadow/data/updated')\n`;
    code += `microgear.connect()\n`;

    return code;
};

python.pythonGenerator.forBlock['netpie_publish'] = function(block, generator) {
    globalCodeDeclaration(block, generator);

    let subtopic = block.getFieldValue('topic');
    let topic = `'@msg/${subtopic}'`;
    let payload = generator.valueToCode(block, 'payload', python.Order.ATOMIC) || '';
    let code = `microgear.publish(${topic},${payload})\n`
    return code;
};

python.pythonGenerator.forBlock['netpie_on_connected'] = function(block, generator) {
    globalCodeDeclaration(block, generator);

    let statements_callback = generator.statementToCode(block, 'callback') + '  pass';
    let functionName = generator.provideFunction_(
      'cb_netpie_on_connected_'+(cb_netpie_on_connected_count++),
      ['def ' + generator.FUNCTION_NAME_PLACEHOLDER_ + '():',
      globalVariableDeclaration(block, generator),
      statements_callback]
    );

    let code = `microgear.on('Connected', ${functionName})\n`;
    return code;
};

python.pythonGenerator.forBlock['netpie_on_disconnected'] = function(block, generator) {
  globalCodeDeclaration(block, generator);

  let statements_callback = generator.statementToCode(block, 'callback') + '  pass';  
  let functionName = generator.provideFunction_(
    'cb_netpie_on_disconnected_'+(cb_netpie_on_disconnected_count++),
    ['def ' + generator.FUNCTION_NAME_PLACEHOLDER_ + '():',
    globalVariableDeclaration(block, generator),
    statements_callback]
  );

  let code = `microgear.on('Disconnected', ${functionName})\n`;
  return code;
};

python.pythonGenerator.forBlock['netpie_subscribe'] = function(block, generator) {
    globalCodeDeclaration(block, generator);

    let subtopic = block.getFieldValue('topic');
    let topic = `'@msg/${subtopic}'`;
    let code = `microgear.subscribe(${topic})\n`
    return code;
};

python.pythonGenerator.forBlock['netpie_on_reveived_msg'] = function(block, generator) {
    globalCodeDeclaration(block, generator);

    let subtopic = block.getFieldValue('topic');
    let topic = `'@msg/${subtopic}'`;
    let statements_callback = generator.statementToCode(block, 'callback') + '  pass';
    let functionName = generator.provideFunction_(
      'cb_netpie_on_reveived_msg_'+(cb_netpie_on_reveived_msg_count++),
      ['def ' + generator.FUNCTION_NAME_PLACEHOLDER_ + '(topic, payload):',
      globalVariableDeclaration(block, generator),
      statements_callback]
    );

    let code = `microgear.on(${topic}, ${functionName})\n`;
    return code;
};

python.pythonGenerator.forBlock['netpie_msg_payload'] = function(block, generator) {
  let datatype = block.getFieldValue('datatype');

  let code;
  switch (datatype) {
    case 'string' :
            code = `str(payload)`;
            break;
    case 'int' :
            code = `int(payload)`;
            break;
    case 'float' :
            code = `float(payload)`;
            break;
    case 'bool' :
            code = `bool(payload)`;
            break;
  }
  return [code, python.Order.NONE]; 
};

python.pythonGenerator.forBlock['netpie_write_shadow_field'] = function(block, generator) {
    globalCodeDeclaration(block, generator);

    let field = generator.valueToCode(block, 'field', python.Order.ATOMIC) || '';
    let value = generator.valueToCode(block, 'value', python.Order.ATOMIC) || '';
    let code = `microgear.writeShadowField(${field}, ${value})\n`;
    return code;
};

python.pythonGenerator.forBlock['netpie_read_shadow'] = function(block, generator) {
    globalCodeDeclaration(block, generator);

    let statements_callback = generator.statementToCode(block, 'callback') + '  pass';
    let functionName = generator.provideFunction_(
      'cb_netpie_read_shadow_'+(cb_netpie_read_shadow_count++),
      ['def ' + generator.FUNCTION_NAME_PLACEHOLDER_ + '(shadow):',
      globalVariableDeclaration(block, generator),
      statements_callback]
    );

    let code = `microgear.getShadowData(${functionName})\n`;
    return code;
};

python.pythonGenerator.forBlock['netpie_on_shadow_updated'] = function(block, generator) {
    globalCodeDeclaration(block, generator);

    let statements_callback = generator.statementToCode(block, 'callback') + '  pass';
    let functionName = generator.provideFunction_(
      'cb_netpie_on_shadow_updated_'+(cb_netpie_on_shadow_updated_count++),
      ['def ' + generator.FUNCTION_NAME_PLACEHOLDER_ + '(shadow):',
      globalVariableDeclaration(block, generator),
      statements_callback]
    );

    let code = `microgear.on('ShadowUpdated', ${functionName})\n`;
    return code;
};

python.pythonGenerator.forBlock['netpie_shadow_field'] = function(block, generator) {
  let field = generator.valueToCode(block, 'field', python.Order.ATOMIC) || '';
  let datatype = block.getFieldValue('datatype');
  let code;

  let obj = 'shadow'+objectDotToBracket(field.replace(/'/g,""));
  switch (datatype) {
    case 'string' :
            code = `str(${obj})`;
            break;
    case 'int' :
            code = `int(${obj})`;
            break;
    case 'float' :
            code = `float(${obj})`;
            break;
  }
  return [code, python.Order.NONE]; 
};

python.pythonGenerator.forBlock['netpie_on_reveived_private_msg'] = function(block, generator) {
  globalCodeDeclaration(block, generator);

  let subtopic = block.getFieldValue('topic');
  let topic = `'@private/${subtopic}'`;

  let statements_callback = generator.statementToCode(block, 'callback') + '  pass';
  let functionName = generator.provideFunction_(
    'cb_netpie_on_reveived_msg_'+(cb_netpie_on_reveived_msg_count++),
    ['def ' + generator.FUNCTION_NAME_PLACEHOLDER_ + '(topic, payload):',
    globalVariableDeclaration(block, generator),
    statements_callback]
  );

  let code = `microgear.on(${topic}, ${functionName})\n`;
  return code;
};

python.pythonGenerator.forBlock['netpie_private_msg_payload'] = function(block, generator) {
  let datatype = block.getFieldValue('datatype');

  let code;
  switch (datatype) {
    case 'string' :
            code = `str(payload)`;
            break;
    case 'int' :
            code = `int(payload)`;
            break;
    case 'float' :
            code = `float(payload)`;
            break;
  }
  return [code, python.Order.NONE]; 
};

python.pythonGenerator.forBlock['netpie_push'] = function(block, generator) {
    globalCodeDeclaration(block, generator);

    let title = block.getFieldValue('title');
    let body = generator.valueToCode(block, 'body', python.Order.ATOMIC) || '';

    let code = `microgear.push('${title}', ${body})\n`

    // let code = `microgear.publish('@push', '{ "topic":"${}"   }')\n`
    return code;
};

python.pythonGenerator.forBlock['netpie_text'] = function(block, generator) {
  let value = block.getFieldValue('value');
  let code = `"${String(value)}"`;
  return [code, python.Order.NONE]; 
};

python.pythonGenerator.forBlock['netpie_number'] = function(block, generator) {
  let value = block.getFieldValue('value');
  let code = `${value}`;
  return [code, python.Order.NONE]; 
};

python.pythonGenerator.forBlock['netpie_boolean'] = function(block, generator) {
  let value = block.getFieldValue('value');
  let code = `${value}`;
  return [code, python.Order.NONE]; 
};
