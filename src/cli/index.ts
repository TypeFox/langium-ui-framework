import colors from 'colors';
import { Command } from 'commander';
import { languageMetaData } from '../language-server/generated/module';
import { SimpleUi } from '../language-server/generated/ast';
import { createSimpleUiServices } from '../language-server/simple-ui-module';
import { extractAstNode } from './cli-util';
import { generateJavaScript } from './generator';

const program = new Command();

program
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    .version(require('../../package.json').version);

program
    .command('generate')
    .argument('<file>', `possible file extensions: ${languageMetaData.fileExtensions.join(', ')}`)
    .option('-d, --destination <dir>', 'destination directory of generating')
    .description('generates JavaScript code that prints "Hello, {name}!" for each greeting in a source file')
    .action((fileName: string, opts: GenerateOptions) => {
        const model = extractAstNode<SimpleUi>(fileName, languageMetaData.fileExtensions, createSimpleUiServices());
        const generatedFilePath = generateJavaScript(model, fileName, opts.destination);
        console.log(colors.green('JavaScript code generated successfully:'), colors.yellow(generatedFilePath));
    });

program.parse(process.argv);

export type GenerateOptions = {
    destination?: string;
}