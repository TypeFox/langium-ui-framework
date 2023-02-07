import { ValidationAcceptor, ValidationChecks } from "langium";
import type { SimpleUiServices } from "./simple-ui-module"; 
import { SimpleUiAstType } from "./generated/ast";

export function registerValidationChecks(services: SimpleUiServices) {
    const registry = services.validation.ValidationRegistry;
    const validator = services.validation.ValidationRegistry;
    const checks: ValidationChecks<SimpleUiAstType> = {
        
    }
    registry.register(checks, validator);
}

export class SimpleUiValidator {

}