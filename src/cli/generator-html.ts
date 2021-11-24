import fs from 'fs';
import { AstNode, CompositeGeneratorNode, NL, processGeneratorNode } from 'langium';
import { Button, CSSObjectElements, CSSTextElements, Div, Expression, Header, Image, isNumberExpression, isStringExpression, Label, Link, Paragraph, reflection, SimpleUi, SimpleUiAstType, Textbox, Title, UseComponent } from '../language-server/generated/ast';
import { extractDestinationAndName } from './cli-util';

export type GenerateFunctions = {
    [key in SimpleUiAstType]?:(el: AstNode)=>string|CompositeGeneratorNode
}

export function generateHTML(model: SimpleUi, filePath: string, destination: string | undefined): string {
    const data = extractDestinationAndName(filePath, destination);
    const generatedFilePath = `${data.destination}index.html`;

    const fileNode = new CompositeGeneratorNode();
    fileNode.append('<!DOCTYPE html>', NL);
    fileNode.append('<html>', NL);
    fileNode.indent(head => {
        head.append('<head>', NL);
        head.indent(headcontent => {
            generateHead(model, headcontent);
            headcontent.append('<link rel="stylesheet" href="stylesheet.css">', NL);
            headcontent.append('<script src="script.js"></script>', NL)
        });
        head.append('</head>', NL);
    });
    fileNode.indent(body => {
        body.append('<body>', NL);
        body.indent(bodycontent => {
            generateBody(model, bodycontent);
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

// Head generate functions
const titleFunc = (titleEL: AstNode) => {
    const el = titleEL as Title;
    return `<title>${el.text}</title>`
}

// Body generate functions
const divFunc = (divEl: AstNode) => {
    const el = divEl as Div;
    const fileNode = new CompositeGeneratorNode()
    fileNode.append('<div>', NL)
    fileNode.indent(divcontent => {
        generateBody(el.content, divcontent)
    });
    fileNode.append('</div>')
    return fileNode
};

const paragraphFunc = (paragraphEl: AstNode) => {
    const el = paragraphEl as Paragraph;
    if (generateInlineCSS(el) === '') {
        return `<p>${generateExpression(el.text)}</p>`;
    }
    else {
        return `<p style='${generateInlineCSS(el)}'>${generateExpression(el.text)}</p>`;
    }
};

const buttonFunc = (buttonEL: AstNode) => {
    const el = buttonEL as Button;
    if (typeof el.onclickaction === 'undefined') {
        return `<button>${generateExpression(el.buttontext)}</button>`;
    }
    else {
        return `<button onclick='${generateExpression(el.onclickaction)}'>${generateExpression(el.buttontext)}</button>`;
    };
};

const linkFunc = (linkEL: AstNode) => {
    const el = linkEL as Link;
    if (typeof el.linktext === 'undefined') {
        return `<a href='${generateExpression(el.linkurl)}'>${generateExpression(el.linkurl)}</a>`;
    }
    else {
        return `<a href='${generateExpression(el.linkurl)}'>${generateExpression(el.linktext)}</a>`;
    };
};

const textboxFunc = (textboxEL: AstNode) => {
    const el = textboxEL as Textbox;
    if (typeof el.placeholdertext === 'undefined') {
        return `<input type='text' id='${el.name}'>`;
    }
    else {
        return `<input type='text' id='${el.name}' placeholder='${generateExpression(el.placeholdertext)}'>`;
    };
};

const linebreakFunc = (linebreakEL: AstNode) => {
    return '<br>';
};

const labelFunc = (labelEL: AstNode) => {
    const el = labelEL as Label;
    if (generateInlineCSS(el) === '') {
        return `<label for='${el.elementid}'>${generateExpression(el.text)}</label>`;
    }
    else {
        return `<label for='${el.elementid}' style='${generateInlineCSS(el)}'>${generateExpression(el.text)}</label>`;
    }
    
};

const imageFunc = (imageEL: AstNode) => {
    const el = imageEL as Image;
    if (generateInlineCSS(el) === '') {
        return `<img src='${generateExpression(el.imagepath)}'>`
    }
    else {
        return `<img src='${generateExpression(el.imagepath)}' style='${generateInlineCSS(el)}'>`
    }
}

const headerFunc = (headerEL: AstNode) => {
    const el = headerEL as Header;
    if (generateInlineCSS(el) === '') {
        return `<h${el.headerlevel}>${generateExpression(el.text)}</h${el.headerlevel}>`
    }
    else {
        return `<h${el.headerlevel} style='${generateInlineCSS(el)}'>${generateExpression(el.text)}</h${el.headerlevel}>`
    }
}

const useComponentFunc = (UseComponentEL: AstNode) => {
    const el = UseComponentEL as UseComponent;
    const componentNode = new CompositeGeneratorNode()
    const refContent = el.component.ref?.content as SimpleUi
    generateBody(refContent, componentNode)
    return componentNode
}


// Redirect to generator function by Type

// Head functions
export const generateHeadFunctions: GenerateFunctions = {
    Title: titleFunc
};

// Body functions
export const generateBodyFunctions: GenerateFunctions = {
    Div: divFunc,
    Paragraph: paragraphFunc,
    Button: buttonFunc,
    Link: linkFunc,
    Textbox: textboxFunc,
    Linebreak: linebreakFunc,
    Label: labelFunc,
    Image: imageFunc,
    Header: headerFunc,
    UseComponent: useComponentFunc
};

function generateExpression(expression: Expression):string {
    if (isStringExpression(expression)){
        return expression.value
    }
    else if (isNumberExpression(expression)){
        return expression.value.toString()
    }
    else {
        throw new Error ('Unhandled Expression type: ' + expression.$type)
    }
}

function generateInlineCSS(element: (CSSTextElements|CSSObjectElements)):string {
    let cssString = ''
    element.css.forEach(cssel => {
        switch (cssel.property){
            case 'color':
                cssString += `color:${generateExpression(cssel.value)}; `
                break;
            case 'size':
                cssString += `font-size:${generateExpression(cssel.value)}px; `
                break;
            case 'height':
                cssString += `height:${generateExpression(cssel.value)}px; `
                break;
            case 'width':
                cssString += `width:${generateExpression(cssel.value)}px; `
                break
        }
    })
    return cssString
}

// Check for Type and call head functions
export function generateHead(model: SimpleUi, bodyNode: CompositeGeneratorNode) {
    const suiTypes = reflection.getAllTypes();
    model.headelements.forEach(el => {
        suiTypes.forEach(suiType => {
            const t = suiType as SimpleUiAstType;
            const isInstance = reflection.isInstance(el, t);
            if(isInstance) {
                const func = generateHeadFunctions[t];
                if(func) {
                    const content = func(el);
                    bodyNode.append(content, NL);
                }
            }
        })
    })
}

// Check for Type and call body functions
export function generateBody(model: SimpleUi, bodyNode: CompositeGeneratorNode) {
    const suiTypes = reflection.getAllTypes();
    model.bodyelements.forEach(el => {
        suiTypes.forEach(suiType => {
            const t = suiType as SimpleUiAstType;
            const isInstance = reflection.isInstance(el, t);
            if(isInstance) {
                const func = generateBodyFunctions[t];
                if(func) {
                    const content = func(el);
                    bodyNode.append(content, NL);
                }
            }
        })
    })
}
