import fs from 'fs';
import colors from 'colors';
import { AstNode, BuildResult, LangiumDocument, LangiumServices } from 'langium';
import path from 'path';
import { URI } from 'vscode-uri';
import { Diagnostic } from 'vscode';
import { GenerateOptions } from '.';

export async function extractDocument(fileName: string, extensions: string[], services: LangiumServices, options: GenerateOptions): Promise<GeneratorResult> {
    let success = true;
    if (!extensions.includes(path.extname(fileName))) {
        console.error(colors.yellow(`Please, choose a file with one of these extensions: ${extensions}.`));
        process.exit(1);
    }

    if (!fs.existsSync(fileName)) {
        console.error(colors.red(`File ${fileName} doesn't exist.`));
        process.exit(1);
    }

    const document = services.shared.workspace.LangiumDocuments.getOrCreateDocument(URI.file(path.resolve(fileName)));
    const buildResult = await services.shared.workspace.DocumentBuilder.build(document);
    const validationErrors = buildResult.diagnostics.filter(e => e.severity === 1);
    if (validationErrors.length > 0) {
        success = false;
        console.error(colors.red('There are validation errors:'));
        for (const validationError of validationErrors) {
            console.error(colors.red(
                `line ${validationError.range.start.line}: ${validationError.message} [${document.textDocument.getText(validationError.range)}]`
            ));
        }
        if(!options.watch){
            process.exit(1);
        } 

    }

    return {
        document: document,
        success: success
    }
}

interface FilePathData {
    destination: string,
    name: string
}

export interface GeneratorResult { 
    document: LangiumDocument;
    success: boolean;
}

export function extractDestinationAndName(filePath: string, destination: string | undefined): FilePathData {
    filePath = filePath.replace(/\..*$/, '').replace(/[.-]/g, '');
    return {
        destination: destination ?? `${path.dirname(filePath)}/generated/`,
        name: path.basename(filePath)
    };
}
