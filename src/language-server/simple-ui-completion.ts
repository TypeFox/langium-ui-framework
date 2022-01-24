import { AbstractElement, AstNode, CompletionAcceptor, DefaultCompletionProvider, isKeyword, isRuleCall, isCrossReference, NameProvider, LangiumServices, Assignment} from "langium";
import fs from "fs"
import path from "path"
import { CompletionItemKind } from "vscode-languageserver-types";
import { isCSSClasses } from "./generated/ast";

export class SimpleUICompletionProvider extends DefaultCompletionProvider{
    protected readonly nameProvider: NameProvider;
    constructor(services:LangiumServices){
        super(services);
        this.nameProvider = services.references.NameProvider;
    }


    protected completionFor(astNode: AstNode | undefined, feature: AbstractElement, acceptor: CompletionAcceptor): void {
        if (isKeyword(feature)) {          
            this.completionForKeyword(feature, astNode, acceptor);                    
        } 
        else if (isRuleCall(feature) && feature.rule.ref) {
            if (isCSSClasses(astNode as AstNode) && (feature.$container as Assignment).feature === 'name' ){
                this.completionForCSSClasses(astNode as AstNode, acceptor);
            }
            else {
                return this.completionForRule(astNode, feature.rule.ref, acceptor);
            }
        }
        else if (isCrossReference(feature) && astNode) {
            this.completionForCrossReference(feature, astNode, acceptor);
        }

    }
    completionForCSSClasses(astNode: AstNode, acceptor: CompletionAcceptor){
        let cssClasses = this.getCSSClasses();
        cssClasses.forEach(element => {
            acceptor(element, { kind: CompletionItemKind.Value, detail: 'CSS Class'});
        });
    }

    getCSSClasses(): string[] {
        
        const fileContent = fs.readFileSync(path.resolve(__dirname + '../../../src/assets/base.css'),'utf8');
        let regex = /(?<=\.).*?(?=[\s]?{)/gm;
        let cssClasses = fileContent.match(regex);
        
        console.error(cssClasses);
        if(cssClasses == null) return [];
        
        return cssClasses;
    }
}