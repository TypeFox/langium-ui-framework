import colors from 'colors';
import { Command } from 'commander';
import { SimpleUiLanguageMetaData } from '../language-server/generated/module';
import { SimpleUi } from '../language-server/generated/ast';
import { createSimpleUiServices } from '../language-server/simple-ui-module';
import { checkValidation, extractAstNode, extractDocument } from './cli-util';
import { generateHTML } from './generator-html';
import { generateCSS } from './generator-css';
import { generateJS } from './generator-js';
import fs from 'fs';

const program = new Command();

program
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    .version(require('../../package.json').version);

program
    .command('generate')
    .argument('<file>', `possible file extensions: ${SimpleUiLanguageMetaData.fileExtensions.join(', ')}`)
    .option('-d, --destination <dir>', 'destination directory of generating')
    .option('-w, --watch', 'enables watch mode', false)
    .description('generates HTML code based on the input')
    .action(async (fileName: string, opts: GenerateOptions) => {
              progressCommand(fileName, opts);
    });
    
program.parse(process.argv);

async function progressCommand(fileName: string, options: GenerateOptions) {
    generate(fileName, options);
    if (options.watch) {
        console.log(getTime() + colors.gray('SimpleUi generator will continue running in watch mode'));
        fs.watchFile(fileName, async () => {
            console.log(getTime() + colors.yellow('File change detected. Starting generation...'));
            generate(fileName,options);
        });
    }
}

async function generate(fileName: string, options: GenerateOptions) {
    const generationResult = await extractDocument(fileName, SimpleUiLanguageMetaData.fileExtensions, createSimpleUiServices().simpleUi, options);
    if(generationResult.success){
        const model = generationResult.document.parseResult?.value as SimpleUi;
        const generatedHTMLFilePath = generateHTML(model, fileName, options.destination);
        const generatedCSSFilePath = generateCSS(model, fileName, options.destination);
        const generatedJSFilePath = generateJS(model, fileName, options.destination);
        console.log(getTime() + colors.green('HTML code generated successfully:'), colors.yellow(generatedHTMLFilePath));
        console.log(getTime() + colors.green('CSS code generated successfully:'), colors.yellow(generatedCSSFilePath));
        console.log(getTime() + colors.green('JS code generated successfully:'), colors.yellow(generatedJSFilePath));
    
    }
    else {
        console.log(getTime() + colors.red('Code generation failed'));
    }
 }

function getTime(): string{
    let dateTime = new Date()
    return colors.gray(`[${dateTime.getHours()}:${dateTime.getMinutes()}:${dateTime.getSeconds()}] `);
}

export type GenerateOptions = {
    destination?: string;
    watch: boolean;
}