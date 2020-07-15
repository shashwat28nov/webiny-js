import React from "react";
import { Grid, Cell } from "@webiny/ui/Grid";
import { Input } from "@webiny/ui/Input";
import { Select } from "@webiny/ui/Select";
import { getPlugins } from "@webiny/plugins";
import { validation } from "@webiny/validation";
import {
    CmsFormFieldPatternValidatorPlugin,
    CmsEditorFieldValidatorPlugin
} from "@webiny/app-headless-cms/types";
import { FbFormFieldPatternValidatorPlugin } from "@webiny/app-form-builder/types";

export default {
    type: "cms-editor-field-validator",
    name: "cms-editor-field-validator-pattern",
    validator: {
        name: "pattern",
        label: "Pattern",
        description: "Entered value must match a specific pattern.",
        defaultMessage: "Invalid value.",
        defaultSettings: {
            preset: "custom"
        },
        renderSettings({ Bind, setValue, setMessage, data }) {
            const inputsDisabled = data.settings.preset !== "custom";
            const presetPlugins = getPlugins<CmsFormFieldPatternValidatorPlugin>(
                "cms-editor-field-validator-pattern"
            );

            // TODO: @ts-adrian neda mi da dolje posaljem
            const selectOptions: any = presetPlugins.map(item => (
                <option key={item.pattern.name} value={item.pattern.name}>
                    {item.pattern.label}
                </option>
            ));

            return (
                <Grid>
                    <Cell span={3}>
                        <Bind
                            name={"settings.preset"}
                            validators={validation.create("required")}
                            afterChange={value => {
                                if (value === "custom") {
                                    setMessage("Invalid value.");
                                    return;
                                }

                                setValue("settings.regex", null);
                                setValue("settings.flags", null);

                                const selectedPatternPlugin = presetPlugins.find(
                                    item => item.pattern.name === value
                                );

                                setMessage(selectedPatternPlugin.pattern.message);
                            }}
                        >
                            <Select label={"Preset"}>
                                <option value={"custom"}>Custom</option>
                                {selectOptions}
                            </Select>
                        </Bind>
                    </Cell>
                    <Cell span={7}>
                        <Bind name={"settings.regex"} validators={validation.create("required")}>
                            <Input
                                disabled={inputsDisabled}
                                label={"Regex"}
                                description={"Regex to test the value"}
                            />
                        </Bind>
                    </Cell>
                    <Cell span={2}>
                        <Bind name={"settings.flags"} validators={validation.create("required")}>
                            <Input
                                disabled={inputsDisabled}
                                label={"Flags"}
                                description={"Regex flags"}
                            />
                        </Bind>
                    </Cell>
                </Grid>
            );
        },
        validate: (value, validator) => {
            if (!value) {
                // return true;
                return Promise.resolve(true);
            }

            const { settings } = validator;

            let pattern;
            if (settings.preset === "custom") {
                pattern = settings;
            } else {
                const patternPlugin = getPlugins<FbFormFieldPatternValidatorPlugin>(
                    "form-field-validator-pattern"
                ).find(item => item.pattern.name === settings.preset);
                if (patternPlugin) {
                    pattern = patternPlugin.pattern;
                }
            }

            if (!pattern) {
                return true;
            }

            return new RegExp(pattern.regex, pattern.flags).test(value);
        }
    }
} as CmsEditorFieldValidatorPlugin;
