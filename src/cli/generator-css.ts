import fs from 'fs';
import { CompositeGeneratorNode, NL, processGeneratorNode } from 'langium';
import { SimpleUi } from '../language-server/generated/ast';
import { extractDestinationAndName } from './cli-util';

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
    })
    fileNode.append('}',NL);
    //.topbar--fixed
    fileNode.append('.topbar--fixed{',NL);
    fileNode.indent(indentContent => {
        indentContent.append('position: fixed;',NL);
        indentContent.append('top: 0;',NL);
    })
    fileNode.append('}',NL);

    fileNode.append('.footer {', NL);
    fileNode.indent(indentContent => {
        indentContent.append('position: absolute;', NL);
        indentContent.append('bottom: 0;', NL);
        indentContent.append('width: 100%;', NL);
        indentContent.append('padding: 1rem 1%;', NL);
        indentContent.append('background: #333;', NL);
        indentContent.append('color: #f2f2f2;', NL);
    });
    fileNode.append('}',NL);
    fileNode.append('.footer > p{',NL);
    fileNode.indent(indentContent => {
        indentContent.append('font-size: 1.5rem;',NL);
    })
    fileNode.append('}',NL);

    if (!fs.existsSync(data.destination)) {
        fs.mkdirSync(data.destination, { recursive: true });
    }
    fs.writeFileSync(generatedFilePath, processGeneratorNode(fileNode));
    return generatedFilePath;
}
