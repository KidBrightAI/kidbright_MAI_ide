/*export default {
  name: "MaxPooling2D",
  input: [
    {
      name: "input",
      accept: ["tensor"],
    },
  ],
  output: [
    {
      name: "output",
      type: "tensor",
    },
  ],
  options: [
    {
      name: "pool_size",
      description:
        "Integer of window size over which to take the maximum. (2, 2) will take the max value over a 2x2 pooling window",
      type: "number",
      default: 2,
    },
    {
      name: "strides",
      description:
        "[N x N] An integer or tuple/list of 2 integers, specifying the strides of the convolution along the height and width",
      type: "number",
      default: 1,
    },
    {
      name: "padding",
      description:
        '"valid" means no padding. "same" results in padding with zeros evenly to the left/right or up/down of the input. When padding="same" and strides=1, the output has the same size as the input',
      type: "string",
      options: ["valid", "same"],
      default: "same",
    },
  ],
  generator: (n) => {
    return "torch.nn.MaxPool2d(kernel_size=" + n.options.pool_size + ", stride=" + n.options.strides + ", padding=" + n.options.padding + ")";
  },
};*/

import {
  defineNode,
  NumberInterface,
  IntegerInterface,
  SelectInterface,
  NodeInterface
} from "baklavajs";

import { setType } from "@baklavajs/interface-types";
import { modelInput, modelOutput, tensor } from "../interfaces/interface-types";

export const MaxPooling2DNode = defineNode({
  type: "MaxPooling2D",
  title: "Max Pooling Layer",
  inputs: {        
    modelInput : () => new NodeInterface("Model Input | Tensor").use(setType, [modelInput, tensor]),
    pool_size : () => new IntegerInterface("Pool Size", 2).setPort(false),
    strides : () => new IntegerInterface("Strides", 1).setPort(false),
    padding : () => new IntegerInterface("Padding", 0).setPort(false),
  },
  outputs: {
    result: () => new NodeInterface("Tensor").use(setType, tensor)
  },
  calculate({ modelInput, pool_size, strides, padding }) {
    let maxpool = "torch.nn.MaxPool2d(kernel_size=" + pool_size + ", stride=" + strides + ", padding=" + padding + ")\n";
    if (modelInput && modelInput.code) {
      maxpool = modelInput.code + maxpool;
    }
    return {
      result: {
        ... modelInput,
        code : maxpool,
      }    
    }
  }
});