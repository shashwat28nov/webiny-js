import * as React from "react";
import Files from "react-butterfiles";
import { ButtonPrimary, ButtonIcon } from "@webiny/ui/Button";
import { Icon } from "@webiny/ui/Icon";
import File from "./File";
import { useQuery, useMutation, useApolloClient, Query } from "react-apollo";
import { FilesRules } from "react-butterfiles";
import { LIST_FILES, CREATE_FILE, GET_FILE_SETTINGS } from "./graphql";
import getFileTypePlugin from "./getFileTypePlugin";
import { get, debounce, cloneDeep } from "lodash";
import getFileUploader from "./getFileUploader";
import outputFileSelectionError from "./outputFileSelectionError";
import DropFilesHere from "./DropFilesHere";
import NoResults from "./NoResults";
import FileDetails from "./FileDetails";
import LeftSidebar from "./LeftSidebar";
import BottomInfoBar from "./BottomInfoBar";
import { OverlayLayout } from "@webiny/app-admin/components/OverlayLayout";
import { useSnackbar } from "@webiny/app-admin/hooks/useSnackbar";
import { Scrollbar } from "@webiny/ui/Scrollbar";
import { css } from "emotion";
import styled from "@emotion/styled";
import { useHotkeys } from "react-hotkeyz";
import { useFileManager } from "./FileManagerContext";
import { i18n } from "@webiny/app/i18n";
import { ReactComponent as SearchIcon } from "./icons/round-search-24px.svg";
import { ReactComponent as UploadIcon } from "./icons/round-cloud_upload-24px.svg";

const t = i18n.ns("app-admin/file-manager/file-manager-view");

const style = {
    draggingFeedback: css({
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        opacity: 0.5,
        background: "white",
        zIndex: 100
    }),
    leftDrawer: {
        header: css({
            textAlign: "center",
            fontSize: 18,
            padding: 10,
            fontWeight: 600,
            color: "var(--mdc-theme-on-surface)"
        })
    }
};

const InputSearch = styled("div")({
    backgroundColor: "var(--mdc-theme-on-background)",
    position: "relative",
    height: 32,
    padding: 3,
    width: "100%",
    borderRadius: 2,
    "> input": {
        border: "none",
        fontSize: 14,
        width: "calc(100% - 10px)",
        height: "100%",
        marginLeft: 50,
        backgroundColor: "transparent",
        outline: "none",
        color: "var(--mdc-theme-text-primary-on-background)"
    }
});

const searchIcon = css({
    "&.mdc-button__icon": {
        color: "var(--mdc-theme-text-secondary-on-background)",
        position: "absolute",
        width: 24,
        height: 24,
        left: 15,
        top: 7
    }
});

const FileListWrapper = styled("div")({
    float: "right",
    display: "inline-block",
    width: "calc(100vw - 270px)",
    height: "100%"
});

const FileList = styled("div")({
    width: "100%",
    display: "grid",
    /* define the number of grid columns */
    gridTemplateColumns: "repeat( auto-fill, minmax(220px, 1fr) )",
    marginBottom: 95
});

type FileManagerViewProps = {
    onChange: Function;
    onClose: Function;
    files?: FilesRules;
    multiple: boolean; // Does not affect <Files> component, it always allows multiple selection.
    accept: Array<string>;
    maxSize: number | string;
    multipleMaxCount: number;
    multipleMaxSize: number | string;
};

function renderFile(props) {
    const { file } = props;
    const plugin = getFileTypePlugin(file);
    return (
        <File {...props} key={file.src}>
            {plugin.render({ file })}
        </File>
    );
}

const renderEmpty = ({ hasPreviouslyUploadedFiles, browseFiles }) => {
    if (hasPreviouslyUploadedFiles) {
        return <NoResults />;
    }
    return <DropFilesHere empty onClick={browseFiles} />;
};

