import { mdiContentSave, mdiPencil, mdiTrashCan } from '@mdi/js';
import { useTranslation } from 'next-i18next';
import { useEffect, useRef, useState } from 'react';
import { SketchPicker } from 'react-color';
import { useToasts } from 'react-toast-notifications';
import { Category } from '../../interfaces';
import instance from '../../lib/axiosInstance';
import Button from '../Button';
import Buttons from '../Buttons';
import CardBoxModal from '../CardBox/Modal';
import Pagination from '../Pagination';

const CategoryTable = (props) => {
    const { t } = useTranslation('common');
    const { addToast } = useToasts();
    const { data, meta, currentPage, setCurrentPage, refetch } = props;

    const [isDeleteModalActive, setIsDeleteModalActive] = useState<boolean>(false);
    const [deleteID, setDeleteID] = useState<number | null>(null);
    const [translationNames, setTranslationNames] = useState<Array<string>>(
        new Array(data?.length && data?.length > 0 ? data[0].Translations.length : 0).fill('')
    );
    const [displayColorPicker, setDisplayColorPicker] = useState<Array<boolean>>([false]);
    const [editableColor, setEditableColor] = useState<string>('');
    const [editables, setEditables] = useState<Array<boolean>>([false]);

    const perPage = meta?.limit || 5;

    const pickerRefs = new Array(data?.length || 0).fill(useRef(null));

    const numPages = Math.ceil((meta?.total || 0) / perPage);
    const pagesList = [];

    for (let i = 0; i < numPages; i++) {
        pagesList.push(i);
    }

    const handleDeleteCategory = () => {
        instance
            .delete(`/api/guilds/remove/${deleteID}`)
            .then(() => {
                addToast(t('category_deleted'), {
                    appearance: 'success',
                    autoDismiss: true,
                });

                refetch();
                setIsDeleteModalActive(false);
            })
            .catch((error) => {
                addToast(t('something_went_wrong'), {
                    appearance: 'error',
                    autoDismiss: true,
                });

                console.log(error.message);
                setIsDeleteModalActive(false);
            });
    };

    const handleColorPickerOpen = (index) => {
        const _displayColorPicker = new Array(displayColorPicker.length).fill(false);
        _displayColorPicker[index] = true;

        setDisplayColorPicker(_displayColorPicker);
    };

    const handleColorPickerClose = (event) => {
        for (const pickerRef of pickerRefs) {
            if (pickerRef.current && pickerRef.current.contains(event.target)) return;
        }

        setDisplayColorPicker(new Array(displayColorPicker.length).fill(false));
    };

    const handleChangeEditable = (index) => {
        if (editables.some((editable) => editable === true)) {
            addToast(t('one_category_at_a_time'), {
                appearance: 'warning',
                autoDismiss: true,
            });
            return;
        }

        const _editables = [...editables];
        _editables[index] = true;

        setTranslationNames(data[index].Translations.map((translation) => translation.Name));

        setEditableColor(data[index].Hex);

        setEditables(_editables);
    };

    const handleUpdateCategory = (index) => {
        const cityHexUpdateRequest = instance.patch(`/api/guilds/update/${data[index].ID}`, {
            Hex: editableColor,
        });

        const translatorUpdateRequests = data[index].Translations.map((trans, transIndex) =>
            instance
                .patch(`/api/guildstranslator/update?translationID=${trans.ID}`, {
                    Name: translationNames[transIndex],
                })
                .catch((error) => {
                    console.log(error);
                })
        );

        Promise.all([cityHexUpdateRequest, ...translatorUpdateRequests])
            .then((values) => {
                addToast(t('category_updated'), {
                    appearance: 'success',
                    autoDismiss: true,
                });

                refetch();

                const _editables = [...editables];
                _editables[index] = !_editables[index];

                setEditables(_editables);

                console.log(values);
            })
            .catch((error) => {
                addToast(t('something_went_wrong'), {
                    appearance: 'error',
                    autoDismiss: true,
                });

                const _editables = [...editables];
                _editables[index] = !_editables[index];

                setEditables(_editables);

                console.log(error.message);
            });
    };

    const goToPage = (page: number) => {
        setCurrentPage(page);

        // router.replace({
        //     pathname: router.pathname,
        //     query: {
        //         ...router.query,
        //         skip: 10 * (page - 1),
        //     },
        // });
    };

    useEffect(() => {
        setEditables(new Array(data?.length || 0).fill(false));
        setTranslationNames(
            new Array(data?.length && data?.length > 0 ? data[0].Translations.length : 0).fill('')
        );
        // setColors(data.map((category) => category.Hex));
        setDisplayColorPicker(new Array(data?.length || 0).fill(false));
    }, []);

    useEffect(() => {
        if (currentPage > numPages && numPages > 0) goToPage(numPages);
    }, [currentPage, numPages]);

    useEffect(() => {
        // add when mounted
        document.addEventListener('mouseup', handleColorPickerClose);

        // return function to be called when unmounted
        return () => {
            document.removeEventListener('mouseup', handleColorPickerClose);
        };
    }, []);

    return (
        <>
            <CardBoxModal
                title={t('please_confirm')}
                buttonColor="danger"
                buttonLabel={t('confirm')}
                isActive={isDeleteModalActive}
                onConfirm={handleDeleteCategory}
                onCancel={() => setIsDeleteModalActive(false)}
            >
                <p>{t('delete_category_confirm_description')}</p>
            </CardBoxModal>

            <table>
                <thead>
                    <tr>
                        <th>{t('id')}</th>
                        {/* <th>Name</th> */}
                        <th>{t('param')}</th>
                        <th>{t('hex')}</th>
                        <th />
                    </tr>
                </thead>
                <tbody>
                    {data?.map((category: Category, index: number) => (
                        <tr key={category.ID}>
                            <td data-label="ID">{category.ID}</td>
                            {/* <td data-label="Name">{category.Name}</td> */}
                            <td data-label="Translation">
                                {category.Translations.map((trans, transIndex) => (
                                    <div
                                        key={trans.ID}
                                        className="flex my-1 w-auto justify-start rounded-lg"
                                    >
                                        <div className="p-1 bg-slate-400 rounded-lg rounded-r-none w-8 text-center">
                                            {trans.Language}
                                        </div>
                                        {editables[index] ? (
                                            <input
                                                type="text"
                                                className="w-auto p-1 bg-slate-200 rounded-lg rounded-l-none border-none"
                                                value={
                                                    editables[index]
                                                        ? translationNames[transIndex]
                                                        : trans.Name
                                                }
                                                onChange={(e) => {
                                                    const _translationNames = [...translationNames];
                                                    _translationNames[transIndex] = e.target.value;
                                                    setTranslationNames(_translationNames);
                                                }}
                                            ></input>
                                        ) : (
                                            <div className="p-1 bg-slate-200 rounded-lg rounded-l-none border-none w-auto px-2">
                                                {trans.Name}
                                            </div>
                                        )}
                                        {/* {editables[index] && (
                      <>
                        <Button
                          color="danger"
                          outline
                          icon={mdiTrashCan}
                          className={`ml-2 ${
                            transIndex === category.Translations.length - 1 ? 'rounded-r-none' : ''
                          }`}
                          small
                        />
                        {transIndex === category.Translations.length - 1 && (
                          <Button
                            color="info"
                            outline
                            icon={mdiPlus}
                            className="rounded-l-none border-l-0"
                            small
                          />
                        )}
                      </>
                    )} */}
                                    </div>
                                ))}
                            </td>
                            <td
                                data-label="Hex"
                                className="flex items-center justify-start gap-2 lg:w-32"
                            >
                                <div className="flex my-1 w-auto justify-start rounded-md">
                                    <div
                                        className="w-8 relative cursor-pointer p-1 rounded-md rounded-r-none"
                                        style={{
                                            backgroundColor: editables[index]
                                                ? editableColor
                                                : category.Hex,
                                        }}
                                        onClick={() => handleColorPickerOpen(index)}
                                    >
                                        {displayColorPicker[index] && editables[index] ? (
                                            <div
                                                className="absolute top-6 z-10"
                                                ref={pickerRefs[index]}
                                            >
                                                <SketchPicker
                                                    color={
                                                        editables[index]
                                                            ? editableColor
                                                            : category.Hex
                                                    }
                                                    onChange={(color) =>
                                                        setEditableColor(color.hex)
                                                    }
                                                />
                                            </div>
                                        ) : null}
                                    </div>
                                    <div className="p-1 px-2 bg-slate-200 rounded-md rounded-l-none border-none w-auto">
                                        {editables[index]
                                            ? editableColor?.toUpperCase()
                                            : category.Hex?.toUpperCase()}
                                    </div>
                                </div>
                            </td>
                            <td className="before:hidden align-top lg:w-1 whitespace-nowrap">
                                <Buttons type="justify-start lg:justify-end" noWrap>
                                    <Button
                                        color="info"
                                        icon={editables[index] ? mdiContentSave : mdiPencil}
                                        onClick={
                                            editables[index]
                                                ? () => handleUpdateCategory(index)
                                                : () => handleChangeEditable(index)
                                        }
                                        small
                                    />
                                    <Button
                                        color="danger"
                                        icon={mdiTrashCan}
                                        onClick={() => {
                                            setDeleteID(category.ID);
                                            setIsDeleteModalActive(true);
                                        }}
                                        small
                                    />
                                </Buttons>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="p-3 lg:px-6 border-t border-gray-100 dark:border-slate-800">
                <div className="flex flex-col md:flex-row items-center justify-between py-3 md:py-0">
                    {/* <Buttons>
                        {pagesList.map((page) => (
                            <Button
                                key={page}
                                active={page === currentPage}
                                label={page + 1}
                                color={page === currentPage ? 'lightDark' : 'whiteDark'}
                                small
                                onClick={() => goToPage(page)}
                            />
                        ))}
                    </Buttons> */}
                    <Pagination currentPage={currentPage} numPages={numPages} goToPage={goToPage} />
                    <small className="mt-6 md:mt-0">
                        {t('pagination', { currentPage: currentPage, numPages })}
                    </small>
                </div>
            </div>
        </>
    );
};

export default CategoryTable;
