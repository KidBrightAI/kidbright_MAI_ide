import { useWorkspaceStore } from "@/store/workspace"

//const workspaceStore = useWorkspaceStore();

const blockAIObjectDetection = `
<label text="Object detection"></label>
<block type="maix3_nn_yolo_load"></block>
<block type="maix3_nn_yolo_detect"></block>
<block type="variables_set">
<field name="VAR">detect_results</field>
<value name="VALUE">
  <block type="maix3_nn_yolo_get_result_array"></block>
</value>
</block>
<block type="controls_forEach">
<field name="VAR">obj</field>
<value name="LIST">
  <block type="variables_get">
    <field name="VAR">detect_results</field>
  </block>
</value>
</block>
<block type="maix3_nn_yolo_get_count"></block>
<block type="maix3_nn_yolo_get">
<field name="data">center X</field>
<value name="obj">
  <block type="variables_get">
    <field name="VAR">obj</field>
  </block>
</value>
</block>`
const blockAIImageClassification = `
<label text="Image classification"></label>
<block type="maix3_nn_classify_load"></block>            
<block type="maix3_nn_classify_classify"></block>
<block type="maix3_nn_classify_get_result">
<field name="data">label</field>
</block>
`
const blockAIVoiceClassification = `
<label text="Voice classification"></label>
<block type="maix3_nn_voice_load"></block>
<block type="maix3_nn_voice_get_rms"></block>
<block type="maix3_nn_voice_classify"></block>
<block type="maix3_nn_voice_get_result">
<field name="data">label</field>
</block>
`

