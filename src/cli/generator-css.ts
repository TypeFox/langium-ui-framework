import fs from 'fs';
import { CompositeGeneratorNode, NL, processGeneratorNode } from 'langium';
import { SimpleUi } from '../language-server/generated/ast';
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
        fileNode.append(`${el.for} {`, NL)
        fileNode.indent(cssTextNode => {
            el.properties.forEach(prop =>{
                switch (prop.property) {
                    case 'color' :
                        cssTextNode.append(`color: ${prop.value.value};`, NL);
                        break;
                    case 'size' :
                        cssTextNode.append(`size: ${prop.value.value}px;`, NL);
                        break;
                } 
            })
        fileNode.append('}', NL);
        });
    });
}

function generateCSSObject(model: SimpleUi, fileNode: CompositeGeneratorNode) {

    model.cssobject.forEach(el =>{
        fileNode.append(`${el.for} {`, NL)
        fileNode.indent(cssObjectNode => {
            el.properties.forEach(prop => {
                switch (prop.property) {
                    case 'width' :
                        cssObjectNode.append(`width: ${prop.value.value}px;`, NL)
                        break
                    case 'height' :
                        cssObjectNode.append(`height: ${prop.value.value}px;`, NL)
                        break
                }
            })
        fileNode.append('}', NL)
        })
    })
}

/*
    model.csstext.forEach(el => {
        fileNode.append(`${el.forid} {`, NL)
        fileNode.indent(cssTextContent => {
            if (typeof el.color === 'undefined') {
                if (typeof el.sizepx === 'undefined') {
                    return //both undefined
                }
                else {
                    cssTextContent.append(`font-size: ${el.sizepx}px`, NL) //color undefined, size defined
                };
            }
            else {
                if (typeof el.sizepx === 'undefined') {
                    cssTextContent.append(`color: ${el.color}`, NL) // color defined, size undefined
                }
                else {
                    cssTextContent.append(`font-size: ${el.sizepx}px`, NL) // both defined
                    cssTextContent.append(`color: ${el.color}`, NL)
                }
            }
        })
        fileNode.append('}', NL) 
    })
    */

