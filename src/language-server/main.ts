import { startLanguageServer } from 'langium';
import { NodeFileSystem } from 'langium/node';
import { createConnection, ProposedFeatures } from 'vscode-languageserver/node';
import { createSimpleUiServices } from './simple-ui-module';

// Create a connection to the client
const connection = createConnection(ProposedFeatures.all);

// Inject the language services
const { shared } = createSimpleUiServices({ connection, ...NodeFileSystem });

// Start the language server with the language-specific services
startLanguageServer(shared);
