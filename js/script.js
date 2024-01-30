
import currencies from "../js/allconvert.js";

// Отримання даних з API та збереження їх у локальному сховищі
function fetchDataAndSaveToStorage() {
    fetch('https://api.monobank.ua/bank/currency')
        .then((response) => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then((data) => {
            // Збереження даних у локальному сховищі
            localStorage.setItem('currencyData', JSON.stringify(data));
        })
        .catch((error) => {
            console.error('Помилка при отриманні курсів валют:', error);
            alert('Помилка при отриманні курсів валют. Спробуйте ще раз пізніше.');
        });
}

setInterval(fetchDataAndSaveToStorage, 5 * 60 * 1000);

// Отримання курсу з локального сховища
function getCurrencyDataFromStorage() {
    const storedData = localStorage.getItem('currencyData');
    return storedData ? JSON.parse(storedData) : null;
}

// Перевірка, чи дані вже є в локальному сховищі перед викликом API
const currencyData = getCurrencyDataFromStorage();

if (!currencyData) {
    // Якщо дані відсутні, викликаємо API та зберігаємо їх у сховище
    fetchDataAndSaveToStorage();
}


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

    convertButton.addEventListener('click', function () {
        const amount = parseInt(amountInput.value);
        const fromCurrency = parseInt(fromCurrencySelect.value);
        const toCurrency = parseInt(toCurrencySelect.value);

        if (isNaN(amount)) {
            alert('Введіть коректну суму для конвертації.');
            return;
        }
        
        if (fromCurrency === toCurrency) {
            convertedAmountSpan.textContent = amount.toFixed(3);
            return;
        }

        const currencyData = getCurrencyDataFromStorage();

        if (currencyData) {
            const rateSells = getRate(currencyData, fromCurrency, toCurrency);

            if (rateSells !== null) {
                const convertedAmount = amount * rateSells;
                convertedAmountSpan.textContent = convertedAmount.toFixed(3);
            } else {
                alert('Не вдалося знайти курс конвертації.');
            }
        } else {
            alert('Дані про курси валют відсутні. Будь ласка, спробуйте пізніше.');
        }
    });

    // Функція для отримання курсу
    function getRate(data, fromCurrency, toCurrency) {
        let firstCoof = null;
        let secondCoof = null;
        
        
        for (const rate of data) {

            if (parseInt(fromCurrency) == rate.currencyCodeA) {
                if (firstCoof != null) {
                    continue;
                } else {
                    if (rate.rateCross == undefined) {
                        firstCoof = rate.rateBuy;
                    } else {
                        firstCoof = rate.rateCross;
                    }
                    console.log(1, firstCoof);
                }
            } else if (fromCurrency == 980) {
                firstCoof = 1;
            }

            if (parseInt(toCurrency) == rate.currencyCodeA) {
                if (secondCoof != null) {
                    continue;
                } else {
                    if (rate.rateCross == undefined) {
                        secondCoof = rate.rateSell;
                    } else {
                        secondCoof = rate.rateCross;
                    }
                    console.log(2, secondCoof);
                }
            } else if (toCurrency == 980) {
                secondCoof = 1;
            }
        }
        return firstCoof / secondCoof;
    }
});