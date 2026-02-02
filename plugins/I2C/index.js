export default {
  name: "I2C",    
  description: "I2C raw data read and write via pylibi2c",
  category: "Communication",
  author: "comdet",
  version: "1.0.0",
  icon: "/static/i2c.png",
  color: "#8b507c",
  blocks: [
    {
      xml : 
            `<block type="variables_set">
            <field name="VAR">i2c_device</field>
            <value name="VALUE">
              <block type="pylibi2c_init">
                <field name="device">2</field>
                <field name="addr">0x44</field>
              </block>
            </value>
          </block>
          <block type="pylibi2c_write">
            <field name="data">0x0, 0x1</field>
            <value name="device">
              <block type="variables_get">
                <field name="VAR">i2c_device</field>
              </block>
            </value>
          </block>
          <block type="variables_set">
            <field name="VAR">i2c_data</field>
            <value name="VALUE">
              <block type="pylibi2c_read">
                <value name="device">
                  <block type="variables_get">
                    <field name="VAR">i2c_device</field>
                  </block>
                </value>
                <value name="nbyte">
                  <shadow type="math_number">
                    <field name="NUM">6</field>
                  </shadow>
                </value>
              </block>
            </value>
          </block>
          <block type="lists_getIndex">
            <mutation statement="false" at="true"></mutation>
            <field name="MODE">GET</field>
            <field name="WHERE">FROM_START</field>
            <value name="VALUE">
              <block type="variables_get">
                <field name="VAR">i2c_data</field>
              </block>
            </value>
            <value name="AT">
              <shadow type="math_number">
                <field name="NUM">1</field>
              </shadow>
            </value>
          </block>
        </category>`,
    },
  ],
}
