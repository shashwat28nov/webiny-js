import { locales } from "../I18NLocales";

export default {
    withTitleAndDescriptionFieldValidation: ({ contentModelGroupId }) => ({
        data: {
            name: "Product",
            description: "A simple model for product",
            group: contentModelGroupId,
            fields: [
                {
                    _id: "vqk-UApa0",
                    fieldId: "description",
                    type: "text",
                    label: {
                        values: [
                            {
                                locale: locales.en.id,
                                value: "description-en"
                            },
                            {
                                locale: locales.de.id,
                                value: "description-de"
                            }
                        ]
                    },
                    validation: [
                        {
                            name: "required",
                            message: {
                                values: [
                                    {
                                        locale: locales.en.id,
                                        value: "Value is required!!"
                                    },
                                    {
                                        locale: locales.de.id,
                                        value: "Wert erforderlich!!"
                                    }
                                ]
                            },
                            settings: {}
                        },
                        {
                            name: "maxLength",
                            message: {
                                values: [
                                    {
                                        locale: locales.en.id,
                                        value: "Value is too long."
                                    },
                                    {
                                        locale: locales.de.id,
                                        value: "Wert ist zu lang."
                                    }
                                ]
                            },
                            settings: {
                                value: "25"
                            }
                        },
                        {
                            name: "minLength",
                            message: {
                                values: [
                                    {
                                        locale: locales.en.id,
                                        value: "Value is too short."
                                    }
                                ]
                            },
                            settings: {
                                value: "10"
                            }
                        }
                    ]
                },
                {
                    _id: "vqk-UApa0",
                    fieldId: "title",
                    type: "text",
                    label: {
                        values: [
                            {
                                locale: locales.en.id,
                                value: "Title"
                            },
                            {
                                locale: locales.de.id,
                                value: "Titel"
                            }
                        ]
                    },
                    validation: [
                        {
                            name: "required",
                            message: {
                                values: [
                                    {
                                        locale: locales.en.id,
                                        value: "Value is required!!"
                                    },
                                    {
                                        locale: locales.de.id,
                                        value: "Wert erforderlich!!"
                                    }
                                ]
                            },
                            settings: {}
                        },
                        {
                            name: "maxLength",
                            message: {
                                values: [
                                    {
                                        locale: locales.en.id,
                                        value: "Value is too long."
                                    },
                                    {
                                        locale: locales.de.id,
                                        value: "Wert ist zu lang."
                                    }
                                ]
                            },
                            settings: {
                                value: "12"
                            }
                        },
                        {
                            name: "minLength",
                            message: {
                                values: [
                                    {
                                        locale: locales.en.id,
                                        value: "Value is too short."
                                    }
                                ]
                            },
                            settings: {
                                value: "6"
                            }
                        }
                    ]
                }
            ]
        }
    }),
    withMultipleValuesFieldValidation: ({ contentModelGroupId }) => ({
        data: {
            name: "Digital Product",
            description: "A simple model for digital product",
            group: contentModelGroupId,
            fields: [
                {
                    _id: "vqk-UApa0",
                    fieldId: "description",
                    type: "text",
                    label: {
                        values: [
                            {
                                locale: locales.en.id,
                                value: "description-en"
                            },
                            {
                                locale: locales.de.id,
                                value: "description-de"
                            }
                        ]
                    },
                    validation: [
                        {
                            name: "required",
                            message: {
                                values: [
                                    {
                                        locale: locales.en.id,
                                        value: "Value is required!!"
                                    },
                                    {
                                        locale: locales.de.id,
                                        value: "Wert erforderlich!!"
                                    }
                                ]
                            },
                            settings: {}
                        },
                        {
                            name: "maxLength",
                            message: {
                                values: [
                                    {
                                        locale: locales.en.id,
                                        value: "Value is too long."
                                    },
                                    {
                                        locale: locales.de.id,
                                        value: "Wert ist zu lang."
                                    }
                                ]
                            },
                            settings: {
                                value: "25"
                            }
                        },
                        {
                            name: "minLength",
                            message: {
                                values: [
                                    {
                                        locale: locales.en.id,
                                        value: "Value is too short."
                                    }
                                ]
                            },
                            settings: {
                                value: "10"
                            }
                        }
                    ]
                },
                {
                    _id: "vqk-UApa0",
                    fieldId: "title",
                    type: "text",
                    label: {
                        values: [
                            {
                                locale: locales.en.id,
                                value: "Title"
                            },
                            {
                                locale: locales.de.id,
                                value: "Titel"
                            }
                        ]
                    },
                    validation: [
                        {
                            name: "required",
                            message: {
                                values: [
                                    {
                                        locale: locales.en.id,
                                        value: "Value is required!!"
                                    },
                                    {
                                        locale: locales.de.id,
                                        value: "Wert erforderlich!!"
                                    }
                                ]
                            },
                            settings: {}
                        },
                        {
                            name: "maxLength",
                            message: {
                                values: [
                                    {
                                        locale: locales.en.id,
                                        value: "Value is too long."
                                    },
                                    {
                                        locale: locales.de.id,
                                        value: "Wert ist zu lang."
                                    }
                                ]
                            },
                            settings: {
                                value: "12"
                            }
                        },
                        {
                            name: "minLength",
                            message: {
                                values: [
                                    {
                                        locale: locales.en.id,
                                        value: "Value is too short."
                                    }
                                ]
                            },
                            settings: {
                                value: "6"
                            }
                        }
                    ]
                },
                {
                    _id: "vqk-UApa0",
                    fieldId: "tags",
                    type: "text",
                    label: {
                        values: [
                            {
                                locale: locales.en.id,
                                value: "tags-en"
                            },
                            {
                                locale: locales.de.id,
                                value: "tags-de"
                            }
                        ]
                    },
                    multipleValues: true,
                    validation: [
                        {
                            name: "required",
                            message: {
                                values: [
                                    {
                                        locale: locales.en.id,
                                        value: "Value is required."
                                    },
                                    {
                                        locale: locales.de.id,
                                        value: "Wert erforderlich."
                                    }
                                ]
                            },
                            settings: {}
                        }
                    ],
                    multipleValuesValidation: [
                        {
                            name: "required",
                            message: {
                                values: [
                                    {
                                        locale: locales.en.id,
                                        value: "List cannot be empty."
                                    },
                                    {
                                        locale: locales.de.id,
                                        value: "Wert erforderlich."
                                    }
                                ]
                            },
                            settings: {}
                        },
                        {
                            name: "maxLength",
                            message: {
                                values: [
                                    {
                                        locale: locales.en.id,
                                        value: "List is too long."
                                    },
                                    {
                                        locale: locales.de.id,
                                        value: "Wert ist zu lang."
                                    }
                                ]
                            },
                            settings: {
                                value: "5"
                            }
                        },
                        {
                            name: "minLength",
                            message: {
                                values: [
                                    {
                                        locale: locales.en.id,
                                        value: "List is too short."
                                    }
                                ]
                            },
                            settings: {
                                value: "2"
                            }
                        }
                    ]
                }
            ]
        }
    }),
    getValidationMessage: ({ error, fieldId }) => {
        return error.data.invalidFields[fieldId].data.invalidFields.values.data.invalidFields.value
            .message;
    },
    createProduct: {
        title: {
            values: [
                {
                    locale: locales.en.id,
                    value: "Test Pen"
                },
                {
                    locale: locales.de.id,
                    value: "Test Kugelschreiber"
                }
            ]
        },
        description: {
            values: [
                {
                    locale: locales.en.id,
                    value: "five"
                },
                {
                    locale: locales.de.id,
                    value: ""
                }
            ]
        }
    },
    createProductWithoutTitle: {
        title: {
            values: [
                {
                    locale: locales.en.id,
                    value: ""
                },
                {
                    locale: locales.de.id,
                    value: "Test Kugelschreiber"
                }
            ]
        },
        description: {
            values: [
                {
                    locale: locales.en.id,
                    value: "A simple product."
                },
                {
                    locale: locales.de.id,
                    value: "A simple product - in german."
                }
            ]
        }
    },
    createProductWithLongTitle: {
        title: {
            values: [
                {
                    locale: locales.en.id,
                    value: "Test title which is too long"
                },
                {
                    locale: locales.de.id,
                    value: "Test Kugelschreiber"
                }
            ]
        },
        description: {
            values: [
                {
                    locale: locales.en.id,
                    value: "A simple product."
                },
                {
                    locale: locales.de.id,
                    value: "A simple product - in german."
                }
            ]
        }
    },
    createProductWithShortTitleAndNoDescription: {
        title: {
            values: [
                {
                    locale: locales.en.id,
                    value: "Test"
                },
                {
                    locale: locales.de.id,
                    value: "Test Kugelschreiber"
                }
            ]
        },
        description: {
            values: [
                {
                    locale: locales.en.id,
                    value: ""
                },
                {
                    locale: locales.de.id,
                    value: "A simple product - in german."
                }
            ]
        }
    },
    createProductWithoutTitleAndDescriptionInOtherLocale: {
        title: {
            values: [
                {
                    locale: locales.en.id,
                    value: "Testing"
                },
                {
                    locale: locales.de.id,
                    value: ""
                }
            ]
        },
        description: {
            values: [
                {
                    locale: locales.en.id,
                    value: "A simple product."
                },
                {
                    locale: locales.de.id,
                    value: ""
                }
            ]
        }
    },
    createDigitalProductWithNoTags: {
        title: {
            values: [
                {
                    locale: locales.en.id,
                    value: "Testing"
                },
                {
                    locale: locales.de.id,
                    value: "Testing - de"
                }
            ]
        },
        description: {
            values: [
                {
                    locale: locales.en.id,
                    value: "A simple product."
                },
                {
                    locale: locales.de.id,
                    value: "A simple product. - de"
                }
            ]
        },
        tags: {
            values: [
                {
                    locale: locales.en.id,
                    value: []
                },
                {
                    locale: locales.de.id,
                    value: []
                }
            ]
        }
    },
    createDigitalProductWithOneTag: {
        title: {
            values: [
                {
                    locale: locales.en.id,
                    value: "Testing"
                },
                {
                    locale: locales.de.id,
                    value: "Testing - de"
                }
            ]
        },
        description: {
            values: [
                {
                    locale: locales.en.id,
                    value: "A simple product."
                },
                {
                    locale: locales.de.id,
                    value: "A simple product. - de"
                }
            ]
        },
        tags: {
            values: [
                {
                    locale: locales.en.id,
                    value: ["cool"]
                },
                {
                    locale: locales.de.id,
                    value: ["kool"]
                }
            ]
        }
    },
    createDigitalProductWithTags: {
        title: {
            values: [
                {
                    locale: locales.en.id,
                    value: "Testing"
                },
                {
                    locale: locales.de.id,
                    value: "Testing - de"
                }
            ]
        },
        description: {
            values: [
                {
                    locale: locales.en.id,
                    value: "A simple product."
                },
                {
                    locale: locales.de.id,
                    value: "A simple product. - de"
                }
            ]
        },
        tags: {
            values: [
                {
                    locale: locales.en.id,
                    value: ["cool", "coffee", ""]
                },
                {
                    locale: locales.de.id,
                    value: ["", "kaffee"]
                }
            ]
        }
    }
};
