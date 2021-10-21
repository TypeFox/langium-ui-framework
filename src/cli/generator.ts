import fs from 'fs';
import { CompositeGeneratorNode, NL, processGeneratorNode } from 'langium';
import { SimpleUi } from '../language-server/generated/ast';
import { extractDestinationAndName } from './cli-util';

export function generateJavaScript(model: SimpleUi, filePath: string, destination: string | undefined): string {
    const data = extractDestinationAndName(filePath, destination);
    const generatedFilePath = `${data.destination}${data.name}.js`;

    const fileNode = new CompositeGeneratorNode();
    fileNode.append('<!DOCTYPE html>', '<html>', '<head>', '<title>Title of the document</title>', '</head>', '<body>', NL);
    const componentComments = model.component.map(c => `<!-- ${c.componentname} -->`);
    fileNode.append(...componentComments);
    fileNode.append('</body>', '</html>');

    if (!fs.existsSync(data.destination)) {
        fs.mkdirSync(data.destination, { recursive: true });
    }
    fs.writeFileSync(generatedFilePath, processGeneratorNode(fileNode));
    return generatedFilePath;
}