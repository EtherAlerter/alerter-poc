const hexCharacters = 'abcdef0123456789';
const randomNumber = n => Math.floor(Math.random() * n);
const randomItem = items => items[randomNumber(items.length)];
const randomHexCharacter = () => hexCharacters[randomNumber(hexCharacters.length)];
const randomAddress = () => {
  let result = '0x';
  for (let i = 0; i < 10; i++) {
    result = result + randomHexCharacter();
  }
  return result;
};

const generateRandomAccount = () => {
  if (randomNumber(2) === 0) {
    return {
      subscriptionId: randomNumber(1000),
      rule: () => randomNumber(2) === 0    
    };
  } else {
    return {
      rule: () => randomNumber(2) === 0
    };
  }
};

const generateRandomAccounts = n => {
  let result = {};
  for (let i = 0; i < n; i++) {
    result[randomAddress()] = generateRandomAccount()
  }
  return result;
};

const generateRandomSubscription = () => {
  return {
    contractAddress: randomAddress(),
    accounts: generateRandomAccounts(randomNumber(5) + 1)
  }
};

const generateStartingSubscriptions = () => {
  let results = [];
  const count = randomNumber(10) + 5;
  for (let i = 0; i < count; i++) {
    results = [
      ...results,
      generateRandomSubscription()
    ];
  }
  return results;
};

const selectRandomContract = state => () => {
  const allContracts = state.allContracts();
  return allContracts[randomNumber(allContracts.length)];
};

const selectRandomSubscription = state => () => {
  const allContracts = state.allContracts();
  const contract = state.list[randomNumber(state.list.length)];
  const account = Object.keys(contract.accounts)[randomNumber(Object.keys(contract.accounts).length)];
  return [contract.contractAddress, account];
};

module.exports = {
  randomNumber,
  randomItem,
  randomAddress,
  selectRandomContract,
  selectRandomSubscription,
  generateStartingSubscriptions
};
