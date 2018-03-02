import { randomNumber, randomItem, randomAddress } from './testing';

const allSubscriptions = {};

const pickRandomAccountFromContract = (state, contractAddress) => {
  const contract = state.byAddress[contractAddress];
  return randomItem(Object.keys(contract.accounts));
};

const generateRandomEvent = (state, contractAddress, callback) => () => {
  switch (randomItem(['fromSubscribed', 'toSubscribed', 'none'])) {
    case 'fromSubscribed':
      callback(contractAddress, pickRandomAccountFromContract(state, contractAddress), randomAddress(), randomNumber(100000));
      break;
    case 'toSubscribed':
      callback(contractAddress, randomAddress(), pickRandomAccountFromContract(state, contractAddress), randomNumber(100000));
      break;
    case 'none':
      callback(contractAddress, randomAddress(), randomAddress(), randomNumber(100000));
      break;
  }
};

const subscribeToContractEvent = (subscriptionTable, generateEvent) => (state, contractAddress, callback) => {
  console.log(`Subscribing to contract events on ${contractAddress}...`);
  subscriptionTable[contractAddress] = setInterval(generateEvent(state, contractAddress, callback), randomNumber(5000));
};

const unsubscribeFromContractEvent = subscriptionTable => contractAddress => {
  console.log(`Unsubscribing from contract events on ${contractAddress}...`);
  clearInterval(subscriptionTable[contractAddress]);
  delete subscriptionTable[contractAddress];
};

module.exports = {
  subscribeToContractEvent: subscribeToContractEvent(allSubscriptions, generateRandomEvent),
  unsubscribeFromContractEvent: unsubscribeFromContractEvent(allSubscriptions)
};
