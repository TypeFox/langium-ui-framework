import { AbstractElement, AstNode, CompletionAcceptor, DefaultCompletionProvider, isKeyword, isRuleCall, isCrossReference, NameProvider, LangiumServices, AstNodeDescription, findLeafNodeAtOffset, findNextFeatures, findRelevantNode, flatten, LangiumDocument, MaybePromise, stream, isParserRule} from "langium";
import fs from "fs"
import path from "path"
import { CompletionItem, CompletionItemKind, CompletionList } from "vscode-languageserver-types";
import { CompletionParams } from "vscode-languageclient";
import { CSSClasses, isCSSClasses } from "./generated/ast";

export class SimpleUICompletionProvider extends DefaultCompletionProvider{
    protected readonly nameProvider: NameProvider;
    constructor(services:LangiumServices){
        super(services);
        this.nameProvider = services.references.NameProvider;
    }

    getCompletion(document: LangiumDocument, params: CompletionParams): MaybePromise<CompletionList> {
        const root = document.parseResult.value;
        const cst = root.$cstNode;
        const items: CompletionItem[] = [];
        const offset = document.textDocument.offsetAt(params.position);
        const acceptor = (value: string | AstNode | AstNodeDescription, item?: Partial<CompletionItem>) => {
            const completionItem = this.fillCompletionItem(document.textDocument, offset, value, item);
            if (completionItem) {
                items.push(completionItem);
            }
        };
        if (cst) {
            const node = findLeafNodeAtOffset(cst, offset);
            if (node) {
                const features = findNextFeatures(this.buildFeatureStack(node));
                const commonSuperRule = this.findCommonSuperRule(node);
                // In some cases, it is possible that we do not have a super rule
                if (commonSuperRule) {
                    const flattened = flatten(commonSuperRule.node).filter(e => e.offset < offset);
                    const possibleFeatures = this.ruleInterpreter.interpretRule(commonSuperRule.rule, [...flattened], offset);
                    // Remove features which we already identified during parsing
                    const partialMatches = possibleFeatures.filter(e => {
                        const match = this.ruleInterpreter.featureMatches(e, flattened[flattened.length - 1], offset);
                        return match === 'partial' || match === 'both';
                    });
                    const notMatchingFeatures = possibleFeatures.filter(e => !partialMatches.includes(e));
                    features.push(...partialMatches);
                    features.push(...notMatchingFeatures.flatMap(e => findNextFeatures([e])));
                }
                if (node.end > offset) {
                    features.push(node.feature);
                }
                stream(features).distinct(e => {
                    if (isKeyword(e)) {
                        return e.value;
                    } else {
                        return e;
                    }
                }).forEach(e => this.completionFor(findRelevantNode(node), e, acceptor));
            } else {
                // The entry rule is the first parser rule
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                const parserRule = this.grammar.rules.find(e => isParserRule(e))!;
                this.completionForRule(undefined, parserRule, acceptor);
            }
        }
        const filteredItems : CompletionItem[]= [];
        
        items.forEach(item => {
            if(!filteredItems.some(i => i.label === item.label)){
                filteredItems.push(item);
            }
        })
        
        return CompletionList.create(filteredItems, true);
    }


    protected completionFor(astNode: AstNode | undefined, feature: AbstractElement, acceptor: CompletionAcceptor): void {
        if (isKeyword(feature)) {          
            this.completionForKeyword(feature, astNode, acceptor);                    
        } 
        else if (isRuleCall(feature) && feature.rule.ref) {
            if(isCSSClasses(astNode)){
                this.completionForCSSClasses(astNode, acceptor);
            }
            else {
                return this.completionForRule(astNode, feature.rule.ref, acceptor);
            }
        }
        else if (isCrossReference(feature) && astNode) {
            this.completionForCrossReference(feature, astNode, acceptor);
        }
    }
    completionForCSSClasses(astNode: CSSClasses, acceptor: CompletionAcceptor){
        let cssClasses = this.getCSSClasses();
        
        cssClasses.forEach(element => {
                acceptor(element, {kind: CompletionItemKind.Value, detail: 'CSS Class'});
        
        });
    }

    getCSSClasses(): string[] {
        
        const fileContent = fs.readFileSync(path.resolve(__dirname + '../../../src/assets/base.css'),'utf8');
        let regex = /(?<=\.)([a-zA-Z0-9]*([-]*[a-zA-Z0-9]*)*)/gm;
        let cssClasses = fileContent.match(regex);
        
        console.error(cssClasses);
        if(cssClasses == null) return [];
        
        return cssClasses;
    }
}