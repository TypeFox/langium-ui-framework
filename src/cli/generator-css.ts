import fs from 'fs';
import { AstNode, CompositeGeneratorNode, NL, processGeneratorNode } from 'langium';
import { SimpleUi, SimpleUiAstType, reflection } from '../language-server/generated/ast';
import { extractDestinationAndName } from './cli-util';

export type GenerateFunctions = {
    [key in SimpleUiAstType]?:(el: AstNode)=>string|CompositeGeneratorNode
}

export function generateCSS(model: SimpleUi, filePath: string, destination: string | undefined): string {
    const data = extractDestinationAndName(filePath, destination);
    const generatedFilePath = `${data.destination}stylesheet.css`;

    const fileNode = new CompositeGeneratorNode();
    generateCSSObject(model, fileNode)
    generateCSSText(model, fileNode)
    if (!fs.existsSync(data.destination)) {
        fs.mkdirSync(data.destination, { recursive: true });
    }
    fs.writeFileSync(generatedFilePath, processGeneratorNode(fileNode));
    return generatedFilePath;
}

export const generateCSSTextFunctions: GenerateFunctions = {
    
}

export const generateCSSObjectFunctions: GenerateFunctions = {

}



export function generateCSSText(model: SimpleUi, csstextNode: CompositeGeneratorNode) {
    const suiTypes = reflection.getAllTypes();
    model.csstextelements.forEach(el => {
        suiTypes.forEach(suiType => {
            const t = suiType as SimpleUiAstType;
            const isInstance = reflection.isInstance(el, t);
            if(isInstance) {
                const func = generateCSSTextFunctions[t];
                if(func) {
                    const content = func(el);
                    csstextNode.append(content, NL);
                }
            }
        })
    })
}

export function generateCSSObject(model: SimpleUi, cssobjectNode: CompositeGeneratorNode) {
    const suiTypes = reflection.getAllTypes();
    model.cssobjectelements.forEach(el => {
        suiTypes.forEach(suiType => {
            const t = suiType as SimpleUiAstType;
            const isInstance = reflection.isInstance(el, t);
            if(isInstance) {
                const func = generateCSSObjectFunctions[t];
                if(func) {
                    const content = func(el);
                    cssobjectNode.append(content, NL);
                }
            }
        })
    })
}