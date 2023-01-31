import fs from 'fs';
import { AstNode, CompositeGeneratorNode, NL, toString } from 'langium';
import { SimpleUiAstType, SimpleUi, JSModel, reflection, isStringExpression, Expression, isNumberExpression, isSymbolReference, isTextboxExpression, Popup, isOperation } from '../language-server/generated/ast';
import { extractDestinationAndName } from './cli-util';

type SimpleUiAstTypeAlt = keyof SimpleUiAstType

export type GenerateFunctions = {
    [key in SimpleUiAstTypeAlt]:(el: AstNode, ctx:GeneratorContext)=>string|CompositeGeneratorNode
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
    fs.writeFileSync(generatedFilePath, toString(fileNode));
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
    BodyElement: function (el: AstNode, ctx: GeneratorContext): string | CompositeGeneratorNode {
        throw new Error('Function not implemented.');
    },
    Button: function (el: AstNode, ctx: GeneratorContext): string | CompositeGeneratorNode {
        throw new Error('Function not implemented.');
    },
    CSSClasses: function (el: AstNode, ctx: GeneratorContext): string | CompositeGeneratorNode {
        throw new Error('Function not implemented.');
    },
    CSSProperty: function (el: AstNode, ctx: GeneratorContext): string | CompositeGeneratorNode {
        throw new Error('Function not implemented.');
    },
    Component: function (el: AstNode, ctx: GeneratorContext): string | CompositeGeneratorNode {
        throw new Error('Function not implemented.');
    },
    Div: function (el: AstNode, ctx: GeneratorContext): string | CompositeGeneratorNode {
        throw new Error('Function not implemented.');
    },
    Expression: function (el: AstNode, ctx: GeneratorContext): string | CompositeGeneratorNode {
        throw new Error('Function not implemented.');
    },
    Footer: function (el: AstNode, ctx: GeneratorContext): string | CompositeGeneratorNode {
        throw new Error('Function not implemented.');
    },
    HeadElement: function (el: AstNode, ctx: GeneratorContext): string | CompositeGeneratorNode {
        throw new Error('Function not implemented.');
    },
    Heading: function (el: AstNode, ctx: GeneratorContext): string | CompositeGeneratorNode {
        throw new Error('Function not implemented.');
    },
    Icon: function (el: AstNode, ctx: GeneratorContext): string | CompositeGeneratorNode {
        throw new Error('Function not implemented.');
    },
    Image: function (el: AstNode, ctx: GeneratorContext): string | CompositeGeneratorNode {
        throw new Error('Function not implemented.');
    },
    InlineCSS: function (el: AstNode, ctx: GeneratorContext): string | CompositeGeneratorNode {
        throw new Error('Function not implemented.');
    },
    JSElements: function (el: AstNode, ctx: GeneratorContext): string | CompositeGeneratorNode {
        throw new Error('Function not implemented.');
    },
    JSFunction: function (el: AstNode, ctx: GeneratorContext): string | CompositeGeneratorNode {
        throw new Error('Function not implemented.');
    },
    JSModel: function (el: AstNode, ctx: GeneratorContext): string | CompositeGeneratorNode {
        throw new Error('Function not implemented.');
    },
    Linebreak: function (el: AstNode, ctx: GeneratorContext): string | CompositeGeneratorNode {
        throw new Error('Function not implemented.');
    },
    Link: function (el: AstNode, ctx: GeneratorContext): string | CompositeGeneratorNode {
        throw new Error('Function not implemented.');
    },
    NestingElement: function (el: AstNode, ctx: GeneratorContext): string | CompositeGeneratorNode {
        throw new Error('Function not implemented.');
    },
    NumberExpression: function (el: AstNode, ctx: GeneratorContext): string | CompositeGeneratorNode {
        throw new Error('Function not implemented.');
    },
    Operation: function (el: AstNode, ctx: GeneratorContext): string | CompositeGeneratorNode {
        throw new Error('Function not implemented.');
    },
    Paragraph: function (el: AstNode, ctx: GeneratorContext): string | CompositeGeneratorNode {
        throw new Error('Function not implemented.');
    },
    Parameter: function (el: AstNode, ctx: GeneratorContext): string | CompositeGeneratorNode {
        throw new Error('Function not implemented.');
    },
    Section: function (el: AstNode, ctx: GeneratorContext): string | CompositeGeneratorNode {
        throw new Error('Function not implemented.');
    },
    SimpleExpression: function (el: AstNode, ctx: GeneratorContext): string | CompositeGeneratorNode {
        throw new Error('Function not implemented.');
    },
    SimpleUi: function (el: AstNode, ctx: GeneratorContext): string | CompositeGeneratorNode {
        throw new Error('Function not implemented.');
    },
    SingleElement: function (el: AstNode, ctx: GeneratorContext): string | CompositeGeneratorNode {
        throw new Error('Function not implemented.');
    },
    StringExpression: function (el: AstNode, ctx: GeneratorContext): string | CompositeGeneratorNode {
        throw new Error('Function not implemented.');
    },
    SymbolReference: function (el: AstNode, ctx: GeneratorContext): string | CompositeGeneratorNode {
        throw new Error('Function not implemented.');
    },
    Textbox: function (el: AstNode, ctx: GeneratorContext): string | CompositeGeneratorNode {
        throw new Error('Function not implemented.');
    },
    TextboxExpression: function (el: AstNode, ctx: GeneratorContext): string | CompositeGeneratorNode {
        throw new Error('Function not implemented.');
    },
    Title: function (el: AstNode, ctx: GeneratorContext): string | CompositeGeneratorNode {
        throw new Error('Function not implemented.');
    },
    Topbar: function (el: AstNode, ctx: GeneratorContext): string | CompositeGeneratorNode {
        throw new Error('Function not implemented.');
    },
    UseComponent: function (el: AstNode, ctx: GeneratorContext): string | CompositeGeneratorNode {
        throw new Error('Function not implemented.');
    }
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
                const t = suiType as SimpleUiAstTypeAlt;
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