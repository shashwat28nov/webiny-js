import {
    CmsEditorFieldValidatorPlugin,
    CmsEditorFieldValidator
} from "@webiny/app-headless-cms/types";

type getValidatorsParams = {
    validatorPlugins: CmsEditorFieldValidatorPlugin[];
    validation: CmsEditorFieldValidator[];
    index: number;
    I18NGetValue: (value: any, locale?: string) => any;
    locale: string;
    useArray?: boolean;
};

export const getValidators = ({
    validatorPlugins,
    validation,
    index,
    I18NGetValue,
    locale,
    useArray
}: getValidatorsParams) => {
    return validation
        .map(item => {
            const validatorPlugin = validatorPlugins.find(
                plugin => plugin.validator.name === item.name
            );

            if (!validatorPlugin || typeof validatorPlugin.validator.validate !== "function") {
                return;
            }

            return async value => {
                // TODO: get value by index
                let realValue = I18NGetValue(value, locale);
                if (!useArray) {
                    realValue = realValue[index];
                }

                let isInvalid;
                try {
                    const result = await validatorPlugin.validator.validate(realValue, item);
                    isInvalid = result === false;
                } catch (e) {
                    isInvalid = true;
                }
                // If value for selected locale exist use that
                // otherwise get value for default locale
                const errorMessage =
                    I18NGetValue(item.message, locale) || I18NGetValue(item.message);

                if (isInvalid) {
                    throw new Error(errorMessage || "Invalid value.");
                }
            };
        })
        .filter(Boolean);
};

export const getValidationResult = async ({ value, validator }) => {
    let isValid = true;
    try {
        await validator(value);
    } catch (error) {
        isValid = false;
    }
    return isValid;
};
