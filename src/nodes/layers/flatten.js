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
  NodeInterface,
} from "baklavajs"

import { setType } from "@baklavajs/interface-types"
import { modelInput, modelOutput, tensor } from "../interfaces/interface-types"
import { t } from "@/plugins/i18n"

export const FlattenNode = defineNode({
  type: "Flatten",
  title: t("designer.node.flatten"),
  inputs: {        
    modelInput : () => new NodeInterface(t("designer.field.modelInputTensor")).use(setType, [modelInput, tensor]),
  },
  outputs: {
    result: () => new NodeInterface(t("designer.field.tensor")).use(setType, tensor),
  },
  calculate({ modelInput }) {
    let flatten = "torch.nn.Flatten(start_dim=1)\n"
    if (modelInput && modelInput.code) {
      flatten = modelInput.code + flatten
    }
    
    return {
      result: {
        ... modelInput,
        code : flatten,
      },    
    }
  },
})