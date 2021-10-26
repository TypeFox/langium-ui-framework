import fs from 'fs';
import { CompositeGeneratorNode, NL, processGeneratorNode } from 'langium';
import { SimpleUi } from '../language-server/generated/ast';
import { extractDestinationAndName } from './cli-util';

export function generateHTML(model: SimpleUi, filePath: string, destination: string | undefined): string {
    const data = extractDestinationAndName(filePath, destination);
    const generatedFilePath = `${data.destination}${data.name}.html`;

    const fileNode = new CompositeGeneratorNode();
    fileNode.append('<!DOCTYPE html>', NL);
    fileNode.append('<html>', NL);
    fileNode.indent(head => {
        head.append('<head>', NL);
        head.indent(headcontent => {
            headcontent.append('<!-- Head content placeholder -->', NL);
        });
        head.append('</head>', NL);
    });
    fileNode.indent(body => {
        body.append('<body>', NL);
        body.indent(bodycontent => {
            bodycontent.append('<!-- Body content placeholder -->', NL);
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