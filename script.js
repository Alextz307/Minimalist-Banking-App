'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Old Data
// const account1 = {
//   owner: 'Jonas Schmedtmann',
//   movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
//   interestRate: 1.2, // %
//   pin: 1111,
// };

// const account2 = {
//   owner: 'Jessica Davis',
//   movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
//   interestRate: 1.5,
//   pin: 2222,
// };

// const account3 = {
//   owner: 'Steven Thomas Williams',
//   movements: [200, -200, 340, -300, -20, 50, 400, -460],
//   interestRate: 0.7,
//   pin: 3333,
// };

// const account4 = {
//   owner: 'Sarah Smith',
//   movements: [430, 1000, 700, 50, 90],
//   interestRate: 1,
//   pin: 4444,
// };

// const accounts = [account1, account2, account3, account4];

// New Data
const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2020-07-26T17:01:17.194Z',
    '2023-09-10T23:36:17.929Z',
    '2023-09-14T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

//////////////////////////////
// Functions

// Default "welcome" message
const defaultMessage = 'Log in to get started';

// Length of a seesion without resetting
const logOutTime = 300;

// Global variable that represents the countdown timer
let timer;

// Remaining time until the timer stops
let remTime;

// Adds a 0 if needed in front of a date
const addZero = function (date) {
  return `${date}`.padStart(2, 0);
};

const getMovDateString = function (dateString, locale) {
  // Function that computes the number of days that passed between 2 days
  const getDaysPassed = (date1, date2) => Math.abs(date1 - date2) / (1000 * 60 * 60 * 24);

  // Get the date represented by the given string
  const date = new Date(dateString);

  // Days passed since the movement
  const daysPassed = Math.round(getDaysPassed(date, new Date()));

  // The string to return
  let returnStr;

  if (daysPassed === 0) {
    returnStr = 'Today';
  } else if (daysPassed === 1) {
    returnStr = 'Yesterday';
  } else if (daysPassed < 7) {
    returnStr = `${daysPassed} days ago`;
  } else {
    // const day = addZero(date.getDate());
    // const month = addZero(date.getMonth() + 1);
    // const year = date.getFullYear();
    // returnStr = `${day}/${month}/${year}`;
    returnStr = new Intl.DateTimeFormat(locale).format(date);
  }

  return returnStr;
};

// Formats number given a required zone and currency
const formatNumber = function (num, locale, cur) {
  const options = {
    style: 'currency',
    currency: cur,
  };

  return new Intl.NumberFormat(locale, options).format(num);
};

// Generates HTML for a movement
const genMovementHTML = function (mov, i, dateString, locale, cur) {
  // Type of movement
  const type = mov > 0 ? 'deposit' : 'withdrawal';

  // Generate date format for the application
  const movDateString = getMovDateString(dateString, locale);

  const html = `  
    <div class="movements__row">
      <div class="movements__type movements__type--${type}">${i + 1} ${type}</div>
      <div class="movements__date">${movDateString}</div>
      <div class="movements__value">${formatNumber(mov.toFixed(2), locale, cur)}</div>
    </div>
  `;

  return html;
};

// Add a new movement HTML
const addMovementHTML = function (mov, i, dateString, locale, cur) {
  // Generate HTML for this movement
  const movementHTML = genMovementHTML(mov, i, dateString, locale, cur);

  // Add HTML at the beginning of the container
  containerMovements.insertAdjacentHTML('afterbegin', movementHTML);
};

// Displays all initial movements
const displayMovements = function (account, sorted) {
  // Clear the current content from the container
  containerMovements.innerHTML = '';

  // Sort array of number in increasing order
  const arr = sorted ? account.movements.slice().sort((a, b) => a - b) : account.movements;

  // Display each movement
  arr.forEach(function (mov, i) {
    addMovementHTML(mov, i, account.movementsDates[i], account.locale, account.currency);
  });
};

// Computes and displays the balance for the person who is currently logged in
const calcDisplayBalance = function (account) {
  account.balance = account.movements.reduce((acc, mov) => acc + mov, 0);
  labelBalance.textContent = `${formatNumber(
    account.balance.toFixed(2),
    account.locale,
    account.currency
  )}`;
};

// Computes and displays the summary for the person who's logged in
const calcDisplaySummary = function (account) {
  const sumIn = account.movements.filter(mov => mov > 0).reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = `${formatNumber(sumIn.toFixed(2), account.locale, account.currency)}`;

  const sumOut = account.movements.filter(mov => mov < 0).reduce((acc, mov) => acc - mov, 0);
  labelSumOut.textContent = `${formatNumber(sumOut.toFixed(2), account.locale, account.currency)}`;

  const interest = account.movements
    .filter(mov => mov > 0)
    .map(mov => (mov * account.interestRate) / 100)
    .filter(interest => interest >= 1)
    .reduce((acc, interest) => acc + interest, 0);
  labelSumInterest.textContent = `${formatNumber(
    interest.toFixed(2),
    account.locale,
    account.currency
  )}`;
};

// Compute the usernames for all the account owners
const createUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};
createUsernames(accounts);

