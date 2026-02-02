export default {
  name: "iKB-1",    
  description: "Universal I/O board",
  category: "Signal Input/Output",    
  author: "comdet",
  version: "1.0.0",
  icon: "/static/icon.png",
  color: "#191e3e",
  blocks: [
    "ikb1_select_i2c_address",
    "ikb1_digital_read",
    {
      xml: `
                <block type="ikb1_digital_write">
                    <value name="value">
                        <shadow type="math_number">
                            <field name="NUM">1</field>
                        </shadow>
                    </value>
                </block>
            `,
    },
    "ikb1_analog_read",
    {
      xml: `
                <block type="ikb1_motor">
                    <value name="speed">
                        <shadow type="math_number">
                            <field name="NUM">50</field>
                        </shadow>
                    </value>
                </block>
            `,
    },
    {
      xml: `
                <block type="ikb1_servo">
                    <value name="angle">
                        <shadow type="math_number">
                            <field name="NUM">90</field>
                        </shadow>
                    </value>
                </block>
            `,
    },
    {
      xml: `
                <block type="ikb1_servo2">
                    <value name="speed">
                        <shadow type="math_number">
                            <field name="NUM">50</field>
                        </shadow>
                    </value>
                </block>
            `,
    },
    {
      xml: `
                <sep gap="50"></sep>
		        <label text="Serial"></label>
            `,
    },
    "ikb1_serial_config",
    {
      xml: `
                <block type="ikb1_serial_write">
                    <value name="data">
                        <shadow type="text">
                            <field name="TEXT">Hello!</field>
                        </shadow>
                    </value>
                </block>
            `,
    },
    {
      xml: `
                <block type="ikb1_serial_write_line">
                    <value name="data">
                        <shadow type="text">
                            <field name="TEXT">Hello!</field>
                        </shadow>
                    </value>
                </block>
            `,
    },
    "ikb1_serial_available",
    "ikb1_serial_read_one_byte",
    {
      xml: `
                <block type="ikb1_serial_read">
                    <value name="count">
                        <shadow type="math_number">
                            <field name="NUM">1</field>
                        </shadow>
                    </value>
                </block>
            `,
    },

    /*"ikb1_serial_read_string",
        "ikb1_serial_read_line",
        "ikb1_serial_read_until",*/
    {
      xml: `
                <sep gap="50"></sep>
                <label text="Robot Car" web-class="HeaderLabelStyle"></label>
            `,
    },
    {
      xml: `
                <block type="ikb1_motor_forward">
                    <value name="speed">
                        <shadow type="math_number">
                            <field name="NUM">50</field>
                        </shadow>
                    </value>
                </block>        
            `,
    },
    {
      xml: `
                <block type="ikb1_motor_backward">
                    <value name="speed">
                        <shadow type="math_number">
                            <field name="NUM">50</field>
                        </shadow>
                    </value>
                </block>
            `,
    },
    {
      xml: `
                <block type="ikb1_motor_forward2">
                    <value name="speed1">
                        <shadow type="math_number">
                            <field name="NUM">50</field>
                        </shadow>
                    </value>
                    <value name="speed2">
                        <shadow type="math_number">
                            <field name="NUM">50</field>
                        </shadow>
                    </value>
                </block>
            `,
    },
    {
      xml: `
                <block type="ikb1_motor_backward2">
                    <value name="speed1">
                        <shadow type="math_number">
                            <field name="NUM">50</field>
                        </shadow>
                    </value>
                    <value name="speed2">
                        <shadow type="math_number">
                            <field name="NUM">50</field>
                        </shadow>
                    </value>
                </block>
            `,
    },
    {
      xml: `
                <block type="ikb1_motor_turn_left">
                    <value name="speed">
                        <shadow type="math_number">
                            <field name="NUM">50</field>
                        </shadow>
                    </value>
                </block>
            `,
    },
    {
      xml: `
                <block type="ikb1_motor_turn_right">
                    <value name="speed">
                        <shadow type="math_number">
                            <field name="NUM">50</field>
                        </shadow>
                    </value>
                </block>
            `,
    },
    {
      xml: `
                <block type="ikb1_motor_spin_left">
                    <value name="speed">
                        <shadow type="math_number">
                            <field name="NUM">50</field>
                        </shadow>
                    </value>
                </block>
            `,
    },
    {
      xml: `
                <block type="ikb1_motor_spin_right">
                    <value name="speed">
                        <shadow type="math_number">
                            <field name="NUM">50</field>
                        </shadow>
                    </value>
                </block>
            `,
    },
    "ikb1_motor_stop",
  ],
}
