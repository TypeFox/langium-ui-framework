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
    fileNode.append('body {', NL)
    fileNode.indent(indentContent => {
        indentContent.append('margin: 0px;', NL)
        indentContent.append('font-family: Arial, Helvetica, sans-serif;', NL)
    })
    fileNode.append('}', NL)
      
    fileNode.append(copiedCSS.join("\n"));
    if (!fs.existsSync(data.destination)) {
        fs.mkdirSync(data.destination, { recursive: true });
    }
    fs.writeFileSync(generatedFilePath, processGeneratorNode(fileNode));
    return generatedFilePath;
}

export function copyCSSClass(name: string) {
    const regex = new RegExp(`\\.${name}[\\s]?\\\{[\\s\\S]*?\\\}`);
    const fileContent = fs.readFileSync(path.join(__dirname + '/../base.css'),'utf8');
    if(fileContent.includes(`.${name}`)) {
        let result = '';
        result += regex.exec(fileContent);
        copiedCSS.push(result);
    }
}