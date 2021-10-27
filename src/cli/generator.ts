import fs from 'fs';
import { AstNode, CompositeGeneratorNode, NL, processGeneratorNode } from 'langium';
import { Button, Div, Paragraph, reflection, SimpleUi, SimpleUiAstType } from '../language-server/generated/ast';
import { extractDestinationAndName } from './cli-util';

export type GenerateFunctions = {
    [key in SimpleUiAstType]?:(el: AstNode)=>string
}

export function generateHTML(model: SimpleUi, filePath: string, destination: string | undefined): string {
    const data = extractDestinationAndName(filePath, destination);
    const generatedFilePath = `${data.destination}${data.name}.html`;

    const fileNode = new CompositeGeneratorNode();
    fileNode.append('<!DOCTYPE html>', NL);
    fileNode.append('<html>', NL);
    fileNode.indent(head => {
        head.append('<head>', NL);
        head.indent(headcontent => {

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

/**
    const fileNode = new CompositeGeneratorNode();
    fileNode.append('<!DOCTYPE html>',NL,'<html>',NL,'<head>',NL,'<title>Title of the document</title>',NL,'</head>',NL,'<body>', NL);
    fileNode.indent(html => {
        html.append('<html>', NL);
        html.indent(test => {
            test.append('<p> This is a Test <p>', NL);
        });
        html.append('</html>'), NL;
    });
    const componentComments = model.component.map(c => `<!-- ${c.componentname} -->`);
    fileNode.append(...componentComments, NL);
    fileNode.append('</body>',NL,'</html>');
*/

    if (!fs.existsSync(data.destination)) {
        fs.mkdirSync(data.destination, { recursive: true });
    }
    fs.writeFileSync(generatedFilePath, processGeneratorNode(fileNode));
    return generatedFilePath;
}

const divFunc = (divEl: AstNode) => {
    const el = divEl as Div;
    console.log(el);
    return `<div></div>`;
};

const paragraphFunc = (paragraphEl: AstNode) => {
    const el = paragraphEl as Paragraph;
    return `<p>${el.text}</p>`;
}

const buttonFunc = (buttonEL: AstNode) => {
    const el = buttonEL as Button;
    return `<button>${el.buttontext}</button>`;
}

export const generateBodyFunctions: GenerateFunctions = {
    Div: divFunc,
    Paragraph: paragraphFunc,
    Button: buttonFunc
};

export function generateBody(model: SimpleUi, bodyNode: CompositeGeneratorNode) {
    const suiTypes = reflection.getAllTypes();
    model.elements.forEach(el => {
        suiTypes.forEach(suiType => {
            const t = suiType as SimpleUiAstType;
            const isInstance = reflection.isInstance(el, t);
            if(isInstance) {
                const func = generateBodyFunctions[t];
                if(func) {
                    const content = func(el);
                    console.log(content);
                    bodyNode.append(content, NL);
                }
            }
        })
    })
}