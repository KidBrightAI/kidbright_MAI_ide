export default {
  name: "NETPIE",
  description: "Connect device to NETPIE IoT platform",
  category: "Communication",
  author: "Chavee Issariyapat",
  version: "1.0.6",
  icon: "/static/icon.png",
  color: "#4A7CCC",
  blocks: [
    {
      xml: `
                 <block type="netpie_connect">
                     <value name="device_id">
                         <shadow type="text">
                             <field name="TEXT">00000000-0000-0000-0000-000000000000</field>
                         </shadow>
                     </value>
                     <value name="device_token">
                         <shadow type="text">
                             <field name="TEXT">xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx</field>
                         </shadow>
                     </value>
                 </block>
             `,
    },
    {
      xml: `
                 <block type="netpie_on_connected">
                 </block>
             `,
    },
    {
      xml: `
                 <block type="netpie_on_disconnected">
                 </block>
             `,
    },
    {
      xml: `
                 <block type="netpie_publish">
                     <value name="payload">
                         <shadow type="text">
                             <field name="TEXT">ON</field>
                         </shadow>
                     </value>
                 </block>
             `,
    },
    {
      xml: `
                 <block type="netpie_subscribe">
                     <value name="topic">
                         <shadow type="text">
                             <field name="TEXT"></field>
                         </shadow>
                     </value>
                 </block>
             `,
    },
    {
      xml: `
                 <block type="netpie_on_reveived_msg">
                     <value name="topic">
                         <shadow type="text">
                             <field name="TEXT"></field>
                         </shadow>
                     </value>
 
                 </block>
             `,
    },
    {
      xml: `
                 <block type="netpie_msg_payload">
                     <value name="datatype">
                     </value>
 
                 </block>
             `,
    },
    {
      xml: `
                 <block type="netpie_write_shadow_field">
                     <value name="field">
                         <shadow type="text">
                             <field name="TEXT">home.bedroom.temp</field>
                         </shadow>
                     </value>
                     <value name="value">
                         <shadow type="math_number">
                             <field name="NUM">24.5</field>
                         </shadow>
                     </value> 
                 </block>
             `,
    },
    {
      xml: `
                 <block type="netpie_read_shadow">
                 </block>
             `,
    },
    {
      xml: `
                 <block type="netpie_on_shadow_updated">
                 </block>
             `,
    },
    {
      xml: `
                 <block type="netpie_shadow_field">
                     <value name="field">
                         <shadow type="text">
                             <field name="TEXT">home.bedroom.temp</field>
                         </shadow>
                     </value>
 
                 </block>
             `,
    },
    {
      xml: `
                 <block type="netpie_on_reveived_private_msg">
                     <value name="topic">
                         <shadow type="text">
                             <field name="TEXT"></field>
                         </shadow>
                     </value>
 
                 </block>
             `,
    },
    {
      xml: `
                 <block type="netpie_private_msg_payload">
                     <value name="datatype">
                     </value>
 
                 </block>
             `,
    },
    {
      xml: `
                 <block type="netpie_push">
                     <value name="body">
                         <shadow type="text">
                             <field name="TEXT">Light ON</field>
                         </shadow>
                     </value> 
                 </block>
             `,
    },
    {
      xml: `
                 <block type="netpie_text">
                     <value name="value">
                     </value>
                 </block>
             `,
    },
    {
      xml: `
                 <block type="netpie_number">
                     <value name="value">
                     </value>
                 </block>
             `,
    },
    {
      xml: `
                 <block type="netpie_boolean">
                     <value name="value">
                     </value>
                 </block>
             `,
    },
  ],
}
