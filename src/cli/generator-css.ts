import fs from 'fs';
import { CompositeGeneratorNode, NL, processGeneratorNode } from 'langium';
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
    //.topbar
    fileNode.append('.topbar {',NL);
    fileNode.indent(indentContent => {
        indentContent.append('width:100%;',NL);
        indentContent.append('background-color: #333;',NL);
        indentContent.append('overflow: hidden;',NL);
        indentContent.append('padding: 1rem 1%;',NL);
    });
    fileNode.append('}',NL);
    fileNode.append('.topbar > nav > a:any-link{',NL);
    fileNode.indent(indentContent => {
        indentContent.append('color: #f2f2f2;',NL);
        indentContent.append('font-size: 1.5rem;',NL);
        indentContent.append('text-decoration: none;',NL);
    });
    fileNode.append('}',NL);
    //.topbar--fixed
    fileNode.append('.topbar--fixed{',NL);
    fileNode.indent(indentContent => {
        indentContent.append('position: fixed;',NL);
        indentContent.append('top: 0;',NL);
    })
    fileNode.append('}',NL);
    //CSS from base.css (only classes used in the input file)
    fileNode.append(copiedCSS.join("\n"));

    if (!fs.existsSync(data.destination)) {
        fs.mkdirSync(data.destination, { recursive: true });
    }
    fs.writeFileSync(generatedFilePath, processGeneratorNode(fileNode));
    return generatedFilePath;
}

export function copyCSSClass(name: string) {
    const regex = new RegExp(`\\.${name}[\\s]?\\\{[\\s\\S]*?\\\}`);
    const fileContent = fs.readFileSync(path.resolve(__dirname + '../../../src/assets/base.css'),'utf8');
    if(fileContent.includes(`.${name}`)) {
        let result = '';
        result += regex.exec(fileContent);
        if(!copiedCSS.includes(result))
            copiedCSS.push(result);
    }
}