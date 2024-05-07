import Blockly from "blockly";
export default class CustomTrashcan extends Blockly.Trashcan {
  constructor(workspace) {
    super(workspace);
  }  
  position(metric, savedPositions) {
    super.position(metric, savedPositions);
    //add padding to the trashcan
    this.top = this.top - 40;
    this.svgGroup?.setAttribute(
      'transform',
      'translate(' + this.left + ',' + this.top + ')',
    );
  }
}
