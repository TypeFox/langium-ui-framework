import fs from 'fs';
import { CompositeGeneratorNode, NL, processGeneratorNode } from 'langium';
import { Expression, isNumberExpression, isStringExpression, SimpleUi } from '../language-server/generated/ast';
import { extractDestinationAndName } from './cli-util';

export function generateCSS(model: SimpleUi, filePath: string, destination: string | undefined): string {
    const data = extractDestinationAndName(filePath, destination);
    const generatedFilePath = `${data.destination}stylesheet.css`;

    const fileNode = new CompositeGeneratorNode();
    generateCSSText(model, fileNode)
    generateCSSObject(model, fileNode)
    if (!fs.existsSync(data.destination)) {
        fs.mkdirSync(data.destination, { recursive: true });
    }
    fs.writeFileSync(generatedFilePath, processGeneratorNode(fileNode));
    return generatedFilePath;
}


function generateCSSText(model: SimpleUi, fileNode: CompositeGeneratorNode) {

    model.csstext.forEach(el =>{
        fileNode.append(`#${el.for} {`, NL)
        fileNode.indent(cssTextNode => {
            el.properties.forEach(prop =>{
                switch (prop.property) {
                    case 'color' :
                        cssTextNode.append(`color: ${generateExpression(prop.value)};`, NL);
                        break;
                    case 'size' :
                        cssTextNode.append(`font-size: ${generateExpression(prop.value)}px;`, NL);
                        break;
                } 
            })
        fileNode.append('}', NL);
        fileNode.append(NL);
        });
    });
}

function generateExpression(expression: Expression):string {
    if (isStringExpression(expression)) {
        return expression.value
    }
    else if (isNumberExpression(expression)) {
        return expression.value.toString()
    }
    else {
        throw new Error ('Unhandled Expression type: ' + expression.$type)
    }
}

function generateCSSObject(model: SimpleUi, fileNode: CompositeGeneratorNode) {

    model.cssobject.forEach(el =>{
        fileNode.append(`#${el.for} {`, NL)
        fileNode.indent(cssObjectNode => {
            el.properties.forEach(prop => {
                switch (prop.property) {
                    case 'width' :
                        cssObjectNode.append(`width: ${generateExpression(prop.value)}px;`, NL)
                        break
                    case 'height' :
                        cssObjectNode.append(`height: ${generateExpression(prop.value)}px;`, NL)
                        break
                }
            })
        fileNode.append('}', NL)
        fileNode.append(NL);
        })
    })
}
