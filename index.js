import {
  randomNumber,
  randomAddress,
  selectRandomContract,
  generateStartingSubscriptions
} from './testing';
import { subscribeToControlMessages } from './control';
import {
  subscribeToContractEvent,
  unsubscribeFromContractEvent
} from './ethereum';
import {
  initializeState,
  dumpState
} from './state';
import { logger } from './log';

const log = logger('ALERT');

const onEvent = ({ state, log }) => (contractAddress, fromAccount, toAccount, amount) => {
  log.info(`Event received for contract ${contractAddress}: Transfer(${fromAccount}, ${toAccount}, ${amount})`);
  if (state.byAddress[contractAddress].accounts[fromAccount]) {
    log.info(`  Firing event for ${fromAccount}`);
  } else if (state.byAddress[contractAddress].accounts[toAccount]) {
    log.info(`  Firing event for ${toAccount}`);
  } else {
    log.info(`  Ignoring.`);
  }
};

const onSubscribe = ({ state, subscribeToContractEvent, log }) => (contractAddress, account, subscriptionId) => {
  log.info(`Adding subscription for ${contractAddress}[${account}]`);
  if (state.byAddress[contractAddress]) {
    state.byAddress[contractAddress].accounts[account] = { subscriptionId };
  } else {
    const newSubscription = {
      contractAddress,
      accounts: {
        [account]: { subscriptionId }
      }
    };
    state.list = [...state.list, newSubscription];
    state.byAddress[contractAddress] = newSubscription;
    subscribeToContractEvent(state, contractAddress, onEvent(state));
  }
  dumpState(state);
};

const onUnsubscribe = ({ state, log }) => (contractAddress, account) => {
  log.info(`Removing subscription for ${contractAddress}[${account}]`);
  const contract = state.byAddress[contractAddress];
  if (contract) {
    if (contract.accounts[account]) {
      log.info(`Unsubscribing account ${account} from contract ${contractAddress}`);
      delete contract.accounts[account];
      if (Object.keys(contract.accounts).length === 0) {
        log.info(`Removing contract ${contractAddress} with no further subscriptions`);
        unsubscribeFromContractEvent(contractAddress);
        delete state.byAddress[contractAddress];
        state.list = state.list.reduce((acc, s) => {
          if (s.contractAddress === contractAddress) {
            return acc;
          } else {
            return [...acc, s];
          }
        }, []);
      }
    } else {
      throw `No such account ${account} subscribed to ${contractAddress}`;
    }
  } else {
    throw `No such contract ${contractAddress}`;
  }
  dumpState(state);
};

const startingSubscriptions = generateStartingSubscriptions();
const state = initializeState(startingSubscriptions);

dumpState(state);
state.list.forEach(subscription => {
  subscribeToContractEvent(state, subscription.contractAddress, onEvent({ state, log }));
});

subscribeToControlMessages(state, onSubscribe({ state, subscribeToContractEvent, log }), onUnsubscribe({ state, log }));