export default function () {

  const isHasAI = () => {
    const workspaceStore = useWorkspaceStore()
    console.log(workspaceStore.model)
    
    return workspaceStore.model
  }

  const categoryByModelType = () => {
    const workspaceStore = useWorkspaceStore()
    const modelType = workspaceStore.projectType
    if (modelType == "IMAGE_CLASSIFICATION") {
      return blockAIImageClassification
    }
    if (modelType == "OBJECT_DETECTION") {
      return blockAIObjectDetection
    }
    if (modelType == "VOICE_CLASSIFICATION") {
      return blockAIVoiceClassification
    }
    
    return ""
  }

  return [
    {
      name: "Basic",
      color: "#5BA58C",
      icon: `images/icons/basic_block_icon.svg`,
      blocks: [
        {
          xml: `<block type="maix3_display_camera"></block>
            <block type="maix3_set_display_color"></block>
            <block type="maix3_draw_string">
              <field name="color">#ff0000</field>
              <value name="text">
                <shadow type="text">
                  <field name="TEXT">hello world</field>
                </shadow>
              </value>
              <value name="x">
                <shadow type="math_number">
                  <field name="NUM">10</field>
                </shadow>
              </value>
              <value name="y">
                <shadow type="math_number">
                  <field name="NUM">10</field>
                </shadow>
              </value>
              <value name="scale">
                <shadow type="math_number">
                  <field name="NUM">1</field>
                </shadow>
              </value>
            </block>
            <block type="text_print">
              <value name="TEXT">
                <shadow type="text">
                  <field name="TEXT">hello world</field>
                </shadow>
              </value>
            </block>
            <block type="maixpy3_delay">
              <value name="delay">
                <shadow type="math_number">
                  <field name="NUM">1</field>
                </shadow>
              </value>
            </block>
            <block type="maix3_forever"></block>
            `,
        },
      ],
    },
    isHasAI() ?
      {
        name: "AI",
        color: "#5ba58c",
        icon: `images/icons/ai.png`,
        blocks: [
          {
            xml: categoryByModelType(),
          },
        ],
      } : {},
    {
      name: "Display / Image",
      color: "#9fa55b",
      icon: `images/icons/lcd.png`,
      blocks: [
        {
          xml: `<block type="maix3_display_width"></block>
          <block type="maix3_display_height"></block>
          <block type="maix3_display_resolution">
            <value name="width">
              <shadow type="math_number">
                <field name="NUM">240</field>
              </shadow>
            </value>
            <value name="height">
              <shadow type="math_number">
                <field name="NUM">240</field>
              </shadow>
            </value>
          </block>
          <block type="maix3_display_get_image"></block>
          <block type="maix3_display_dislay"></block>`,
        },
        {
          xml: `           
          <block type="variables_set">
            <field name="VAR">img1</field>
            <value name="VALUE">
              <block type="maix3_image_new">
                <field name="color">#000000</field>
                <value name="width">
                  <shadow type="math_number">
                    <field name="NUM">240</field>
                  </shadow>
                </value>
                <value name="height">
                  <shadow type="math_number">
                    <field name="NUM">240</field>
                  </shadow>
                </value>
              </block>
            </value>
          </block>
          <block type="variables_set">
            <field name="VAR">img1</field>
            <value name="VALUE">
            <block type="maix3_camera_capture"></block>
            </value>
          </block>
        <label text="Image Manipulation"></label>
        <block type="maix3_image_copy">
          <value name="image">
            <block type="variables_get">
              <field name="VAR">img1</field>
            </block>
          </value>
        </block>
        <block type="maix3_image_resize">
          <value name="image">
            <block type="variables_get">
              <field name="VAR">img1</field>
            </block>
          </value>
          <value name="width">
            <shadow type="math_number">
              <field name="NUM">90</field>
            </shadow>
          </value>
          <value name="height">
            <shadow type="math_number">
              <field name="NUM">90</field>
            </shadow>
          </value>
        </block>
        <block type="maix3_image_rotate">
          <field name="angle">90</field>
          <value name="image">
            <block type="variables_get">
              <field name="VAR">img1</field>
            </block>
          </value>
        </block>
        <block type="maix3_image_flip">
          <field name="direction">1</field>
          <value name="image">
            <block type="variables_get">
              <field name="VAR">img1</field>
            </block>
          </value>
        </block>
        <block type="maix3_image_crop">
          <value name="image">
            <block type="variables_get">
              <field name="VAR">img1</field>
            </block>
          </value>
          <value name="x1">
            <shadow type="math_number">
              <field name="NUM">10</field>
            </shadow>
          </value>
          <value name="y1">
            <shadow type="math_number">
              <field name="NUM">10</field>
            </shadow>
          </value>
          <value name="x2">
            <shadow type="math_number">
              <field name="NUM">50</field>
            </shadow>
          </value>
          <value name="y2">
            <shadow type="math_number">
              <field name="NUM">50</field>
            </shadow>
          </value>
        </block>
        <label text="Image drawing"></label>
        <block type="maix3_image_draw_string">
          <field name="color">#ff0000</field>
          <value name="image">
            <block type="variables_get">
              <field name="VAR">img1</field>
            </block>
          </value>
          <value name="text">
            <shadow type="text">
              <field name="TEXT">hello world</field>
            </shadow>
          </value>
          <value name="x">
            <shadow type="math_number">
              <field name="NUM">10</field>
            </shadow>
          </value>
          <value name="y">
            <shadow type="math_number">
              <field name="NUM">10</field>
            </shadow>
          </value>
          <value name="scale">
            <shadow type="math_number">
              <field name="NUM">1</field>
            </shadow>
          </value>
          <value name="thickness">
            <shadow type="math_number">
              <field name="NUM">1</field>
            </shadow>
          </value>
        </block>
        <block type="maix3_image_draw_line">
          <field name="color">#ff0000</field>
          <value name="image">
            <block type="variables_get">
              <field name="VAR">img1</field>
            </block>
          </value>
          <value name="x1">
            <shadow type="math_number">
              <field name="NUM">10</field>
            </shadow>
          </value>
          <value name="y1">
            <shadow type="math_number">
              <field name="NUM">10</field>
            </shadow>
          </value>
          <value name="x2">
            <shadow type="math_number">
              <field name="NUM">60</field>
            </shadow>
          </value>
          <value name="y2">
            <shadow type="math_number">
              <field name="NUM">60</field>
            </shadow>
          </value>
          <value name="thickness">
            <shadow type="math_number">
              <field name="NUM">3</field>
            </shadow>
          </value>
        </block>
        <block type="maix3_image_draw_rectangle">
          <field name="color">#ff0000</field>
          <value name="image">
            <block type="variables_get">
              <field name="VAR">img1</field>
            </block>
          </value>
          <value name="x1">
            <shadow type="math_number">
              <field name="NUM">10</field>
            </shadow>
          </value>
          <value name="y1">
            <shadow type="math_number">
              <field name="NUM">10</field>
            </shadow>
          </value>
          <value name="x2">
            <shadow type="math_number">
              <field name="NUM">60</field>
            </shadow>
          </value>
          <value name="y2">
            <shadow type="math_number">
              <field name="NUM">60</field>
            </shadow>
          </value>
          <value name="thickness">
            <shadow type="math_number">
              <field name="NUM">3</field>
            </shadow>
          </value>
        </block>
        <block type="maix3_image_draw_circle">
          <field name="color">#ff0000</field>
          <value name="image">
            <block type="variables_get">
              <field name="VAR">img1</field>
            </block>
          </value>
          <value name="x1">
            <shadow type="math_number">
              <field name="NUM">50</field>
            </shadow>
          </value>
          <value name="y1">
            <shadow type="math_number">
              <field name="NUM">50</field>
            </shadow>
          </value>
          <value name="radius">
            <shadow type="math_number">
              <field name="NUM">20</field>
            </shadow>
          </value>
          <value name="thickness">
            <shadow type="math_number">
              <field name="NUM">3</field>
            </shadow>
          </value>
        </block>
        <block type="maix3_image_draw_ellipse">
          <field name="color">#ff0000</field>
          <value name="image">
            <block type="variables_get">
              <field name="VAR">img1</field>
            </block>
          </value>
          <value name="x1">
            <shadow type="math_number">
              <field name="NUM">100</field>
            </shadow>
          </value>
          <value name="y1">
            <shadow type="math_number">
              <field name="NUM">100</field>
            </shadow>
          </value>
          <value name="radius_x">
            <shadow type="math_number">
              <field name="NUM">40</field>
            </shadow>
          </value>
          <value name="radius_y">
            <shadow type="math_number">
              <field name="NUM">60</field>
            </shadow>
          </value>
          <value name="rotate">
            <shadow type="math_number">
              <field name="NUM">0</field>
            </shadow>
          </value>
          <value name="angle_start">
            <shadow type="math_number">
              <field name="NUM">0</field>
            </shadow>
          </value>
          <value name="angle_end">
            <shadow type="math_number">
              <field name="NUM">360</field>
            </shadow>
          </value>
          <value name="thickness">
            <shadow type="math_number">
              <field name="NUM">3</field>
            </shadow>
          </value>
        </block>`,
        },
        {
          xml: `<label text="load and save image"></label> 
          <block type="maix3_image_open">
            <field name="path">./tmp.png</field>
            <value name="var">
              <block type="variables_get">
                <field name="VAR">img1</field>
              </block>
            </value>
          </block>
          <block type="maix3_image_save">
            <field name="path">./tmp.png</field>
            <value name="image">
              <block type="variables_get">
                <field name="VAR">img1</field>
              </block>
            </value>
          </block>`,
        },
      ],
    },
    {
      name: "Loops",
      color: "#56A668",
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
              <value name="BOOL">
                <shadow type="logic_boolean">
                  <field name="BOOL">TRUE</field>
                </shadow>
              </value>
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
            </block>`,
        },

        // "controls_flow_statements",
      ],
    },
    {
      name: "Logic",
      color: "#617E95",
      icon: `images/icons/logn.png`,
      blocks: [
        {
          xml: `
              <block type="controls_if">
              </block>
              <block type="controls_if">
                <mutation else="1"></mutation>
              </block>
              <block type="controls_if">
                <mutation elseif="1" else="1"></mutation>
              </block>
              <block type="logic_compare">
                <field name="OP">EQ</field>
              </block>
              <block type="logic_operation">
                <field name="OP">AND</field>
              </block>

              <block type="logic_boolean">
                <field name="BOOL">TRUE</field>
              </block>

              <block type="logic_negate"></block>
              <block type="logic_null"></block>    
            `,
        },
      ],
    },
    {
      name: "Math",
      color: "#3A4F8B",
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
              `,
        },
      ],
    },
    {
      name: "GPIO I/O",
      color: "#a5745b",
      icon: `images/icons/gpio.png`,
      blocks: [
        {
          // <block type="maixpy3_gpio_when_switch">
          //   <field name="switch">S1</field>
          // </block>            
          xml: `<label text="GPIO / Sensors"></label>
            <block type="maixpy3_gpio_switch">
              <field name="switch">S1</field>
            </block>
            <block type="maixpy3_gpio_buzzer">
              <value name="delay">
                <shadow type="math_number">
                  <field name="NUM">1</field>
                </shadow>
              </value>
            </block>
            <block type="maixpy3_gpio_get">
              <field name="pin">PH14</field>
            </block>
            <block type="maixpy3_gpio_set">
              <field name="pin">PH14</field>
              <value name="value">
                <shadow type="logic_boolean">
                  <field name="BOOL">TRUE</field>
                </shadow>
              </value>
            </block>            
            <block type="maixpy3_gpio_servo">
              <field name="pin">PH14</field>
              <value name="angle">
                <shadow type="math_number">
                  <field name="NUM">90</field>
                </shadow>
              </value>
            </block>
            <block type="board_get_acc">       
            </block>
            <block type="board_get_acc_tap">
            </block>
            `,

          // <block type="maixpy3_gpio_rgb_hex">
          //   <field name="color">#ff0000</field>
          // </block>
          // <block type="maixpy3_gpio_rgb">
          //   <value name="r">
          //     <shadow type="math_number">
          //       <field name="NUM">255</field>
          //     </shadow>
          //   </value>
          //   <value name="g">
          //     <shadow type="math_number">
          //       <field name="NUM">50</field>
          //     </shadow>
          //   </value>
          //   <value name="b">
          //     <shadow type="math_number">
          //       <field name="NUM">50</field>
          //     </shadow>
          //   </value>
          // </block>
        },
        {
          xml: `<label text="camera"></label>
            <block type="maix3_camera_width"></block>
            <block type="maix3_camera_height"></block>
            <block type="maix3_camera_resolution">
              <value name="width">
                <shadow type="math_number">
                  <field name="NUM">240</field>
                </shadow>
              </value>
              <value name="height">
                <shadow type="math_number">
                  <field name="NUM">240</field>
                </shadow>
              </value>
            </block>
            <block type="maix3_camera_capture"></block>
            <block type="maix3_camera_close"></block>`,
        },
      ],
    },
    {
      name: "Text",
      color: "#5ba593",
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
          </block>`,
        },
      ],
    },
    {
      name: "List",
      color: "#745ba5",
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
              </block>`,
        },
      ],
    },
    {
      name: "Variables",
      color: "#a55b80",
      icon: `images/icons/var.png`,
      blocks: "VARIABLE",
    },
    {
      name: "Functions",
      color: "#995ba5",
      icon: `images/icons/function.png`,
      blocks: "PROCEDURE",
    },
  ]
}
