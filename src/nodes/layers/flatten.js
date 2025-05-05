/*export default {
  name: "Flatten",
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
  generator: (n) => {
    return "torch.flatten(" + n.input[0].name + ", start_dim=1)";
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

export const FlattenNode = defineNode({
  type: "Flatten",
  title: "Flatten Layer",
  inputs: {        
    modelInput : () => new NodeInterface("Model Input | Tensor").use(setType, [modelInput, tensor]),
  },
  outputs: {
    result: () => new NodeInterface("Tensor").use(setType, tensor)
  },
  calculate({ modelInput }) {
    let flatten = "torch.flatten(" + modelInput.code + ", start_dim=1)";
    return {
      result: {
        ... modelInput,
        code : flatten,
      }    
    }
  }
});