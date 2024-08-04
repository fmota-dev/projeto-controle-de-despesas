// Constants
const LOCAL_STORAGE_KEY = "transactions";
const DATE_FORMAT = "DD/MM/YYYY";

// DOM Elements
const transactionsUl = document.querySelector("#transactions");
const inputError = Array.from(document.querySelectorAll(".input-error"));
const incomeDisplay = document.querySelector("#money-plus");
const expenseDisplay = document.querySelector("#money-minus");
const balanceDisplay = document.querySelector("#balance");
const form = document.querySelector("#form");
const inputTransactionName = document.querySelector("#name");
const inputTransactionAmount = document.querySelector("#amount");
const inputMonth = document.querySelector("#month");

// Helper Functions
const getCurrentMonth = () => dayjs().format("MM");

const formatCurrency = (value) =>
	new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
		value,
	);

const filterTransactionsByMonth = (transactions, month) =>
	transactions.filter(({ date }) => date.split("/")[1] === month);

const calculateTotal = (transactionsAmounts) =>
	transactionsAmounts.reduce((acc, val) => acc + val, 0).toFixed(2);

const calculateIncome = (transactionsAmounts) =>
	transactionsAmounts
		.filter((val) => val > 0)
		.reduce((acc, val) => acc + val, 0)
		.toFixed(2);

const calculateExpenses = (transactionsAmounts) =>
	transactionsAmounts
		.filter((val) => val < 0)
		.reduce((acc, val) => acc + val, 0)
		.toFixed(2);

// Local Storage Functions
const getLocalStorage = () =>
	JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)) || [];

const updateLocalStorage = (transactions) =>
	localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(transactions));

// Update Functions
const updateBalanceValues = (transactionsList) => {
	const amounts = transactionsList.map(({ amount }) => amount);
	balanceDisplay.textContent = formatCurrency(calculateTotal(amounts));
	incomeDisplay.textContent = formatCurrency(calculateIncome(amounts));
	expenseDisplay.textContent = formatCurrency(calculateExpenses(amounts));
};

const addTransactionIntoDOM = ({ amount, name, id }) => {
	const operator = amount < 0 ? "-" : "+";
	const CSSClass = amount < 0 ? "minus" : "plus";
	const amountWithoutOperator = Math.abs(amount);

	const li = document.createElement("li");
	li.classList.add(CSSClass);
	li.innerHTML = `
        <div class='operation'>
            <div>
                <span>${dayjs().format(DATE_FORMAT)}</span>
                <span>${name}</span> 
            </div>
            <span>${operator} ${formatCurrency(amountWithoutOperator)}</span>
        </div>
        <button class="delete-btn" onClick="removeTransaction(${id})">X</button>
    `;
	transactionsUl.append(li);
};

const updateTransactionsList = (filteredTransactions) => {
	transactionsUl.innerHTML = "";
	filteredTransactions.forEach(addTransactionIntoDOM);
};

// Event Handlers
const handleFormSubmit = (event) => {
	event.preventDefault();

	const transactionName = inputTransactionName.value.trim();
	const transactionAmount = inputTransactionAmount.value.trim();

	clearErrorMessages();

	if (!transactionName) {
		showError(0, "Por favor, preencha o campo de nome.");
		return;
	}
	if (!transactionAmount) {
		showError(1, "Por favor, preencha o campo de valor.");
		return;
	}

	addToTransactionsArray(transactionName, transactionAmount);
	updateLocalStorage(transactions);
	init(); // Reinitialize to refresh the list
	cleanInputs();
};

const handleMonthChange = (event) => {
	const selectedMonth = event.target.value;
	const filteredTransactions = filterTransactionsByMonth(
		transactions,
		selectedMonth,
	);
	updateTransactionsList(filteredTransactions);
	updateBalanceValues(filteredTransactions);
};

// Utility Functions
const addToTransactionsArray = (name, amount) => {
	const newTransaction = {
		id: generateID(),
		name,
		amount: Number(amount),
		date: dayjs().format(DATE_FORMAT),
	};
	transactions.push(newTransaction);
	console.log("Added transaction:", newTransaction); // Debugging line
};

const removeTransaction = (id) => {
	transactions = transactions.filter((transaction) => transaction.id !== id);
	updateLocalStorage(transactions);
	init(); // Reinitialize to refresh the list
};

const cleanInputs = () => {
	inputTransactionName.value = "";
	inputTransactionAmount.value = "";
};

const clearErrorMessages = () => {
	for (const error of inputError) {
		error.classList.remove("input-error");
		error.textContent = "";
	}
};

const showError = (index, message) => {
	inputError[index].classList.add("input-error");
	inputError[index].textContent = message;
};

const generateID = () => Math.round(Math.random() * 1000);

// Initialization
const init = () => {
	const currentMonth = getCurrentMonth();
	inputMonth.value = currentMonth;
	transactions = getLocalStorage();
	console.log("Transactions on init:", transactions); // Debugging line
	const filteredTransactions = filterTransactionsByMonth(
		transactions,
		currentMonth,
	);
	updateTransactionsList(filteredTransactions);
	updateBalanceValues(filteredTransactions);
};

// Event Listeners
form.addEventListener("submit", handleFormSubmit);
inputMonth.addEventListener("change", handleMonthChange);

// Initialize the application
init();
