import { startLanguageServer } from 'langium';
import { NodeFileSystem } from 'langium/node';
import { createConnection, ProposedFeatures } from 'vscode-languageserver/node';
import { createSimpleUiServices, getCSSClasses, setCSSClassNames } from './simple-ui-module';
import path from 'path';
import fs from 'fs';

// Create a connection to the client
const connection = createConnection(ProposedFeatures.all);

// Inject the language services
const { shared } = createSimpleUiServices({ connection, ...NodeFileSystem });

// Read the contents of the base.css using fs 
setCSSClassNames(getCSSClasses(fs.readFileSync(path.resolve(__dirname + '../../../src/assets/base.css'),'utf8'))); 

// Start the language server with the language-specific services
startLanguageServer(shared);
