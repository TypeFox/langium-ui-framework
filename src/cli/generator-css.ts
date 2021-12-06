import fs from 'fs';
import { CompositeGeneratorNode, NL, processGeneratorNode } from 'langium';
import { SimpleUi } from '../language-server/generated/ast';
import { extractDestinationAndName } from './cli-util';

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
    if (!fs.existsSync(data.destination)) {
        fs.mkdirSync(data.destination, { recursive: true });
    }
    fs.writeFileSync(generatedFilePath, processGeneratorNode(fileNode));
    return generatedFilePath;
}
