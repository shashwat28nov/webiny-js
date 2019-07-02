import React, { useEffect, useCallback, useRef } from "react";
import { Input } from "webiny-ui/Input";
import { Grid, Cell } from "webiny-ui/Grid";
import { camelCase } from "lodash";
import { useFormEditor } from "webiny-app-forms/admin/components/FormEditor/Context";
import { getPlugins } from "webiny-plugins";
import { I18NInput, useI18N } from "webiny-app-i18n/components";

const GeneralTab = ({ field, form }) => {
    const { Bind, setValue } = form;
    const inputRef = useRef(null);
    const { getFields } = useFormEditor();
    const { translate } = useI18N();

    useEffect(() => {
        inputRef.current && inputRef.current.focus();
    }, []);

    const afterChangeLabel = useCallback(value => {
        setValue("fieldId", camelCase(translate(value)));
    }, []);

    const uniqueFieldIdValidator = useCallback(fieldId => {
        const existingField = getFields().find(field => field.fieldId === fieldId);
        if (!existingField) {
            return;
        }

        if (existingField.id !== field.id) {
            throw new Error("Please enter a unique ID");
        }
    });

    const fieldPlugin = getPlugins("form-editor-field-type").find(
        item => item.fieldType.id === field.type
    );

    let additionalSettings = null;
    if (typeof fieldPlugin.fieldType.renderSettings === "function") {
        additionalSettings = fieldPlugin.fieldType.renderSettings({
            Bind,
            form,
            afterChangeLabel,
            uniqueFieldIdValidator
        });
    }

    return (
        <>
            <Grid>
                <Cell span={6}>
                    <Bind name={"label"} validators={["required"]} afterChange={afterChangeLabel}>
                        <I18NInput label={"Label"} inputRef={inputRef} />
                    </Bind>
                </Cell>
                <Cell span={6}>
                    <Bind name={"fieldId"} validators={["required", uniqueFieldIdValidator]}>
                        <Input label={"Field ID"} />
                    </Bind>
                </Cell>
                <Cell span={12}>
                    <Bind name={"helpText"}>
                        <I18NInput label={"Help text"} description={"Help text (optional)"} />
                    </Bind>
                </Cell>
            </Grid>
            {additionalSettings}
        </>
    );
};

export default GeneralTab;