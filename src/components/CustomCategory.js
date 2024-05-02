import Blockly from "blockly";
export default class CustomCategory extends Blockly.ToolboxCategory {
  constructor(categoryDef, toolbox, opt_parent) {
    super(categoryDef, toolbox, opt_parent);
  }
  addColourBorder_(colour){
    var labelDom = this.rowDiv_.getElementsByClassName('blocklyTreeLabel')[0];
    this.rowDiv_.style.backgroundColor = "#E9E9E9";
    labelDom.style.color = colour;
  }
  setSelected(isSelected){
    // We do not store the label span on the category, so use getElementsByClassName.
    var labelDom = this.rowDiv_.getElementsByClassName('blocklyTreeLabel')[0];
    if (isSelected) {      
      // this.rowDiv_.style.backgroundColor = "white"; // this.colour_;
      // labelDom.style.color = this.colour_;
      // this.iconDom_.style.color = this.colour_;
      this.rowDiv_.style.backgroundColor = "#E9E9E9"; // this.colour_;
      labelDom.style.color = this.colour_;
      this.iconDom_.style.color = this.colour_;
      // add left and right border to the selected category
      this.rowDiv_.style.borderLeft = '8px solid ' + this.colour_;
      this.rowDiv_.style.borderRight = '8px solid ' + this.colour_;

    } else {
      this.rowDiv_.style.borderLeft = 'none';
      this.rowDiv_.style.borderRight = 'none';

      this.rowDiv_.style.backgroundColor = "#E9E9E9";
      labelDom.style.color = this.colour_;
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
