
import Blockly from 'blockly/core';

const defaultBlockStyles = {
  'colour_blocks': {
    'colourPrimary': '#05427f',
  },
  'list_blocks': {
    'colourPrimary': '#d4e157',
  },
  'logic_blocks': {
    'colourPrimary': '#ffca28',
  },
  'loop_blocks': {
    'colourPrimary': '#ffa726',
  },
  'math_blocks': {
    'colourPrimary': '#ffee58',
  },

  'procedure_blocks': {
    'colourPrimary': '#590721',
  },
  'text_blocks': {
    'colourPrimary': '#058863',
  },

  'variable_blocks': {
    'colourPrimary': '#66bb6a',
  },
  'variable_dynamic_blocks': {
    'colourPrimary': '#70bf70',
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

