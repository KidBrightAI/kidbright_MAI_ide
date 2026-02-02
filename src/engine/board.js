import Blockly from 'blockly'
import "blockly/blocks_compressed.js"
import python, { pythonGenerator } from 'blockly/python'
import "blockly/python_compressed.js"
import { useWorkspaceStore } from '@/store/workspace'

export async function loadBoard(board) {
  // load scripts
  const workspaceStore = useWorkspaceStore()
  let scripts = [...board.blocks || []]
  for (const script of scripts) {
    let scriptUrl = `${board.path}/${script}`
    let scriptResponse = await fetch(scriptUrl)
    if(scriptResponse.ok){
      let scriptData = await scriptResponse.text()
      eval(scriptData, python, pythonGenerator, Blockly, workspaceStore)
    }
  }
}

export async function loadPlugin(plugins) {
  for(let plugin of plugins) {
    if(!plugin.blockFiles){
      continue
    }    
    for (const blockFilePath of plugin.blockFiles) {      
      let blockResponse = await fetch(blockFilePath)
      if(blockResponse.ok){
        let blockData = await blockResponse.text()
        eval(blockData, python, pythonGenerator, Blockly)
      }
    }
  }
}

export async function parseExamples(examples){
  let parsedExamples = []
  for (const example in examples) {
    let contentResponse = await fetch(example)
    let contentData = await contentResponse.text()
    let parsedExample = {
      content: contentData,
      block: null,
      code: null,
      name: '',
    }    

    // parse from path before readme.md
    let name = example.match(/\/examples\/(.*)\/readme.md/)    
    if(name){
      parsedExample.name = name[1]
    }
    let blockUrl = example.replace('readme.md', 'workspace.json')
    let blockResponse = await fetch(blockUrl)
    if(blockResponse.ok){
      parsedExample.block = await blockResponse.text()
    }

    let codeUrl = example.replace('readme.md', 'main.py')
    let codeResponse = await fetch(codeUrl)
    if(codeResponse.ok){
      parsedExample.code = await codeResponse.text()
    }
    parsedExamples.push(parsedExample)
  }
  
  return parsedExamples
}
