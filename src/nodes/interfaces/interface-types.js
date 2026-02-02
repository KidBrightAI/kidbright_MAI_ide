import { NodeInterfaceType } from "@baklavajs/interface-types"

export const stringType = new NodeInterfaceType("string")
export const numberType = new NodeInterfaceType("number")
export const booleanType = new NodeInterfaceType("boolean")
export const modelInput = new NodeInterfaceType("modelInput")
export const modelOutput = new NodeInterfaceType("modelOutput")
export const modelLayer = new NodeInterfaceType("modelLayer")
export const tensor = new NodeInterfaceType("tensor")