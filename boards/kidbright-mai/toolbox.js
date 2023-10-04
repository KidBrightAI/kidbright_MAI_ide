export default [
    {
        name: "Camera",
        color: "#4FC3F7",
        icon: `images/icons/camera.png`,
        blocks: [
        ]
    },
    {
        name: "Display",
        color: "#4FC3F7",
        icon: `images/icons/lcd.png`,
        blocks: [
        ]
    },
    {
        name: "Image Processing",
        color: "#4FC3F7",
        icon: `images/icons/image-processing.png`,
        blocks: [
        ]
    },
    {
        name: "Artificial Intelligence",
        color: "#4FC3F7",
        icon: `images/icons/ai.png`,
        blocks: [
        ]
    },
    {
      name: "GPIO I/O",
      color: "#4FC3F7",
      icon: `images/icons/gpio.png`,
      blocks: [
          {
              xml: '<label text="Sensor"></label>',
          },
          "ultrasonic_read",
          {
              xml: '<label text="Switch"></label>',
          },
          "switch_on_pressed",
          /*"switch_on_press",
          "switch_on_release",*/
          "switch_is_press",
          "switch_is_release",
          "switch_get_value",
          {
              xml: '<label text="Buzzer"></label>',
          },
          {
              xml: `
                  <block type="buzzer_tone">
                      <value name="freq">
                          <shadow type="math_number">
                              <field name="NUM">2000</field>
                          </shadow>
                      </value>
                      <value name="duration">
                          <shadow type="math_number">
                              <field name="NUM">1</field>
                          </shadow>
                      </value>
                  </block>
              `
          },
          {
              xml: `
                  <block type="buzzer_notes">
                      <value name="notes">
                          <block type="make_note">
                              <field name="notes">C5</field>
                          </block>
                      </value>
                      <field name="duration">1 / 2</field>
                  </block>
              `
          },
          {
              xml: `
                  <block type="buzzer_volume">
                      <value name="level">
                          <shadow type="math_number">
                              <field name="NUM">50</field>
                          </shadow>
                      </value>
                  </block>
              `
          },
          {
              xml: '<label text="I/O"></label>',
          },
          {
              xml: `
                  <block type="pin_digital_write">
                      <value name="value">
                          <shadow type="math_number">
                              <field name="NUM">1</field>
                          </shadow>
                      </value>
                      <value name="pin">
                          <shadow type="math_number">
                              <field name="NUM">25</field>
                          </shadow>
                      </value>
                  </block>
              `
          },
          {
              xml: `
                  <block type="pin_analog_write">
                      <value name="value">
                          <shadow type="math_number">
                              <field name="NUM">1023</field>
                          </shadow>
                      </value>
                      <value name="pin">
                          <shadow type="math_number">
                              <field name="NUM">25</field>
                          </shadow>
                      </value>
                  </block>
              `
          },
          {
              xml: `
                  <block type="pin_digital_read">
                      <value name="pin">
                          <shadow type="math_number">
                              <field name="NUM">25</field>
                          </shadow>
                      </value>
                  </block>
              `
          },
          {
              xml: `
                  <block type="pin_analog_read">
                      <value name="pin">
                          <shadow type="math_number">
                              <field name="NUM">A0</field>
                          </shadow>
                      </value>
                  </block>
              `
          },
      ]
    },
    {
      name: "Text",
      color: "#4FC3F7",
      icon: `images/icons/font.png`,
      blocks: [
        {
            xml: `<block type="text_print">
            <value name="TEXT">
              <shadow type="text">
                <field name="TEXT">abc</field>
              </shadow>
            </value>
          </block>
          <block type="text">
            <field name="TEXT"></field>
          </block>
          <block type="text_join">
            <mutation items="2"></mutation>
          </block>
          <block type="text_append">
            <field name="VAR" id="4_)Y[X}8X0gDCBZ^E^@=">item</field>
            <value name="TEXT">
              <shadow type="text">
                <field name="TEXT"></field>
              </shadow>
            </value>
          </block>
          <block type="text_length">
            <value name="VALUE">
              <shadow type="text">
                <field name="TEXT">abc</field>
              </shadow>
            </value>
          </block>
          <block type="text_isEmpty">
            <value name="VALUE">
              <shadow type="text">
                <field name="TEXT"></field>
              </shadow>
            </value>
          </block>
          <block type="text_indexOf">
            <field name="END">FIRST</field>
            <value name="VALUE">
              <block type="variables_get">
                <field name="VAR" id="w?c^VN3B@+F{n;gnKLfk">text</field>
              </block>
            </value>
            <value name="FIND">
              <shadow type="text">
                <field name="TEXT">abc</field>
              </shadow>
            </value>
          </block>
          <block type="text_charAt">
            <mutation at="true"></mutation>
            <field name="WHERE">FROM_START</field>
            <value name="VALUE">
              <block type="variables_get">
                <field name="VAR" id="w?c^VN3B@+F{n;gnKLfk">text</field>
              </block>
            </value>
          </block>
          <block type="text_getSubstring">
            <mutation at1="true" at2="true"></mutation>
            <field name="WHERE1">FROM_START</field>
            <field name="WHERE2">FROM_START</field>
            <value name="STRING">
              <block type="variables_get">
                <field name="VAR" id="w?c^VN3B@+F{n;gnKLfk">text</field>
              </block>
            </value>
          </block>
          <block type="text_changeCase">
            <field name="CASE">UPPERCASE</field>
            <value name="TEXT">
              <shadow type="text">
                <field name="TEXT">abc</field>
              </shadow>
            </value>
          </block>
          <block type="text_trim">
            <field name="MODE">BOTH</field>
            <value name="TEXT">
              <shadow type="text">
                <field name="TEXT">abc</field>
              </shadow>
            </value>
          </block>`
        }
      ]
    },
    {
      name: "Variables",
      color: "#4FC3F7",
      icon: `images/icons/var.png`,
      blocks: "VARIABLE"
    },
    {
      name: "List",
      color: "#4FC3F7",
      icon: `images/icons/list.png`,
      blocks: [
            {
                xml: `<block type="lists_create_with">
                <mutation items="0"></mutation>
              </block>
              <block type="lists_create_with">
                <mutation items="3"></mutation>
                <value name="ADD0">
                  <shadow type="math_number">
                    <field name="NUM">1</field>
                  </shadow>
                </value>
                <value name="ADD1">
                  <shadow type="math_number">
                    <field name="NUM">2</field>
                  </shadow>
                </value>
                <value name="ADD2">
                  <shadow type="math_number">
                    <field name="NUM">3</field>
                  </shadow>
                </value>
              </block>
              <block type="lists_repeat">
                <value name="NUM">
                  <shadow type="math_number">
                    <field name="NUM">5</field>
                  </shadow>
                </value>
              </block>
              <block type="lists_length"></block>
              <block type="lists_isEmpty"></block>
              <block type="lists_indexOf">
                <field name="END">FIRST</field>
                <value name="FIND">
                  <shadow type="text">
                    <field name="TEXT">test</field>
                  </shadow>
                </value>
              </block>
              <block type="lists_getIndex">
                <mutation statement="false" at="true"></mutation>
                <field name="MODE">GET</field>
                <field name="WHERE">FROM_START</field>
                <value name="AT">
                  <shadow type="math_number">
                    <field name="NUM">5</field>
                  </shadow>
                </value>
              </block>
              <block type="lists_setIndex">
                <mutation at="true"></mutation>
                <field name="MODE">SET</field>
                <field name="WHERE">FROM_START</field>
                <value name="AT">
                  <shadow type="math_number">
                    <field name="NUM">5</field>
                  </shadow>
                </value>
                <value name="TO">
                  <shadow type="text">
                    <field name="TEXT">test</field>
                  </shadow>
                </value>
              </block>
              <block type="lists_getSublist">
                <mutation at1="true" at2="true"></mutation>
                <field name="WHERE1">FROM_START</field>
                <field name="WHERE2">FROM_START</field>
                <value name="AT1">
                  <shadow type="math_number">
                    <field name="NUM">1</field>
                  </shadow>
                </value>
                <value name="AT2">
                  <shadow type="math_number">
                    <field name="NUM">10</field>
                  </shadow>
                </value>
              </block>
              <block type="lists_split">
                <mutation mode="SPLIT"></mutation>
                <field name="MODE">SPLIT</field>
                <value name="INPUT">
                  <shadow type="text">
                    <field name="TEXT">1,2,3,4,5</field>
                  </shadow>
                </value>
                <value name="DELIM">
                  <shadow type="text">
                    <field name="TEXT">,</field>
                  </shadow>
                </value>
              </block>
              <block type="lists_sort">
                <field name="TYPE">NUMERIC</field>
                <field name="DIRECTION">1</field>
              </block>`
            }
      ]
    },
    {
      name: "Math",
      color: "#4FC3F7",
      icon: `images/icons/math.png`,
      blocks: [
          
          {
              xml: `
              <block type="math_number">
              <field name="NUM">0</field>
            </block>
            <block type="math_arithmetic">
              <field name="OP">ADD</field>
              <value name="A">
                <shadow type="math_number">
                  <field name="NUM">1</field>
                </shadow>
              </value>
              <value name="B">
                <shadow type="math_number">
                  <field name="NUM">1</field>
                </shadow>
              </value>
            </block>
            <block type="math_single">
              <field name="OP">ROOT</field>
              <value name="NUM">
                <shadow type="math_number">
                  <field name="NUM">9</field>
                </shadow>
              </value>
            </block>
            <block type="math_trig">
              <field name="OP">SIN</field>
              <value name="NUM">
                <shadow type="math_number">
                  <field name="NUM">45</field>
                </shadow>
              </value>
            </block>
            <block type="math_constant">
              <field name="CONSTANT">PI</field>
            </block>
            <block type="math_random_int">
              <value name="FROM">
                <shadow type="math_number">
                  <field name="NUM">1</field>
                </shadow>
              </value>
              <value name="TO">
                <shadow type="math_number">
                  <field name="NUM">100</field>
                </shadow>
              </value>
            </block>
            <block type="math_number_property">
              <mutation divisor_input="false"></mutation>
              <field name="PROPERTY">EVEN</field>
              <value name="NUMBER_TO_CHECK">
                <shadow type="math_number">
                  <field name="NUM">0</field>
                </shadow>
              </value>
            </block>
            <block type="math_round">
              <field name="OP">ROUND</field>
              <value name="NUM">
                <shadow type="math_number">
                  <field name="NUM">3.1</field>
                </shadow>
              </value>
            </block>
            <block type="math_on_list">
              <mutation op="SUM"></mutation>
              <field name="OP">SUM</field>
            </block>
            <block type="math_modulo">
              <value name="DIVIDEND">
                <shadow type="math_number">
                  <field name="NUM">64</field>
                </shadow>
              </value>
              <value name="DIVISOR">
                <shadow type="math_number">
                  <field name="NUM">10</field>
                </shadow>
              </value>
            </block>
              `
          },
      ]
    },
    {
      name: "Logic",
      color: "#4FC3F7",
      icon: `images/icons/logn.png`,
      blocks: [
          {
              xml: `
              <block type="controls_if">
              <value name="IF0">
                <block type="logic_compare">
                  <field name="OP">EQ</field>
                  <value name="A">
                    <shadow type="math_number">
                      <field name="NUM">0</field>
                    </shadow>
                  </value>
                  <value name="B">
                    <shadow type="math_number">
                      <field name="NUM">0</field>
                    </shadow>
                  </value>
                </block>
              </value>
            </block>
            <block type="controls_if">
              <value name="IF0">
                <block type="logic_operation">
                  <field name="OP">AND</field>
                </block>
              </value>
            </block>
            <block type="controls_if">
              <mutation else="1"></mutation>
            </block>
            <block type="controls_if">
              <mutation elseif="1" else="1"></mutation>
            </block>
            <block type="logic_compare">
              <field name="OP">LT</field>
              <value name="A">
                <shadow type="math_number">
                  <field name="NUM">0</field>
                </shadow>
              </value>
              <value name="B">
                <shadow type="math_number">
                  <field name="NUM">0</field>
                </shadow>
              </value>
            </block>
            <block type="logic_compare">
              <field name="OP">GT</field>
              <value name="A">
                <shadow type="math_number">
                  <field name="NUM">0</field>
                </shadow>
              </value>
              <value name="B">
                <shadow type="math_number">
                  <field name="NUM">0</field>
                </shadow>
              </value>
            </block>
            <block type="logic_compare">
              <field name="OP">NEQ</field>
              <value name="A">
                <shadow type="math_number">
                  <field name="NUM">0</field>
                </shadow>
              </value>
              <value name="B">
                <shadow type="math_number">
                  <field name="NUM">0</field>
                </shadow>
              </value>
            </block>
            <block type="logic_compare">
              <field name="OP">EQ</field>
            </block>
            <block type="logic_compare">
              <field name="OP">EQ</field>
            </block>
            <block type="logic_operation">
              <field name="OP">AND</field>
            </block>
            <block type="logic_negate"></block>
            <block type="logic_null"></block>    
            <block type="text_print">
                <value name="TEXT">
                    <shadow type="text">
                    <field name="TEXT">abc</field>
                    </shadow>
                </value>
            </block>
            `
          },
        ]
    },
    {
      name: "Loops",
      color: "#4FC3F7",
      icon: `images/icons/loop.png`,
      blocks: [
          {
              xml: `
              <block type="controls_repeat_ext">
              <value name="TIMES">
                <shadow type="math_number">
                  <field name="NUM">10</field>
                </shadow>
              </value>
            </block>
            <block type="controls_whileUntil">
              <field name="MODE">WHILE</field>
            </block>
            <block type="controls_for">
              <field name="VAR" id="oCd]8vxz-Mau~M!KFR_v">i</field>
              <value name="FROM">
                <shadow type="math_number">
                  <field name="NUM">1</field>
                </shadow>
              </value>
              <value name="TO">
                <shadow type="math_number">
                  <field name="NUM">10</field>
                </shadow>
              </value>
              <value name="BY">
                <shadow type="math_number">
                  <field name="NUM">1</field>
                </shadow>
              </value>
            </block>
            <block type="controls_forEach">
              <field name="VAR" id="$mr50Jzs+==5*:$9X;}r">j</field>
            </block>
            <block type="controls_flow_statements" disabled="false">
              <field name="FLOW">BREAK</field>
            </block>
            <block type="text_print">
                <value name="TEXT">
                    <shadow type="text">
                    <field name="TEXT">abc</field>
                    </shadow>
                </value>
            </block>
              `
          },          
          "controls_wait_until",          
          // "controls_flow_statements",
      ]
    },
    {
      name: "Advanced",
      color: "#4FC3F7",
      icon: `images/icons/technological.png`,
      blocks: []
    },
  ]

