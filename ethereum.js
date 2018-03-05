import { randomNumber, randomItem, randomAddress } from './testing';
import { logger } from './log';

const log = logger('ETH');

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
  randomNumber,
  log
}) => (state, contractAddress, callback) => {
  log.info(`Subscribing to contract events on ${contractAddress}...`);
  subscriptionTable[contractAddress] = setInterval(generateRandomEvent(state, contractAddress, callback), randomNumber(5000));
};

const unsubscribeFromContractEvent = ({ subscriptionTable, log }) => contractAddress => {
  log.info(`Unsubscribing from contract events on ${contractAddress}...`);
  clearInterval(subscriptionTable[contractAddress]);
  delete subscriptionTable[contractAddress];
};

const getAccountBalance = () => {};
const getSubscriptionInfo = () => {
  return {
    source: 'ethereum',
    type: 'email',
    address: 'joe@there.net'
  };
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
    randomNumber,
    log
  }),
  unsubscribeFromContractEvent: unsubscribeFromContractEvent({ subscriptionTable, log }),
  getAccountBalance,
  getSubscriptionInfo
};
