import React, { useState } from 'react';

const OptionModal = ({ product, onClose, onConfirm }) => {
    const [selectedOptions, setSelectedOptions] = useState({});

    const handleSingle = (optionName, choice) => {
        setSelectedOptions((prev) => ({
            ...prev,
            [optionName]: [choice],
        }));
    };

    const handleMultiple = (optionName, choice, checked) => {
        setSelectedOptions((prev) => {
            const prevChoices = prev[optionName] || [];
            return {
                ...prev,
                [optionName]: checked ? [...prevChoices, choice] : prevChoices.filter((c) => c.label !== choice.label),
            };
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg p-6 w-[90%] max-w-md max-h-[90vh] overflow-auto shadow-xl">
                <h2 className="text-xl font-bold mb-4">Chọn tuỳ chọn cho {product.name}</h2>

                {product.options?.map((opt, idx) => (
                    <div key={idx} className="mb-4">
                        <p className="font-semibold mb-2">{opt.name}</p>

                        {opt.type === 'single'
                            ? opt.choices.map((choice, i) => (
                                  <label key={i} className="block">
                                      <input
                                          type="radio"
                                          name={opt.name}
                                          onChange={() => handleSingle(opt.name, choice)}
                                          className="mr-2"
                                      />
                                      {choice.label} (+{choice.price.toLocaleString()}₫)
                                  </label>
                              ))
                            : opt.choices.map((choice, i) => (
                                  <label key={i} className="block">
                                      <input
                                          type="checkbox"
                                          onChange={(e) => handleMultiple(opt.name, choice, e.target.checked)}
                                          className="mr-2"
                                      />
                                      {choice.label} (+{choice.price.toLocaleString()}₫)
                                  </label>
                              ))}
                    </div>
                ))}

                <div className="flex justify-end gap-3 pt-4">
                    <button onClick={onClose} className="text-gray-600 hover:underline">
                        Huỷ
                    </button>
                    <button
                        onClick={() => {
                            const extraPrice = Object.values(selectedOptions)
                                .flat()
                                .reduce((sum, c) => sum + c.price, 0);
                            const finalProduct = {
                                ...product,
                                selectedOptions,
                                price: product.price + extraPrice,
                            };
                            onConfirm(finalProduct);
                        }}
                        className="bg-primary text-white px-4 py-2 rounded"
                    >
                        Xác nhận
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OptionModal;
