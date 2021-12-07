import fs from 'fs';
import { AstNode, CompositeGeneratorNode, NL, processGeneratorNode } from 'langium';
import { JSFunction, Popup, SimpleUi, SimpleUiAstType, reflection, Variable, isStringExpression, isNumberExpression, isSymbolReference, Expression } from '../language-server/generated/ast';
import { extractDestinationAndName } from './cli-util';

export type GenerateFunctions = {
    [key in SimpleUiAstType]?:(el: AstNode, ctx:GeneratorContext)=>string|CompositeGeneratorNode
}

type GeneratorContext = {
    argumentStack: Object[][]
}

export function generateJS(model: SimpleUi, filePath: string, destination: string | undefined): string {
    const data = extractDestinationAndName(filePath, destination);
    const generatedFilePath = `${data.destination}script.js`;
    const ctx:GeneratorContext = {argumentStack:[]}

    const fileNode = new CompositeGeneratorNode();
    generateJSFunc(model, fileNode, ctx)

    if (!fs.existsSync(data.destination)) {
        fs.mkdirSync(data.destination, { recursive: true });
    }
    fs.writeFileSync(generatedFilePath, processGeneratorNode(fileNode));
    return generatedFilePath;
}

const popupFunc = (popupEL: AstNode, ctx:GeneratorContext) => {
    const el = popupEL as Popup;
    return `alert('${generateExpression(el.text, ctx)}')`
}

const functionFunc = (functionEL: AstNode, ctx:GeneratorContext) => {
    const el = functionEL as JSFunction;
    const fileNode = new CompositeGeneratorNode()
    fileNode.append(`function ${el.name}() {`, NL);
    fileNode.indent(functioncontent => {
        generateJSFunc(el.content, functioncontent, ctx);
    });
    fileNode.append('}', NL);
    return fileNode
}

const varFunc = (varEL: AstNode, ctx:GeneratorContext) => {
    const el = varEL as Variable;
    if (typeof el.varvalue[0].value === 'number') {
        return `const ${el.name} = ${el.varvalue[0].value}`
    }
    else {
        return `const ${el.name} = '${el.varvalue[0].value}'`
    }
}

export const generateJSFunctions: GenerateFunctions = {
    Popup: popupFunc,
    JSFunction: functionFunc,
    Variable: varFunc
}

function generateExpression(expression: Expression, ctx:GeneratorContext):string {
    if (isStringExpression(expression)){
        return expression.value
    }
    else if (isNumberExpression(expression)){
        return expression.value.toString()
    }
    else if (isSymbolReference(expression)){
        let value = ''
        ctx.argumentStack[0].forEach(function (el) {
            if ((el as any).name === expression.symbol.ref?.name) {
                value = (el as any).value 
            }
        })
        return value
    }
    else {
        throw new Error ('Unhandled Expression type: ' + expression.$type)
    }
}

export function generateJSFunc(model: SimpleUi, bodyNode: CompositeGeneratorNode, ctx:GeneratorContext) {
    const suiTypes = reflection.getAllTypes();
    model.jselements.forEach(el => {
        suiTypes.forEach(suiType => {
            const t = suiType as SimpleUiAstType;
            const isInstance = reflection.isInstance(el, t);
            if (isInstance) {
                const func = generateJSFunctions[t];
                if (func) {
                    const content = func(el, ctx);
                    bodyNode.append(content, NL);
                }
            }
        })
    })
}
