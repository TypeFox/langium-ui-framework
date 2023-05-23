import fs from 'fs';
import { CompositeGeneratorNode, NL, toString } from 'langium';
import path from 'path';
import { SimpleUi } from '../language-server/generated/ast';
import { extractDestinationAndName } from './cli-util';

let copiedCSS = Array<string>();

export function generateCSS(model: SimpleUi, filePath: string, destination: string | undefined): string {
    const data = extractDestinationAndName(filePath, destination);
    const generatedFilePath = `${data.destination}stylesheet.css`;
    const fileNode = new CompositeGeneratorNode();
    //body
    fileNode.append('body {', NL);
    fileNode.indent(indentContent => {
        indentContent.append('margin: 0px;', NL);
        indentContent.append('font-family: Arial, Helvetica, sans-serif;', NL);
    });
    fileNode.append('}', NL);

    // CSS from base.css (only classes used in the input file)
    fileNode.append(copiedCSS.join("\n"));

    fileNode.append('.footer {', NL);
    fileNode.indent(indentContent => {
        indentContent.append('width: 100%;', NL);
        indentContent.append('padding: 1rem 1%;', NL);
        indentContent.append('background: #333;', NL);
        indentContent.append('color: #f2f2f2;', NL);
    });
    fileNode.append('}',NL);
    fileNode.append('.footer > p {',NL);
    fileNode.indent(indentContent => {
        indentContent.append('font-size: 1.5rem;',NL);
    })
    fileNode.append('}',NL);

    if (!fs.existsSync(data.destination)) {
        fs.mkdirSync(data.destination, { recursive: true });
    }
    fs.writeFileSync(generatedFilePath, toString(fileNode));
    return generatedFilePath;
}

export function copyCSSClass(name: string) {
    const regex = new RegExp(`\\.${name}[\\s\\S]+?\{[\\s\\S]*?\}`,'gm');
    const fileContent = fs.readFileSync(path.resolve(__dirname + '../../../src/assets/base.css'),'utf8');
    const regexResult = fileContent.match(regex);
    
    if(regexResult){
    const output = regexResult.join('\n');
        if(!copiedCSS.includes(output)){
            copiedCSS.push(output);
        }
    }
}