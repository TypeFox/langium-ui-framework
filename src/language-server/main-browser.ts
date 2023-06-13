import type { Diagnostic } from 'vscode-languageserver/browser';
import { startLanguageServer, EmptyFileSystem, DocumentState } from 'langium';
import { BrowserMessageReader, BrowserMessageWriter, createConnection, NotificationType } from 'vscode-languageserver/browser';
import { createSimpleUiServices, getCSSClasses, setCSSClassNames } from "./simple-ui-module";

/* browser specific setup code */
const messageReader = new BrowserMessageReader(self as unknown as Worker);
const messageWriter = new BrowserMessageWriter(self as unknown as Worker);

const connection = createConnection(messageReader, messageWriter);

// Inject the shared services and language-specific services
const { shared, simpleUi } = createSimpleUiServices({ connection, ...EmptyFileSystem });

// Fetch the contents of the base.css file
fetch('/assets/base.css')
  .then(response => response.text())
  .then(text => setCSSClassNames(getCSSClasses(text)));


// Start the language server with the shared services
startLanguageServer(shared);


// Send a notification with the serialized AST after every document change
type DocumentChange = { uri: string, content: string, diagnostics: Diagnostic[] };
const documentChangeNotification = new NotificationType<DocumentChange>('browser/DocumentChange');
const jsonSerializer = simpleUi.serializer.JsonSerializer;
shared.workspace.DocumentBuilder.onBuildPhase(DocumentState.Validated, documents => {
    for (const document of documents) {
        const json = jsonSerializer.serialize(document.parseResult.value, {
            sourceText: true,
            textRegions: true,
        });
        connection.sendNotification(documentChangeNotification, {
            uri: document.uri.toString(),
            content: json,
            diagnostics: document.diagnostics ?? []
        });
    }
});
