import { CompletionAcceptor, DefaultCompletionProvider, NameProvider, LangiumServices, CompletionContext, MaybePromise, NextFeature, LangiumDocument, findLeafNodeAtOffset, getEntryRule, stream } from "langium";
import { isCSSClasses } from "./generated/ast";
import { AbstractElement, isKeyword, isRuleCall, isCrossReference, CrossReference } from "langium/lib/grammar/generated/ast";
import { CompletionItem, CompletionList, CompletionParams,CompletionItemKind } from 'vscode-languageserver';
import { getCSSClassNames } from "./simple-ui-module";

export class SimpleUICompletionProvider extends DefaultCompletionProvider {
    override readonly nameProvider: NameProvider;
    constructor(services: LangiumServices) {
        super(services);
        this.nameProvider = services.references.NameProvider;
    }   

    override async getCompletion(document: LangiumDocument, params: CompletionParams): Promise<CompletionList | undefined> {
        const root = document.parseResult.value;
        const cst = root.$cstNode;
        if (!cst) {
            return undefined;
        }
        const items: CompletionItem[] = [];
        const textDocument = document.textDocument;
        const text = textDocument.getText();
        const offset = textDocument.offsetAt(params.position);
        const acceptor: CompletionAcceptor = value => {
            const completionItem = this.fillCompletionItem(textDocument, offset, value);
            if (completionItem) {
                items.push(completionItem);
            }
        };

        const node = findLeafNodeAtOffset(cst, this.backtrackToAnyToken(text, offset));

        const context: CompletionContext = {
            document,
            textDocument,
            node: node?.element,
            offset,
            position: params.position
        };

        if (!node) {
            const parserRule = getEntryRule(this.grammar)!;
            await this.completionForRule(context, parserRule, acceptor);
            return CompletionList.create(items, true);
        }

        const parserStart = this.backtrackToTokenStart(text, offset);
        const beforeFeatures = this.findFeaturesAt(textDocument, parserStart);
        let afterFeatures: NextFeature[] = [];
        const reparse = this.canReparse() && offset !== parserStart;
        if (reparse) {
            afterFeatures = this.findFeaturesAt(textDocument, offset);
        }

        const distinctionFunction = (element: NextFeature) => {
            if (isKeyword(element.feature)) {
                return element.feature.value;
            } else {
                return element.feature;
            }
        };

        await Promise.all(
            stream(beforeFeatures)
                .distinct(distinctionFunction)
                .map(e => this.completionFor(context, e, acceptor))
        );

        if (reparse) {
            await Promise.all(
                stream(afterFeatures)
                    .exclude(beforeFeatures, distinctionFunction)
                    .distinct(distinctionFunction)
                    .map(e => this.completionFor(context, e, acceptor))
            );
        }

        const filteredItems: CompletionItem[] = [];

        items.forEach(item => {
            if (!filteredItems.some(i => i.label === item.label)) {
                filteredItems.push(item);
            }
        })

        return CompletionList.create(filteredItems, true);
    }


    override completionFor(context: CompletionContext, next: NextFeature<AbstractElement>, acceptor: CompletionAcceptor): MaybePromise<void> {
        const feature = next.feature;
        if (isKeyword(feature)) {
            return this.completionForKeyword(context, feature, acceptor);
        }
        else if (isRuleCall(feature) && feature.rule.ref) {
            if (isCSSClasses(context.node)) {
                this.completionForCSSClasses(acceptor);
            }
            else {
                return this.completionForRule(context, feature.rule.ref, acceptor);
            }
        }
        else if (isCrossReference(feature) && context.node) {
            return this.completionForCrossReference(context, next as NextFeature<CrossReference>, acceptor);
        }
    }

    completionForCSSClasses(acceptor: CompletionAcceptor) {
        getCSSClassNames().forEach((element) => {
            acceptor({
                label: element,
                kind: CompletionItemKind.Value, 
                detail: 'CSS Class',
                sortText: '1'
            });
        });
    }

    isRunningInBrowser(): boolean {
        return typeof window !== 'undefined';
    }
}
