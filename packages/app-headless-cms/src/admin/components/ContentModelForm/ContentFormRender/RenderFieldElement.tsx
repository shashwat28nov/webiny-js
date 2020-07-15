import React, { useRef, useCallback, cloneElement, useState } from "react";
import {
    CmsEditorField,
    CmsEditorFieldRendererPlugin,
    CmsEditorContentModel,
    CmsEditorFieldValidatorPlugin
} from "@webiny/app-headless-cms/types";
import get from "lodash.get";
import { i18n } from "@webiny/app/i18n";
import getValue from "./functions/getValue";
import setValue from "./functions/setValue";
import { getValidators, getValidationResult } from "./functions/getValidators";
import Label from "./components/Label";
import { useI18N } from "@webiny/app-i18n/hooks/useI18N";

const t = i18n.ns("app-headless-cms/admin/components/content-form");

const RenderFieldElement = (props: {
    field: CmsEditorField;
    Bind: any;
    locale: any;
    contentModel: CmsEditorContentModel;
    renderPlugins: CmsEditorFieldRendererPlugin[];
    validatorPlugins: CmsEditorFieldValidatorPlugin[];
}) => {
    const i18n = useI18N();
    const {
        renderPlugins,
        validatorPlugins,
        field,
        Bind: BaseFormBind,
        locale,
        contentModel
    } = props;
    const renderPlugin = renderPlugins.find(
        plugin => plugin.renderer.rendererName === get(field, "renderer.name")
    );

    const memoizedBindComponents = useRef({});

    const getBind = useCallback(
        (index = -1) => {
            const memoKey = field.fieldId + field.multipleValues + index + locale;
            if (memoizedBindComponents.current[memoKey]) {
                return memoizedBindComponents.current[memoKey];
            }

            // const name = field.fieldId;
            const name = index >= 0 ? `${field.fieldId}.${index}` : field.fieldId;

            let validators,
                defaultValue = undefined;
            let multipleValuesValidators = [];

            if (field.multipleValues) {
                defaultValue = [];

                multipleValuesValidators = getValidators({
                    validation: field.multipleValuesValidation,
                    validatorPlugins,
                    I18NGetValue: i18n.getValue,
                    locale,
                    valueExtractor: value => {
                        return i18n.getValue(value, locale);
                    }
                });

                if (index >= 0) {
                    validators = getValidators({
                        validation: field.validation,
                        validatorPlugins,
                        I18NGetValue: i18n.getValue,
                        locale,
                        valueExtractor: value => {
                            return i18n.getValue(value, locale)[index];
                        }
                    });
                }
            } else {
                validators = getValidators({
                    validation: field.validation,
                    validatorPlugins,
                    I18NGetValue: i18n.getValue,
                    locale,
                    valueExtractor: value => {
                        return i18n.getValue(value, locale);
                    }
                });
            }
            const allValidators = [];

            if (Array.isArray(multipleValuesValidators)) {
                allValidators.push(...multipleValuesValidators);
            }
            if (Array.isArray(validators)) {
                allValidators.push(...validators);
            }

            memoizedBindComponents.current[memoKey] = function Bind({ children }) {
                const [isValid, setIsValid] = useState(true);
                const [isValidMultiValues, setIsValidMultiValues] = useState(true);
                const [validationMessage, setValidationMessage] = useState(null);

                return (
                    <BaseFormBind
                        name={name}
                        validators={index >= 0 ? validators : multipleValuesValidators}
                        defaultValue={defaultValue}
                    >
                        {bind => {
                            const value = getValue({ bind, locale, field, index });
                            const onChange = value =>
                                setValue({ value, bind, locale, field, index });

                            const props = {
                                ...bind,
                                value,
                                onChange
                            };

                            // Multiple-values functions below.
                            if (field.multipleValues) {
                                if (index >= 0) {
                                    props.removeValue = () => {
                                        if (index >= 0) {
                                            let value = getValue({
                                                bind,
                                                locale,
                                                field,
                                                index: -1
                                            });
                                            value = [
                                                ...value.slice(0, index),
                                                ...value.slice(index + 1)
                                            ];

                                            setValue({ value, bind, locale, field, index: -1 });
                                        }
                                    };
                                } else {
                                    props.appendValue = newValue => onChange([...value, newValue]);
                                    props.prependValue = newValue => onChange([newValue, ...value]);
                                    props.appendValues = newValues =>
                                        onChange([...value, ...newValues]);
                                }
                            }
                            // Multiple-values validation below
                            if (false && field.multipleValues && multipleValuesValidators) {
                                const promises = multipleValuesValidators.map(validator =>
                                    getValidationResult({ value: bind.value, validator })
                                );
                                Promise.all(promises).then(validationResults => {
                                    if (Array.isArray(validationResults)) {
                                        setIsValidMultiValues(
                                            validationResults.every(r => r.isValid === true)
                                        );
                                    }
                                });
                                // Reset `validation`
                                if (!isValidMultiValues) {
                                    props.checkMultipleValuesValidation = true;
                                }
                            }

                            // Check validation for individual field, in case of `multipleValues`
                            // We need this to identify the `invalid` field, not all fields.
                            if (false && field.multipleValues && validators) {
                                const promises: any[] = validators.map(validator =>
                                    getValidationResult({ value: bind.value, validator })
                                );
                                Promise.all(promises).then(validationResults => {
                                    if (Array.isArray(validationResults)) {
                                        setIsValid(
                                            validationResults.every(r => r.isValid === true)
                                        );
                                        // Get first validation message
                                        const validation = validationResults.find(r => r.message);
                                        if (
                                            validation &&
                                            validation.message !== validationMessage
                                        ) {
                                            setValidationMessage(validation.message);
                                        }
                                    }
                                });
                                // Reset `validation`
                                if (isValid) {
                                    props.validation = {
                                        isValid: null,
                                        message: null,
                                        results: null
                                    };
                                } else {
                                    props.validation = {
                                        isValid: false,
                                        message: validationMessage,
                                        results: null
                                    };
                                }
                            }

                            if (typeof children === "function") {
                                return children(props);
                            }

                            return cloneElement(children, props);
                        }}
                    </BaseFormBind>
                );
            };

            return memoizedBindComponents.current[memoKey];
        },
        [field.fieldId, locale]
    );

    if (!renderPlugin) {
        return t`Cannot render "{fieldName}" field - field renderer missing.`({
            fieldName: <strong>{field.fieldId}</strong>
        });
    }

    return renderPlugin.renderer.render({ field, getBind, Label, contentModel, locale });
};

export default RenderFieldElement;
