import fs from 'fs';
import { AstNode, CompositeGeneratorNode, NL, processGeneratorNode } from 'langium';
import { integer } from 'vscode-languageserver-types';
import { BodyElement, Button, Component, CSSProperty, Div, Expression, Footer, HeadElement, Heading, Icon, Image, isNumberExpression, isOperation, isStringExpression, isSymbolReference, Link, Paragraph, Parameter, reflection, Section, SimpleExpression, SimpleUi, SimpleUIAstType, Textbox, Title, Topbar, UseComponent } from '../language-server/generated/ast';
import { extractDestinationAndName } from './cli-util';
import { copyCSSClass } from './generator-css';

export type GenerateFunctions = {
    [key in SimpleUIAstType]?: (el: AstNode, ctx: GeneratorContext) => string | CompositeGeneratorNode
}

type GeneratorContext = {
    argumentStack: Object[][]
}

export function generateHTML(model: SimpleUi, filePath: string, destination: string | undefined): string {
    const data = extractDestinationAndName(filePath, destination);
    const generatedFilePath = `${data.destination}index.html`;
    const ctx: GeneratorContext = { argumentStack: [] }
    const fileNode = new CompositeGeneratorNode();
    fileNode.append('<!DOCTYPE html>', NL);
    fileNode.append('<html>', NL);
    fileNode.indent(head => {
        head.append('<head>', NL);
        head.indent(headContent => {
            generateHead(model.headElements, headContent, ctx);
            headContent.append('<link rel="stylesheet" href="stylesheet.css">', NL);
            headContent.append('<script src="script.js"></script>', NL)
        });
        head.append('</head>', NL);
    });
    fileNode.indent(body => {
        body.append('<body>', NL);
        body.indent(bodyContent => {
            generateBody(model.bodyElements, bodyContent, ctx);
        });
        body.append('</body>', NL);
    });
    fileNode.append('</html>', NL);

    if (!fs.existsSync(data.destination)) {
        fs.mkdirSync(data.destination, { recursive: true });
    }
    fs.writeFileSync(generatedFilePath, processGeneratorNode(fileNode));
    return generatedFilePath;
}

//#region Head Generation

// Check for Type and call head functions
function generateHead(elements: HeadElement[], bodyNode: CompositeGeneratorNode, ctx: GeneratorContext) {
    elements.forEach(el => {
        const content = generateHeadFunctions(el);
        if(content)
        {
            bodyNode.append(content, NL);
        }
    })
}

// Head functions
function generateHeadFunctions(element: HeadElement): string {
    switch(element.$type+'test'){
        case 'Title':
            return titleFunc(element as Title);
        case 'Icon':
            return iconFunc(element as Icon);
        default:
            return '';
    }
};

function titleFunc(element: Title) {
    return `<title>${generateExpression(element.text)}</title>`;
}

function iconFunc(element: Icon) {
    return `<link rel="icon" href="${generateExpression(element.iconPath)}">`;
}

//#endregion

//#region Body Generation

// Check for Type and call body functions
function generateBody(elements: BodyElement[], bodyNode: CompositeGeneratorNode, ctx: GeneratorContext) {
    elements.forEach(el => {
        // suiTypes.forEach(suiType => {
        //     const t = suiType as SimpleUIAstType;
        //     const isInstance = reflection.isInstance(el, t);
        //     if (isInstance) {
        //         const func = generateBodyFunctions[t];
        //         if (func) {
        //             const content = func(el, ctx);
        //             bodyNode.append(content, NL);
        //         }
        //     }
        // })
        console.log(el.$type);
        //const content = generateBodyFunctions(el);

    })
}

//#endregion

// Body generate functions
const sectionFunc = (sectionEl: AstNode, ctx: GeneratorContext) => {
    const el = sectionEl as Section;
    const fileNode = new CompositeGeneratorNode();
    fileNode.append(`<section id="${el.name}" ${formatCSS(generateCSSClasses(el.classes),'')}>`,NL);
    fileNode.indent(sectionContent => {
        generateBody(el.content,sectionContent,ctx)
    });
    fileNode.append('</section>');
    return fileNode;
}

const divFunc = (divEl: AstNode, ctx: GeneratorContext) => {
    const el = divEl as Div;
    const fileNode = new CompositeGeneratorNode()
    fileNode.append(`<div ${formatCSS(generateCSSClasses(el.classes), generateInlineCSS(el.styles,ctx))}>`, NL)
    fileNode.indent(divContent => {
        generateBody(el.content, divContent, ctx)
    });
    fileNode.append('</div>')
    return fileNode
};

const paragraphFunc = (paragraphEl: AstNode, ctx: GeneratorContext) => {
    const el = paragraphEl as Paragraph;
    return `<p ${formatCSS(generateCSSClasses(el.classes), generateInlineCSS(el.styles,ctx))}>${generateExpression(el.text)}</p>`;
};