function FileManagerView(props: FileManagerViewProps) {
    const {
        onClose,
        onChange,
        accept,
        multiple,
        maxSize,
        multipleMaxCount,
        multipleMaxSize
    } = props;

    const {
        selected,
        toggleSelected,
        dragging,
        setDragging,
        uploading,
        setUploading,
        showFileDetails,
        showingFileDetails,
        queryParams,
        setQueryParams,
        hasPreviouslyUploadedFiles,
        setHasPreviouslyUploadedFiles
    } = useFileManager();

    const { useRef, useCallback } = React;

    const { showSnackbar } = useSnackbar();

    const searchOnChange = useCallback(
        // @ts-ignore
        debounce(search => setQueryParams({ search }), 500),
        []
    );

    const toggleTag = useCallback(async ({ tag, queryParams }) => {
        const finalTags = Array.isArray(queryParams.tags) ? [...queryParams.tags] : [];

        if (finalTags.includes(tag)) {
            finalTags.splice(finalTags.indexOf(tag), 1);
        } else {
            finalTags.push(tag);
        }

        setQueryParams({ ...queryParams, tags: finalTags });
    }, []);

    const refreshOnScroll = useCallback(
        // @ts-ignore
        debounce(({ scrollFrame, fetchMore }) => {
            if (scrollFrame.top > 0.9) {
                // @ts-ignore // TODO: @adrian - what is `current` ?
                if (!gqlQuery.current) {
                    return;
                }
                // @ts-ignore // TODO: @adrian - what is `current` ?
                const { data } = gqlQuery.current.getQueryResult();
                const nextPage = get(data, "files.listFiles.meta.nextPage");
                nextPage &&
                    fetchMore({
                        variables: { page: nextPage },
                        updateQuery: (prev, { fetchMoreResult }) => {
                            if (!fetchMoreResult) {
                                return prev;
                            }

                            const next = { ...fetchMoreResult };

                            next.files.listFiles.data = [
                                ...prev.files.listFiles.data,
                                ...fetchMoreResult.files.listFiles.data
                            ];

                            return next;
                        }
                    });
            }
        }, 500),
        []
    );

    const getFileUploadErrorMessage = useCallback(e => {
        if (typeof e === "string") {
            const match = e.match(/Message>(.*?)<\/Message/);
            if (match) {
                const [, message] = match;
                return message;
            }

            return e;
        }
        return e.message;
    }, []);

    const updateCacheAfterCreateFile = (cache, newFile) => {
        const newFileData = get(newFile, "data.files.createFile.data");

        const data = cloneDeep(cache.readQuery({ query: LIST_FILES, variables: queryParams }));
        data.files.listFiles.data.unshift(newFileData);

        cache.writeQuery({
            query: LIST_FILES,
            variables: queryParams,
            data
        });
    };

    const getFileDetailsFile = useCallback(function getFileDetailsFile({ src, list }) {
        return list.find(item => item.src === src);
    }, []);

    useHotkeys({
        zIndex: 50,
        keys: {
            esc: onClose
        }
    });

    const searchInput = useRef();

    const apolloClient = useApolloClient();

    const gqlQuery = useQuery(LIST_FILES, {
        variables: queryParams,
        onCompleted: response => {
            const list = get(response, "files.listFiles.data") || [];
            if (hasPreviouslyUploadedFiles === null) {
                setHasPreviouslyUploadedFiles(list.length > 0);
            }
        }
    });

    const { data, fetchMore } = gqlQuery;

    const list = get(data, "files.listFiles.data") || [];
    const [createFile] = useMutation(CREATE_FILE, { update: updateCacheAfterCreateFile });
    const uploadFile = async files => {
        setUploading(true);
        const list = Array.isArray(files) ? files : [files];

        const errors = [];
        await Promise.all(
            list.map(async file => {
                try {
                    const response = await getFileUploader()(file, { apolloClient });
                    await createFile({ variables: { data: response } });
                } catch (e) {
                    errors.push({ file, e });
                }
            })
        );

        if (!hasPreviouslyUploadedFiles) {
            setHasPreviouslyUploadedFiles(true);
        }

        setUploading(false);

        if (errors.length > 0) {
            // We wait 750ms, just for everything to settle down a bit.
            return setTimeout(() => {
                showSnackbar(
                    <>
                        {t`One or more files were not uploaded successfully:`}
                        <ol>
                            {errors.map(({ file, e }) => (
                                <li key={file.name}>
                                    <strong>{file.name}</strong>: {getFileUploadErrorMessage(e)}
                                </li>
                            ))}
                        </ol>
                    </>
                );
            }, 750);
        }

        // We wait 750ms, just for everything to settle down a bit.
        setTimeout(() => showSnackbar(t`File upload complete.`), 750);
    };

    const settingsQuery = useQuery(GET_FILE_SETTINGS);
    const settings = get(settingsQuery.data, "files.getSettings.data") || {};
    return (
        <Files
            multiple
            maxSize={settings.uploadMaxFileSize ? settings.uploadMaxFileSize + "b" : maxSize}
            multipleMaxSize={multipleMaxSize}
            multipleMaxCount={multipleMaxCount}
            accept={accept}
            onSuccess={files => uploadFile(files.map(file => file.src.file))}
            onError={errors => {
                const message = outputFileSelectionError(errors);
                showSnackbar(message);
            }}
        >
            {({ getDropZoneProps, browseFiles, validateFiles }) => (
                <OverlayLayout
                    {...getDropZoneProps({
                        onDragEnter: () => hasPreviouslyUploadedFiles && setDragging(true),
                        onExited: onClose
                    })}
                    barLeft={
                        <InputSearch>
                            <Icon className={searchIcon} icon={<SearchIcon />} />
                            <input
                                ref={searchInput}
                                onChange={e => searchOnChange(e.target.value)}
                                placeholder={t`Search by filename or tags`}
                            />
                        </InputSearch>
                    }
                    barRight={
                        selected.length > 0 ? (
                            <ButtonPrimary
                                disabled={uploading}
                                onClick={async () => {
                                    await onChange(multiple ? selected : selected[0]);

                                    onClose();
                                }}
                            >
                                {t`Select`} {multiple && `(${selected.length})`}
                            </ButtonPrimary>
                        ) : (
                            // @ts-ignore
                            <ButtonPrimary onClick={browseFiles} disabled={uploading}>
                                <ButtonIcon icon={<UploadIcon />} />
                                {t`Upload...`}
                            </ButtonPrimary>
                        )
                    }
                >
                    <>
                        {dragging && hasPreviouslyUploadedFiles && (
                            <DropFilesHere
                                // @ts-ignore TODO: @adrian - className is never rendered?!
                                className={style.draggingFeedback}
                                onDragLeave={() => setDragging(false)}
                                onDrop={() => setDragging(false)}
                            />
                        )}

                        <FileDetails
                            validateFiles={validateFiles}
                            uploadFile={uploadFile}
                            file={getFileDetailsFile({
                                list,
                                src: showingFileDetails
                            })}
                        />

                        <LeftSidebar
                            queryParams={queryParams}
                            toggleTag={tag => toggleTag({ tag, queryParams })}
                        />

                        <FileListWrapper data-testid={"fm-list-wrapper"}>
                            <Scrollbar
                                onScrollFrame={scrollFrame =>
                                    refreshOnScroll({
                                        scrollFrame,
                                        fetchMore
                                    })
                                }
                            >
                                <FileList>
                                    {list.length
                                        ? list.map(file =>
                                              renderFile({
                                                  uploadFile,
                                                  file,
                                                  showFileDetails: () => showFileDetails(file.src),
                                                  selected: selected.find(
                                                      current => current.src === file.src
                                                  ),
                                                  onSelect: async () => {
                                                      if (multiple) {
                                                          toggleSelected(file);
                                                          return;
                                                      }

                                                      await onChange(file);
                                                      onClose();
                                                  }
                                              })
                                          )
                                        : renderEmpty({
                                              hasPreviouslyUploadedFiles,
                                              browseFiles
                                          })}
                                </FileList>
                            </Scrollbar>
                            <BottomInfoBar accept={accept} uploading={uploading} />
                        </FileListWrapper>
                    </>
                </OverlayLayout>
            )}
        </Files>
    );
}

FileManagerView.defaultProps = {
    multiple: false,
    maxSize: "10mb",
    multipleMaxSize: "100mb",
    multipleMaxCount: 100
};

export default FileManagerView;
