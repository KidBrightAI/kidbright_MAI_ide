import Blockly from "blockly";
export default class CustomCategory extends Blockly.ToolboxCategory {
  constructor(categoryDef, toolbox, opt_parent) {
    super(categoryDef, toolbox, opt_parent);
  }
  addColourBorder_(colour){
    var labelDom = this.rowDiv_.getElementsByClassName('blocklyTreeLabel')[0];
    this.rowDiv_.style.backgroundColor = colour;
    labelDom.style.color = 'white';
  }
  setSelected(isSelected){
    // We do not store the label span on the category, so use getElementsByClassName.
    var labelDom = this.rowDiv_.getElementsByClassName('blocklyTreeLabel')[0];
    if (isSelected) {
      // Change the background color of the div to white.
      this.rowDiv_.style.backgroundColor = "white"; // this.colour_;
      // Set the colour of the text to the colour of the category.
      //labelDom.style.color = this.colour_;
      labelDom.style.color = this.colour_;
      this.iconDom_.style.color = this.colour_;
    } else {
      // Set the background back to the original colour.
      this.rowDiv_.style.backgroundColor = this.colour_; //'';
      // Set the text back to white.
      labelDom.style.color = 'white';
      this.iconDom_.style.color = 'white';
    }
    // This is used for accessibility purposes.
    Blockly.utils.aria.setState(/** @type {!Element} */ (this.htmlDiv_),
        Blockly.utils.aria.State.SELECTED, isSelected);
  }
  createIconDom_() {
    const iconImg = document.createElement('img');
    iconImg.src = this.toolboxItemDef_.icon;
    iconImg.alt = 'Blockly Logo';
    iconImg.width = '50';
    iconImg.height = '50';
    iconImg.style.padding = '5px';
    iconImg.style.marginLeft = '5px';
    //iconImg.style.backgroundColor = this.toolboxItemDef_.colour;
    //iconImg.style.borderRadius = '10px';
    //iconImg.style.marginRight = '5px';
    return iconImg;
  }
}
