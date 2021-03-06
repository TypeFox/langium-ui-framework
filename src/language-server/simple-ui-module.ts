import { createDefaultModule, createDefaultSharedModule, DefaultSharedModuleContext, inject, LangiumServices, LangiumSharedServices, Module, PartialLangiumServices } from 'langium';
import { SimpleUiGeneratedModule, SimpleUIGeneratedSharedModule } from './generated/module';
import { SimpleUICompletionProvider } from './simple-ui-completion';
import { SimpleUiValidationRegistry } from './simple-ui-validator';

/**
 * Union of Langium default services and your custom services - use this as constructor parameter
 * of custom service classes.
 */
export type SimpleUiServices = LangiumServices

/**
 * Dependency injection module that overrides Langium default services and contributes the
 * declared custom services. The Langium defaults can be partially specified to override only
 * selected services, while the custom services must be fully specified.
 */
export const SimpleUiModule: Module<SimpleUiServices, PartialLangiumServices> = {
    validation: {
        ValidationRegistry: (injector) => new SimpleUiValidationRegistry(injector)
    },
    lsp: {
        completion: {
            CompletionProvider: (services) => new SimpleUICompletionProvider(services),
        },
    }
};

/**
 * Inject the full set of language services by merging three modules:
 *  - Langium default services
 *  - Services generated by langium-cli
 *  - Services specified in this file
 */
export function createSimpleUiServices(context?: DefaultSharedModuleContext): { shared: LangiumSharedServices, simpleUi: SimpleUiServices } {
    const shared = inject(
        createDefaultSharedModule(context),
        SimpleUIGeneratedSharedModule
    );
    const simpleUi = inject(
        createDefaultModule({ shared }),
        SimpleUiGeneratedModule,
        SimpleUiModule
    );
    shared.ServiceRegistry.register(simpleUi);
    return { shared, simpleUi };
}
