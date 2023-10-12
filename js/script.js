"use strict";

import currencies from '././allConvert.js';

document.addEventListener('DOMContentLoaded', function () {
    const listConvertFrom = document.getElementById('from-currency');
    const listConvertTo = document.getElementById('to-currency');
    
    currencies.forEach(currency => {
        const option = document.createElement('option');
        option.value = currency.value;
        option.text = currency.name;
        listConvertFrom.appendChild(option);

        const optionTo = document.createElement('option');
        optionTo.value = currency.value;
        optionTo.text = currency.name;
        listConvertTo.appendChild(optionTo);
    });
});

document.addEventListener('DOMContentLoaded', function () {
    const amountInput = document.getElementById('amount');
    const fromCurrencySelect = document.getElementById('from-currency');
    const toCurrencySelect = document.getElementById('to-currency');
    const convertButton = document.getElementById('convert');
    const convertedAmountSpan = document.getElementById('converted-amount');

    amountInput.addEventListener('input', function () {
        const enteredValue = parseFloat(amountInput.value);
        if (enteredValue < 0) {
            // Якщо введено від'ємне значення, змінемо його на додатнє
            amountInput.value = Math.abs(enteredValue);
        }
    });

    let timer = null; // Змінна для таймера
    let timeLeft = 0; // Залишений час в секундах

    const disabledButtonStyle = "cursor: not-allowed;";

    function startTimer() {
        convertButton.disabled = true;
        convertButton.textContent = `Зачекайте (${timeLeft} сек)`;

        timer = setInterval(function () {
            timeLeft--;
            convertButton.textContent = `Зачекайте (${timeLeft} сек)`;

            if (timeLeft <= 0) {
                clearInterval(timer);
                convertButton.disabled = false;
                convertButton.textContent = 'Конвертувати';

                // Стиль курсора
                convertButton.style = "";
            }
        }, 1000);
    }

    convertButton.addEventListener('click', function () {
        const amount = parseFloat(amountInput.value);
        const fromCurrency = fromCurrencySelect.value;
        const toCurrency = toCurrencySelect.value;

        if (isNaN(amount)) {
            alert('Введіть коректну суму для конвертації.');
            return;
        }

        if (fromCurrency === toCurrency) {
            convertedAmountSpan.textContent = amount.toFixed(3);
            return;
        }

        // Отримати курс продажу для валют
        fetch('https://api.monobank.ua/bank/currency')
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then((data) => {
                const rateSell = getRate(data, fromCurrency, toCurrency);

                if (rateSell !== null) {
                    const convertedAmount = amount * rateSell;
                    convertedAmountSpan.textContent = convertedAmount.toFixed(3);
                } else {
                    alert('Не вдалося знайти курс конвертації.');
                }

                timeLeft = 60;
                startTimer();

                convertButton.style = disabledButtonStyle;
            })
            .catch((error) => {
                console.error('Помилка при отриманні курсів валют:', error);
                alert('Помилка при отриманні курсів валют. Спробуйте ще раз пізніше.');
            });
    });

    // Функція для отримання курсу
    function getRate(data, fromCurrency, toCurrency) {
        let firstCoof = null;
        let secondCoof = null;
        
        for (const rate of data) {

            if(fromCurrency == toCurrency){

            }

            if (fromCurrency == rate.currencyCodeA) {
                if (firstCoof != null) {
                    continue;
                } else {
                    if (rate.rateCross === 0) {
                        firstCoof = rate.rateBuy;
                    } else {
                        firstCoof = rate.rateCross;
                    }
                    console.log(1, firstCoof);
                }
            } else if (fromCurrency == '980') {
                firstCoof = 1;
            }
    
            if (toCurrency == rate.currencyCodeA) {
                if (secondCoof != null) {
                    continue;
                } else {
                    if (rate.rateCross === 0) {
                        secondCoof = rate.rateSell;
                    } else {
                        secondCoof = rate.rateCross;
                    }
                    console.log(2, secondCoof);
                }
            } else if (toCurrency == '980') {
                secondCoof = 1;
            }
        }
        return firstCoof / secondCoof;
    }
});