const buttonFunc = (buttonEL: AstNode, ctx: GeneratorContext) => {
    const el = buttonEL as Button;
    if (typeof el.onclickaction === 'undefined') {
        return `<button ${formatCSS(generateCSSClasses(el.classes), generateInlineCSS(el.styles,ctx))}>${generateExpression(el.buttonText)}</button>`;
    }
    else {
        return `<button onclick='${el.onclickaction.ref?.name}(${generateParameters(el.arguments, ctx)})' ${formatCSS(generateCSSClasses(el.classes), generateInlineCSS(el.styles,ctx))}>${generateExpression(el.buttonText)}</button>`;
    };
};

const linkFunc = (linkEL: AstNode, ctx: GeneratorContext) => {
    const el = linkEL as Link;
    if (typeof el.linkText === 'undefined') {
        return `<a href='${generateExpression(el.linkUrl)}' ${formatCSS(generateCSSClasses(el.classes), generateInlineCSS(el.styles,ctx))}>${generateExpression(el.linkUrl)}</a>`;
    }
    else {
        return `<a href='${generateExpression(el.linkUrl)}' ${formatCSS(generateCSSClasses(el.classes), generateInlineCSS(el.styles,ctx))}>${generateExpression(el.linkUrl)}</a>`;
    };
};

const textboxFunc = (textboxEL: AstNode, ctx: GeneratorContext) => {
    const el = textboxEL as Textbox;
    const fileNode = new CompositeGeneratorNode()
    const labelOrder = []

    if (typeof el.placeholderText === 'undefined') {
        labelOrder.push(`<input type='text' id='${el.name}' ${formatCSS(generateCSSClasses(el.classes), generateInlineCSS(el.styles, ctx))}>`);
    }
    else {
        labelOrder.push(`<input type='text' id='${el.name}' placeholder='${generateExpression(el.placeholderText)}' ${formatCSS(generateCSSClasses(el.classes), generateInlineCSS(el.styles, ctx))}>`);
    };
    if (typeof el.labelText !== 'undefined' && !el.labelAfter) {
        labelOrder.unshift(`<label for='${el.name}'>${generateExpression(el.labelText)}</label>`, NL);
    } 
    else if (typeof el.labelText !== 'undefined' && el.labelAfter){
        labelOrder.push(NL,`<label for='${el.name}'>${generateExpression(el.labelText)}</label>`);
    }
    labelOrder.map(el => {
        fileNode.append(el)
    })
    return fileNode
};

const linebreakFunc = (linebreakEL: AstNode, ctx: GeneratorContext) => {
    return '<br>';
};

const imageFunc = (imageEL: AstNode, ctx: GeneratorContext) => {
    const el = imageEL as Image;
    return `<img src='${generateExpression(el.imagePath)}' alt='${el.altText !== undefined ? el.altText : ''}' ${formatCSS(generateCSSClasses(el.classes), generateInlineCSS(el.styles,ctx))}>`
}

const headingFunc = (headingEL: AstNode, ctx: GeneratorContext) => {
    const el = headingEL as Heading;
    return `<h${el.level} ${formatCSS(generateCSSClasses(el.classes), generateInlineCSS(el.styles,ctx))}>${generateExpression(el.text)}</h${el.level}>`
}

const useComponentFunc = (UseComponentEL: AstNode, ctx: GeneratorContext) => {
    const el = UseComponentEL as UseComponent;
    const componentNode = new CompositeGeneratorNode()
    const refContent = el.component.ref?.content as SimpleUi
    const refParameters = (refContent.$container as Component).parameters;
    const argumentList = refParameters.map(function (refEl: Parameter, index: integer) {
        return ({ name: refEl.name, type: refEl.type, value: generateExpression(el.arguments[index]) })
    })
    ctx.argumentStack.push(argumentList)
    generateComponent(refContent, componentNode, ctx)
    ctx.argumentStack.pop()
    return componentNode
}

const topbarFunc = (TopbarEl: AstNode, ctx: GeneratorContext) => {
    const el = TopbarEl as Topbar;
    const topbarNode = new CompositeGeneratorNode();
    copyCSSClass('topbar');
    topbarNode.append(`<header class='topbar ${el.fixed?'topbar--fixed':''}' class='${generateCSSClasses(el.classes)}' style='${generateInlineCSS(el.styles,ctx)}'>`,NL);
    topbarNode.indent(topbarContent => {
        topbarContent.append(`<nav>`,NL);
        topbarContent.indent(navigationContent => {
            navigationContent.append(`<a style='${generateInlineCSS(el.styles,ctx)}' href='./'>${generateExpression(el.value)}</a>`,NL)
        });
        topbarContent.append(`</nav>`,NL);
    })
    topbarNode.append(`</header>`);
    return topbarNode
}

