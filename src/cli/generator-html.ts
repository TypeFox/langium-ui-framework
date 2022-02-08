import fs from 'fs';
import { AstNode, CompositeGeneratorNode, NL, processGeneratorNode } from 'langium';
import { integer } from 'vscode-languageserver-types';
import { BodyElement, Button, CSSProperty, Div, Expression, Footer, HeadElement, Heading, Icon, Image, isElementId, isNumberExpression, isOperation, isStringExpression, isSymbolReference, Link, NestingElement, Paragraph, Parameter, Section, SimpleExpression, SimpleUi, SimpleUIAstType, SingleElement, Textbox, Title, Topbar, UseComponent } from '../language-server/generated/ast';
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
        const content = generateHeadFunctions(el, ctx);
        if(content)
        {
            bodyNode.append(content, NL);
        }
    })
}

// Head functions
function generateHeadFunctions(element: HeadElement, ctx: GeneratorContext): string {
    switch(element.$type){
        case 'Title':
            return titleFunc(element as Title, ctx);
        case 'Icon':
            return iconFunc(element as Icon, ctx);
        default:
            return '';
    }
};

function titleFunc(element: Title, ctx: GeneratorContext) {
    return `<title>${generateExpression(element.text, ctx)}</title>`;
}

function iconFunc(element: Icon, ctx: GeneratorContext) {
    return `<link rel="icon" href="${generateExpression(element.iconPath, ctx)}">`;
}

//#endregion

//#region Body Generation

// Check for Type and call body functions
function generateBody(elements: BodyElement[], bodyNode: CompositeGeneratorNode, ctx: GeneratorContext) {
    elements.forEach(el => {
        const content = generateBodyFunctions(el, ctx);
        if(content){
            bodyNode.append(content, NL);
        }
    })
}

// Body functions
function generateBodyFunctions(element: BodyElement, ctx: GeneratorContext): string | CompositeGeneratorNode {
    // Footer: footerFunc

    switch(element.$type){
        case "Div":
            return divFunc(element as Div, ctx);
        case "Section":
            return sectionFunc(element as Section, ctx);
        case "Paragraph":
            return paragraphFunc(element as Paragraph, ctx);
        case "Button":
            return buttonFunc(element as Button, ctx);
        case "Link":
            return linkFunc(element as Link, ctx);
        case "Textbox":
            return textboxFunc(element as Textbox, ctx);
        case "Linebreak":
            return linebreakFunc();
        case "Image":
            return imageFunc(element as Image,ctx);
        case "Heading":
            return headingFunc(element as Heading,ctx);
        case "UseComponent":
            return useComponentFunc(element as UseComponent, ctx);
        case "Topbar":
            return topbarFunc(element as Topbar, ctx);
        case "Footer":
            return footerFunc(element as Footer, ctx);
        default:
            return '';
    }
};

// Body functions

function divFunc(element: Div, ctx: GeneratorContext) : CompositeGeneratorNode {
    const fileNode = new CompositeGeneratorNode();
    
    fileNode.append(`<div`,
    generateExpression(element.name, ctx)?` id="${generateExpression(element.name, ctx)}"`:'',
    formatCSS(element, ctx),
    '>',
     NL);

    fileNode.indent(divContent => {
        generateBody(element.content, divContent, ctx);
    });
    fileNode.append('</div>');
    return fileNode;
}

function sectionFunc(element: Section, ctx: GeneratorContext) : CompositeGeneratorNode {
    const fileNode = new CompositeGeneratorNode();
    fileNode.append(`<section`,
    generateExpression(element.name, ctx) ? ` id="${generateExpression(element.name, ctx)}"` : '',
    formatCSS(element, ctx),
    `>`, NL);

    fileNode.indent(sectionContent => {
        generateBody(element.content, sectionContent, ctx);
    });

    fileNode.append('</section>');

    return fileNode;
}

