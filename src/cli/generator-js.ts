import fs from 'fs';
import { AstNode, CompositeGeneratorNode, NL, processGeneratorNode } from 'langium';
import { JSFunction, Popup, SimpleUi, SimpleUiAstType, reflection, Variable } from '../language-server/generated/ast';
import { extractDestinationAndName } from './cli-util';

export type GenerateFunctions = {
    [key in SimpleUiAstType]?:(el: AstNode)=>string|CompositeGeneratorNode
}

export function generateJS(model: SimpleUi, filePath: string, destination: string | undefined): string {
    const data = extractDestinationAndName(filePath, destination);
    const generatedFilePath = `${data.destination}script.js`;

    const fileNode = new CompositeGeneratorNode();
    generateJSFunc(model, fileNode)

    if (!fs.existsSync(data.destination)) {
        fs.mkdirSync(data.destination, { recursive: true });
    }
    fs.writeFileSync(generatedFilePath, processGeneratorNode(fileNode));
    return generatedFilePath;
}

const popupFunc = (popupEL: AstNode) => {
    const el = popupEL as Popup;
    return `alert('${el.text}')`
}

const functionFunc = (functionEL: AstNode) => {
    const el = functionEL as JSFunction;
    const fileNode = new CompositeGeneratorNode()
    fileNode.append(`function ${el.functionname}() {`, NL);
    fileNode.indent(functioncontent => {
        generateJSFunc(el.content, functioncontent);
    });
    fileNode.append('}', NL);
    return fileNode
}

const varFunc = (varEL: AstNode) => {
    const el = varEL as Variable;
    if (typeof el.varvalue[0].value === 'number') {
        return `const ${el.varname} = ${el.varvalue[0].value}`
    }
    else {
        return `const ${el.varname} = '${el.varvalue[0].value}'`
    }
    return ''
}

export const generateJSFunctions: GenerateFunctions = {
    Popup: popupFunc,
    JSFunction: functionFunc,
    Variable: varFunc
}


export function generateJSFunc(model: SimpleUi, bodyNode: CompositeGeneratorNode) {
    const suiTypes = reflection.getAllTypes();
    model.jselements.forEach(el => {
        suiTypes.forEach(suiType => {
            const t = suiType as SimpleUiAstType;
            const isInstance = reflection.isInstance(el, t);
            if (isInstance) {
                const func = generateJSFunctions[t];
                if (func) {
                    const content = func(el);
                    bodyNode.append(content, NL);
                }
            }
        })
    })
}