const footerFunc = (FooterEl: AstNode, ctx:GeneratorContext) => {
    const el = FooterEl as Footer;
    const footerNode = new CompositeGeneratorNode()

    footerNode.append(`<footer class='footer' style='${generateInlineCSS(el.styles,ctx)}'>`, NL);
    footerNode.indent(footerContent => {
        footerContent.append(`<p style='${generateInlineCSS(el.styles,ctx)}'>${generateExpression(el.value)}</p>`,NL)
    })
    footerNode.append(`</footer>`);
    return footerNode
}

// Redirect to generator function by Type

// Head functions
// export const generateHeadFunctions: GenerateFunctions = {
//     Title: titleFunc,
//     Icon: iconFunc
// };

// Body functions
export const generateBodyFunctions: GenerateFunctions = {
    Div: divFunc,
    Paragraph: paragraphFunc,
    Button: buttonFunc,
    Link: linkFunc,
    Textbox: textboxFunc,
    Linebreak: linebreakFunc,
    Image: imageFunc,
    Heading: headingFunc,
    UseComponent: useComponentFunc,
    Topbar: topbarFunc,
    Section: sectionFunc,
    Footer: footerFunc
};

function generateExpression(expression: Expression | SimpleExpression): string | number {
    if (isStringExpression(expression)) {
        return encodeHtml(expression.value);
    }
    else if (isNumberExpression(expression)) {
        return expression.value
    }
    else if (isSymbolReference(expression)) {
        let value = ''
        return value
    }
    else if (isOperation(expression)) {
        let result, left, right
        if (isStringExpression(expression.left) || typeof (generateExpression(expression.left)) === 'string') {
            left = `'${generateExpression(expression.left)}'`
        } else {
            left = generateExpression(expression.left)
        }
        if (isStringExpression(expression.right) || typeof (generateExpression(expression.right)) === 'string') {
            right = `'${generateExpression(expression.right)}'`
        } else {
            right = generateExpression(expression.right)
        }
        if ((typeof (left) === 'string' || typeof (right) === 'string') && (expression.operator == '*' || expression.operator == '-' || expression.operator == '/')) {
            throw new Error(`Invalid Operation: (${left} ${expression.operator} ${right})`)
        } else {
            result = eval(left + expression.operator + right)
            return (result)
        }
    }
    else {
        throw new Error('Unhandled Expression type: ' + expression.$type)
    }
}

/**
 * encode html entities and replace linebreaks with <br>
 * @param input
 * @returns encoded html string
 */
function encodeHtml(input: string): string {
    // https://stackoverflow.com/questions/18749591/encode-html-entities-in-javascript
    let encodedString = input.replace(/[\u00A0-\u9999<>\&]/g, function(i) {
        return '&#'+i.charCodeAt(0)+';';
    });
    return encodedString.replace(/(\r\n|\n|\r)/gm, '<br>');
}
function generateParameters(expression: Expression[], ctx: GeneratorContext): string {
    let result = ''
    expression.forEach(el => {
        let currentExpression = ''
        if (isNumberExpression(el) === true) {
            currentExpression = `${generateExpression(el)}`
        } else {
            currentExpression = `"${generateExpression(el)}"`
        }
        if (result === '') {
            result = currentExpression
        } else {
            result = `${result}, ${currentExpression}`
        }
    })
    return result
}

function formatCSS(classes: string, inline: string): string {
    let classString = classes ? `class='${classes}' ` : '';
    let inlineString = inline ? `style='${inline}'` : '';
    return classString + inlineString;
}
function generateCSSClasses(element: string[]): string {
    if(element == undefined) return '';
    element.forEach(el => {
        copyCSSClass(el);
    });
    return element.join(" ");;
}
function generateInlineCSS(element: CSSProperty[], ctx: GeneratorContext): string {
    let cssString = ''
    element.forEach(cssel => {
        switch (cssel.property){
            case 'text-color':
                cssString += `color:${generateExpression(cssel.value)}; `
                break;
            case 'font-size':
                cssString += `font-size:${generateExpression(cssel.value)}; `
                break;
            case 'height':
                cssString += `height:${generateExpression(cssel.value)}; `
                break;
            case 'width':
                cssString += `width:${generateExpression(cssel.value)}; `
                break
            case 'background-color':
                cssString += `background-color: ${generateExpression(cssel.value)}; `
                break
        }
    })
    return cssString;
}





// Check for Type and call body functions
export function generateComponent(model: SimpleUi, bodyNode: CompositeGeneratorNode, ctx: GeneratorContext) {
    const suiTypes = reflection.getAllTypes();
    model.bodyElements.forEach(el => {
        suiTypes.forEach(suiType => {
            const t = suiType as SimpleUIAstType;
            const isInstance = reflection.isInstance(el, t);
            if (isInstance) {
                const func = generateBodyFunctions[t];
                if (func) {
                    const content = func(el, ctx);
                    bodyNode.append(content, NL);
                }
            }
        })
    })
}