function paragraphFunc(element: Paragraph, ctx: GeneratorContext) : string { 
    return `<p` + 
    (generateExpression(element.name, ctx) ? ` id="${generateExpression(element.name, ctx)}"` : '') + 
    formatCSS(element, ctx) +
    '>' + 
    generateExpression(element.text, ctx) + '</p>';
;}

function buttonFunc(element: Button, ctx: GeneratorContext) : string {
    return `<button` + 
    (generateExpression(element.name, ctx) ? ` id="${generateExpression(element.name, ctx)}"` : '' ) +
    formatCSS(element, ctx) + 
    (element.onclickaction ? ` onclick="${generateParameters(element.arguments, ctx)}"` : '') + 
    `>` + 
    generateExpression(element.buttonText, ctx) +
    `</button>`;
}

function linkFunc(element: Link, ctx: GeneratorContext) : string{
    return `<a href="${generateExpression(element.linkUrl, ctx)}"` + 
    formatCSS(element, ctx) + 
    `>` + 
    (element.linkText ? generateExpression(element.linkText,ctx) : generateExpression(element.linkUrl,ctx)) + 
    `</a>`;
}

function textboxFunc(element: Textbox, ctx: GeneratorContext) {
    const fileNode = new CompositeGeneratorNode();

    const label = `<label for="${element.name}">` + 
    (element.labelText ? generateExpression(element.labelText, ctx) : '') +
    `</label>`;

    if(!element.labelAfter){
        fileNode.append(label,NL);
    }
    fileNode.append(
        `<input type="text" id="${element.name}"`,
        element.placeholderText ? ` placeholder="${generateExpression(element.placeholderText, ctx)}"` : '',
        formatCSS(element, ctx),
        `>`, NL
    );
    if(element.labelAfter){
        fileNode.append(label)
    }
    
    return fileNode;
}

function linebreakFunc() {
    return '<br>';
}

function imageFunc(element: Image, ctx: GeneratorContext) {
    return `<img`+
    (generateExpression(element.name, ctx) ? ` id="${generateExpression(element.name, ctx)}"` : '') + 
    ` src="${generateExpression(element.imagePath, ctx)}"` + 
    ` alt=` + 
    (element.altText ? `"${generateExpression(element.altText, ctx)}"` : '""') +
    formatCSS(element, ctx) + 
    `>`;
}

function headingFunc(element: Heading, ctx: GeneratorContext) {
    return `<h${element.level}` + 
    (generateExpression(element.name, ctx) ? ` id="${generateExpression(element.name, ctx)}"` : '') + 
    formatCSS(element, ctx) + 
    `>` + 
    generateExpression(element.text, ctx) + 
    `</h${element.level}>`;
}

function useComponentFunc(element: UseComponent, ctx: GeneratorContext) {
    const componentNode = new CompositeGeneratorNode();
    const refContent = element.component.ref?.content as BodyElement[];
    const refParameters = element.component.ref?.parameters as Parameter[];
    const argumentList = refParameters.map(function (refEl: Parameter, index: integer) {
        return ({ name: refEl.name, type: refEl.type, value: generateExpression(element.arguments[index], ctx) });
    });
    ctx.argumentStack.push(argumentList);
    generateComponent(refContent, componentNode, ctx);
    ctx.argumentStack.pop();
    return componentNode;
}

export function generateComponent(model: BodyElement[], bodyNode: CompositeGeneratorNode, ctx: GeneratorContext) {
    model.forEach(el => {
        const content = generateBodyFunctions(el, ctx);
        if(content){
            bodyNode.append(content, NL);
        }
    })
}

const topbarFunc = (element: Topbar, ctx: GeneratorContext) => {
    const topbarNode = new CompositeGeneratorNode();
    element.classes.classesNames.push('topbar');
    if(element.fixed){
        element.classes.classesNames.push('topbar--fixed');
    }
    topbarNode.append(`<header`, 
    formatCSS(element, ctx),
    `>`, 
    NL);
    topbarNode.indent(topbarContent => {
        topbarContent.append(`<nav>`,NL);
        topbarContent.indent(navigationContent => {
            navigationContent.append(`<a href='./'>${generateExpression(element.value, ctx)}</a>`,NL)
        });
        topbarContent.append(`</nav>`,NL);
    })
    topbarNode.append(`</header>`);
    return topbarNode
}

