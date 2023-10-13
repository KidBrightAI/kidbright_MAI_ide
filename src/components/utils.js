import Blockly from "blockly";

export function randomId(count = 7) {
    return Math.random().toString(36).substring(0,count);
}
export function getColorIndex(ind) {
    let colors = [
        "#3D642D",
        "#CF3476",
        "#FAD201",
        "#633A34",
        "#606E8C",
        "#826C34",
        "#063971",
        "#316650",
        "#FFA420",
        "#015D52",
        "#EA899A",
        "#7FB5B5",
        "#AEA04B",
        "#6C4675",
        "#C2B078",
        "#587246",
        "#45322E",
    ];
    //return colors[(Math.random() * colors.length) | 0];
    if (ind >= colors.length) {
        ind = 0;
    }
    return colors[ind];
}
export function addAlpha(color, opacity) {
    const _opacity = Math.round(Math.min(Math.max(opacity || 1, 0), 1) * 255);
    return color + _opacity.toString(16).toUpperCase();
}

export let updateBlockCategory = (toolboxTree, rootPath='') => {
    let toolboxTextXML = ``;
    // blockTree
    for (let category of toolboxTree) {
        let actualRootPath = rootPath || category.path || '';
        toolboxTextXML += `<category name="${category.name}" icon="${actualRootPath}${category.icon}" colour="${category.color}"${typeof category.blocks === "string" ? ` custom="${category.blocks}"` : ''}>`;
        if (typeof category.blocks === "object") {
            for (let block of category.blocks) {
                if (typeof block === "object") {
                    toolboxTextXML += block.xml;
                } else {
                    if (typeof Blockly.Blocks[block] !== "undefined") {
                        if (typeof Blockly.Blocks[block].xml !== "undefined") {
                            toolboxTextXML += Blockly.Blocks[block].xml;
                        } else {
                            toolboxTextXML += `<block type="${block}"></block>`;
                        }
                    } else {
                        console.warn(block, "undefined, forget add blocks_xxx.js ?");
                    }
                }
            }
        } else if (typeof category.blocks === "function") {
            let xmlList = category.blocks(blocklyWorkspace);
            for (let xml of xmlList) {
                toolboxTextXML += Blockly.Xml.domToText(xml);
            }
        }
        toolboxTextXML += `</category>`;
    }
  return toolboxTextXML;
    // Extenstion
    // extenstionTree = [];
    // for (const extensionId of fs.ls("/extension")) {
    //     let extension = fs.read(`/extension/${extensionId}/extension.js`);
    //     extension = eval(extension);
    //     extenstionTree.push(extension);
    //     categoryIconList.push(fs.read(`/extension/${extensionId}/${extension.icon}`));
    // }
    // if (isElectron) {
    //     let extensionDir = sharedObj.extensionDir;
    //     for (const extensionId of nodeFS.ls(extensionDir)) {
    //         let extension = await readFileAsync(`${extensionDir}/${extensionId}/extension.js`);
    //         extension = extension.toString();
    //         extension = eval(extension);
    //         extenstionTree.push(extension);
    //         categoryIconList.push(`${extensionDir}/${extensionId}/${extension.icon}`);
    //     }
    // }
    // for (let category of extenstionTree) {
    //     toolboxTextXML += `<category name="${category.name}" colour="${category.color}"${typeof category.blocks === "string" ? ` custom="${category.blocks}"` : ''}>`;
    //     if (typeof category.blocks === "object") {
    //         for (let block of category.blocks) {
    //             if (typeof block === "object") {
    //                 toolboxTextXML += block.xml;
    //             } else {
    //                 if (typeof Blockly.Blocks[block] !== "undefined") {
    //                     if (typeof Blockly.Blocks[block].xml !== "undefined") {
    //                         toolboxTextXML += Blockly.Blocks[block].xml;
    //                     } else {
    //                         toolboxTextXML += `<block type="${block}"></block>`;
    //                     }
    //                 } else {
    //                     console.warn(block, "undefined, forget add blocks_xxx.js ?");
    //                 }
    //             }
    //         }
    //     } else if (typeof category.blocks === "function") {
    //         let xmlList = category.blocks(blocklyWorkspace);
    //         for (let xml of xmlList) {
    //             toolboxTextXML += Blockly.Xml.domToText(xml);
    //         }
    //     }
    //     toolboxTextXML += `</category>`;
    // }

    toolboxTextXML += `</xml>`;
};
