
import Blockly from 'blockly/core';

const defaultBlockStyles = {
  'colour_blocks': {
    'colourPrimary': '#05427f',
  },
  'text_blocks': {
    'colourPrimary': '#5b67a5',
  },
  'variable_blocks': {
    'colourPrimary': '#745ba5',
  },
  'variable_dynamic_blocks': {
    'colourPrimary': '#70bf70',
  },
  'list_blocks': {
    'colourPrimary': '#995ba5',
  },
  'math_blocks': {
    'colourPrimary': '#a55b80',
  },
  'logic_blocks': {
    'colourPrimary': '#a55b5b',
  },
  'loop_blocks': {
    'colourPrimary': '#a56d5b',
  },
  'procedure_blocks': {
    'colourPrimary': '#590721',
  },
  
};

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
});