const footerFunc = (element: Footer, ctx:GeneratorContext) => {
    const footerNode = new CompositeGeneratorNode();
    element.classes.classesNames.push('footer');

    footerNode.append(`<footer `,
    formatCSS(element, ctx),
    `>`, 
    NL);
    footerNode.indent(footerContent => {
        footerContent.append(`<p>${generateExpression(element.value, ctx)}</p>`,NL)
    })
    footerNode.append(`</footer>`);
    return footerNode
}
//#endregion

function generateExpression(expression: Expression | SimpleExpression, ctx: GeneratorContext): string | number {
    if (isStringExpression(expression)) {
        return encodeHtml(expression.value);
    }
    else if (isNumberExpression(expression)) {
        return expression.value
    }
    else if (isSymbolReference(expression)) {
        let value = ''
        ctx.argumentStack[0].forEach(function (el) {
            if ((el as any).name === expression.symbol.ref?.name) {
                value = (el as any).value
            }
        })
        return value
    }
    else if (isOperation(expression)) {
        let result, left, right
        if (isStringExpression(expression.left) || typeof (generateExpression(expression.left, ctx)) === 'string') {
            left = `'${generateExpression(expression.left, ctx)}'`
        } else {
            left = generateExpression(expression.left, ctx)
        }
        if (isStringExpression(expression.right) || typeof (generateExpression(expression.right, ctx)) === 'string') {
            right = `'${generateExpression(expression.right, ctx)}'`
        } else {
            right = generateExpression(expression.right, ctx)
        }
        if ((typeof (left) === 'string' || typeof (right) === 'string') && (expression.operator == '*' || expression.operator == '-' || expression.operator == '/')) {
            throw new Error(`Invalid Operation: (${left} ${expression.operator} ${right})`)
        } else {
            result = eval(left + expression.operator + right)
            return (result)
        }
    }
    else if (isElementId(expression)) {
        return expression.name
    }
    else if (typeof(expression) === 'undefined') {
        return ''
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
            currentExpression = `${generateExpression(el,ctx)}`
        } else {
            currentExpression = `"${generateExpression(el,ctx)}"`
        }
        if (result === '') {
            result = currentExpression
        } else {
            result = `${result}, ${currentExpression}`
        }
    })
    return result
}

function formatCSS(element: SingleElement | NestingElement, ctx: GeneratorContext): string {
    const classes = generateCSSClasses(element.classes.classesNames);
    const classesString = classes ? ` class="${classes}"` : '';
    const styles = generateInlineCSS(element.styles.properties,ctx);
    const stylesString = styles ? ` style="${styles}"` : '';
    return classesString + stylesString;
}
function generateCSSClasses(classes: string[]): string {
    if(classes == undefined) return '';
    classes.forEach(el => {
        copyCSSClass(el);
    });
    return classes.join(" ");;
}
function generateInlineCSS(element: CSSProperty[], ctx: GeneratorContext): string {
    let cssString = ''
    element.forEach(cssel => {
        switch (cssel.property){
            case 'text-color':
                cssString += `color:${generateExpression(cssel.value, ctx)}; `
                break;
            case 'font-size':
                cssString += `font-size:${generateExpression(cssel.value, ctx)}; `
                break;
            case 'height':
                cssString += `height:${generateExpression(cssel.value, ctx)}; `
                break;
            case 'width':
                cssString += `width:${generateExpression(cssel.value, ctx)}; `
                break
            case 'background-color':
                cssString += `background-color: ${generateExpression(cssel.value, ctx)}; `
                break
        }
    })
    return cssString;
}