// Add movement to the back of an account's movements array
const addMovement = function (account, mov) {
  account.movements.push(mov);
  account.movementsDates.push(new Date().toISOString());
};

const updateUI = function (sorted) {
  // Display movements
  displayMovements(currAcc, sorted);

  // Calculate and display balance
  calcDisplayBalance(currAcc);

  // Calculate and display summary
  calcDisplaySummary(currAcc);
};

// Formats current date in specified format
const formatCurrDateTime = function (locale) {
  const options = {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  };

  return new Intl.DateTimeFormat(locale, options).format(new Date());
};

// Display UI and write a certain message
const displayUI = function (message, locale) {
  containerApp.style.opacity = 100;
  labelWelcome.textContent = message;
  labelDate.textContent = formatCurrDateTime(locale);
};

// Hide UI and write a certain message
const hideUI = function (message) {
  containerApp.style.opacity = 0;
  labelWelcome.textContent = message;
};

// Clear a single input field
const clearField = function (field) {
  field.value = '';
  field.blur();
};

// Clear two input fields
const clearFields = function (field1, field2) {
  clearField(field1);
  clearField(field2);
};

// Delete a user account from the array of accounts
const deleteUser = function (username) {
  // Find user's index in the accounts array based on his username
  const userIndex = accounts.findIndex(acc => acc.username === username);

  // Delete the required entry from the array
  accounts.splice(userIndex, 1);
};

// Convert number of seconds to (minutes, seconds)
const convertSeconds = function (seconds) {
  return [Math.floor(seconds / 60), seconds % 60];
};

// Handles the logout timer behaviour
const startLogOutTimer = function () {
  remTime = logOutTime;

  const tick = function () {
    const [minutes, seconds] = convertSeconds(remTime);

    labelTimer.textContent = `${addZero(minutes)}:${addZero(seconds)}`;

    if (remTime === 0) {
      hideUI(defaultMessage);
      clearInterval(timer);
    }

    remTime -= 1;
  };

  if (timer) {
    clearInterval(timer);
  }

  tick();
  timer = setInterval(tick, 1000);
};

// Object coresponding to the currently logged in account
let currAcc;

// Current state of the movements
let sorted;

////////////////////////////////////
// Event handlers

// Login
btnLogin.addEventListener('click', function (e) {
  // Prevent from submitting and refreshing the page
  e.preventDefault();

  currAcc = accounts.find(acc => acc.username === inputLoginUsername.value);

  if (currAcc?.pin === Number(inputLoginPin.value)) {
    // Clear login fields
    clearFields(inputLoginUsername, inputLoginPin);

    // Display UI and welcome message
    displayUI(`Welcome back, ${currAcc.owner.split(' ').at(0)}`, currAcc.locale);

    // Start the timer
    startLogOutTimer();

    // By default movements are not shown sorted
    sorted = false;

    // Update UI
    updateUI(sorted);
  } else {
    // Clear login fields
    clearFields(inputLoginUsername, inputLoginPin);

    // Hide UI and display display warning message
    hideUI('Wrong credentials!');
  }
});

// Transfer
btnTransfer.addEventListener('click', function (e) {
  // Prevent from submitting and refreshing the page
  e.preventDefault();

  // Compute transfer data
  const recAcc = accounts.find(acc => acc.username === inputTransferTo.value);
  const amount = Number(inputTransferAmount.value);

  // Clear transfer fields
  clearFields(inputTransferTo, inputTransferAmount);

  if (recAcc && 0 < amount && amount <= currAcc.balance && recAcc?.username !== currAcc.username) {
    setTimeout(function () {
      // Add new movements
      addMovement(currAcc, -amount);
      addMovement(recAcc, amount);

      // Update UI for the new movements
      updateUI(sorted);
    }, 1000);

    // Reset the timer
    startLogOutTimer();
  }
});

// Loan
btnLoan.addEventListener('click', function (e) {
  // Prevent from submitting and refreshing the page
  e.preventDefault();

  const amount = Math.floor(inputLoanAmount.value);

  if (
    amount > 0 &&
    currAcc.movements.filter(mov => mov > 0).some(deposit => deposit > amount * 0.1)
  ) {
    setTimeout(function () {
      // Add the new movement
      addMovement(currAcc, amount);

      // Update UI for the new movement
      updateUI(sorted);
    }, 1000);

    // Reset the timer
    startLogOutTimer();
  }

  // Clear loan field
  clearField(inputLoanAmount);
});

// Close account
btnClose.addEventListener('click', function (e) {
  // Prevent from submitting and refreshing the page
  e.preventDefault();

  if (
    inputCloseUsername.value === currAcc.username &&
    Number(inputClosePin.value) === currAcc.pin
  ) {
    // Delete user from the accounts data using his username
    deleteUser(currAcc.username);

    // Hide UI and display display default message in order to log out the user
    hideUI(defaultMessage);
  }

  // Clear 'close account' fields
  clearFields(inputCloseUsername, inputClosePin);
});

// Sort
btnSort.addEventListener('click', function (e) {
  // Prevent from submitting and refreshing the page
  e.preventDefault();

  // Flip the state
  sorted ^= 1;

  // Display the movements information in the required order
  displayMovements(currAcc, sorted);
});
