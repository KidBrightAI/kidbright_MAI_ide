
import Blockly from 'blockly/core'

const defaultBlockStyles = {
  'colour_blocks': {
    'colourPrimary': '#05427f',
  },
  'loop_blocks': {
    'colourPrimary': '#56A668',
  },
  'logic_blocks': {
    'colourPrimary': '#617E95',
  },
  'math_blocks': {
    'colourPrimary': '#3A4F8B',
  },
  'text_blocks': {
    'colourPrimary': '#5ba593',
  },
  'list_blocks': {
    'colourPrimary': '#745ba5',
  },
  'variable_blocks': {
    'colourPrimary': '#a55b80',
  },
  'variable_dynamic_blocks': {
    'colourPrimary': '#a55b80',
  },
  'procedure_blocks': {
    'colourPrimary': '#995ba5',
  },
  
}

/**
 * Tritanopia theme.
 * A colour palette for people that have tritanopia (the inability to perceive
 * blue light).
 */
export default Blockly.Theme.defineTheme('tritanopia', {
  'blockStyles': defaultBlockStyles,
  'componentStyles': { 'textColour' : '#000'},
  'fontStyle': {
    'family': 'sans-serif',
    'weight': 'normal',
    'size': 14,
    'colour': '#000',
  },  
  'startHats': null,
})

