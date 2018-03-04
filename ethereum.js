import { randomNumber, randomItem, randomAddress } from './testing';

const subscriptionTable = {};

const pickRandomAccountFromContract = ({ randomItem }) => (state, contractAddress) => {
  const contract = state.byAddress[contractAddress];
  return randomItem(Object.keys(contract.accounts));
};

const generateRandomEvent = ({
  pickRandomAccountFromContract,
  randomItem,
  randomAddress,
  randomNumber
}) => (state, contractAddress, callback) => () => {
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

const subscribeToContractEvent = ({
  subscriptionTable,
  generateRandomEvent,
  randomNumber
}) => (state, contractAddress, callback) => {
  console.log(`ETH: Subscribing to contract events on ${contractAddress}...`);
  subscriptionTable[contractAddress] = setInterval(generateRandomEvent(state, contractAddress, callback), randomNumber(5000));
};

const unsubscribeFromContractEvent = ({ subscriptionTable }) => contractAddress => {
  console.log(`ETH: Unsubscribing from contract events on ${contractAddress}...`);
  clearInterval(subscriptionTable[contractAddress]);
  delete subscriptionTable[contractAddress];
};

module.exports = {
  subscribeToContractEvent: subscribeToContractEvent({
    subscriptionTable,
    generateRandomEvent: generateRandomEvent({
      pickRandomAccountFromContract: pickRandomAccountFromContract({ randomItem }),
      randomItem,
      randomAddress,
      randomNumber
    }),
    randomNumber
  }),
  unsubscribeFromContractEvent: unsubscribeFromContractEvent({ subscriptionTable })
};
