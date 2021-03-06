import fs from 'fs';
import { AstNode, CompositeGeneratorNode, NL, processGeneratorNode } from 'langium';
import { SimpleUIAstType, SimpleUi, JSModel, reflection, isStringExpression, Expression, isNumberExpression, isSymbolReference, isTextboxExpression, Popup, isOperation } from '../language-server/generated/ast';
import { extractDestinationAndName } from './cli-util';

export type GenerateFunctions = {
    [key in SimpleUIAstType]?:(el: AstNode, ctx:GeneratorContext)=>string|CompositeGeneratorNode
}

type GeneratorContext = {
    argumentStack: Object[][]
}

export function generateJS(model: SimpleUi, filePath: string, destination: string | undefined): string {
    const data = extractDestinationAndName(filePath, destination);
    const generatedFilePath = `${data.destination}script.js`;
    const ctx:GeneratorContext = {argumentStack:[]}

    const fileNode = new CompositeGeneratorNode();
    model.jsFunctions.forEach(el => {
        let argumentList = ''
        const parameters = el.parameters;
        parameters.forEach(el => {
            if (argumentList === '') {
                argumentList = el.name
            } else {
                argumentList = argumentList + `, ${el.name}`
            }
        })
        fileNode.append(`function ${el.name}(${argumentList}) {`, NL)
        fileNode.indent(functioncontent => {
            generateJSFunc(el.content, functioncontent, ctx)
        }) 
        fileNode.append('};', NL)
    })
    

    if (!fs.existsSync(data.destination)) {
        fs.mkdirSync(data.destination, { recursive: true });
    }
    fs.writeFileSync(generatedFilePath, processGeneratorNode(fileNode));
    return generatedFilePath;
}

const popupFunc = (popupEL: AstNode, ctx:GeneratorContext) => {
    const el = popupEL as Popup;
    if (isStringExpression(el.text) === true) {
        return `alert('${generateExpression(el.text, ctx)}')`
    } else {
        return `alert(${generateExpression(el.text, ctx)})`
    }
}

const generateJSFunctions: GenerateFunctions = {
    Popup: popupFunc,
}

function generateExpression(expression: Expression, ctx:GeneratorContext):string {
    let expressionType = expression.$type
    if (isStringExpression(expression)){
        return expression.value
    }
    else if (isNumberExpression(expression)){
        return expression.value.toString()
    }
    else if (isSymbolReference(expression)){
        return expression.symbol.ref?.name as string
    }
    else if (isTextboxExpression(expression)){
        return `(isNaN(parseInt(document.getElementById('${expression.name.ref?.name}').value)) ? document.getElementById('${expression.name.ref?.name}').value : parseInt(document.getElementById('${expression.name.ref?.name}').value))`
    }
    else if (isOperation(expression)) {
        return `${generateExpression(expression.left, ctx)} ${expression.operator} ${generateExpression(expression.right, ctx)}`
    }
    else {
        throw new Error('Unhandled Expression type: ' + expressionType)
    }
}

export function generateJSFunc(model: JSModel, bodyNode: CompositeGeneratorNode, ctx:GeneratorContext) {
    const suiTypes = reflection.getAllTypes();
    if(model.jsElements)
    {
        model.jsElements.forEach(el => {
            suiTypes.forEach(suiType => {
                const t = suiType as SimpleUIAstType;
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
}