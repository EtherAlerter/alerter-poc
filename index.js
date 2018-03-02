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

const dumpState = state => {
  console.log('State:');
  state.list.forEach(s => {
    console.log(`  Contract: ${s.contractAddress}`);
    console.log('  Accounts:');
    Object.keys(s.accounts).forEach(a => {
      console.log(`    ${a}: ${s.accounts[a].subscriptionId}`);
    });
  });
  console.log('*****')
};

const subscriptionListToMap = subscriptions => {
  return subscriptions.reduce((acc, s) => {
    return {
      ...acc,
      [s.contractAddress]: s
    };
  }, {});
};

const initializeState = (subscriptions, convertToMap) => {
  return {
    byAddress: convertToMap(subscriptions),
    list: subscriptions,
    allContracts: () => subscriptions.reduce((acc, s) => ([...acc, s.contractAddress]), []),
    allAccounts: () => subscriptions.reduce((acc, s) => ([...acc, ...Object.keys(s.accounts)]), [])
  };
};

const onEvent = state => (contractAddress, fromAccount, toAccount, amount) => {
  console.log(`Event received for contract ${contractAddress}: ${fromAccount} -> ${toAccount} = ${amount}`);
  if (state.byAddress[contractAddress].accounts[fromAccount]) {
    console.log(`  Firing event for ${fromAccount}`);
  } else if (state.byAddress[contractAddress].accounts[toAccount]) {
    console.log(`  Firing event for ${toAccount}`);
  } else {
    console.log(`  Ignoring.`);
  }
};

const onSubscribe = (state, subscribeToContractEvent) => (contractAddress, account, subscriptionId) => {
  console.log(`New subscription for ${contractAddress}[${account}]`);
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

const onUnsubscribe = state => (contractAddress, account) => {
  console.log(`Removing subscription for ${contractAddress}[${account}]`);
  const contract = state.byAddress[contractAddress];
  if (contract) {
    if (contract.accounts[account]) {
      console.log(`Unsubscribing account ${account} from contract ${contractAddress}`);
      delete contract.accounts[account];
      if (Object.keys(contract.accounts).length === 0) {
        console.log(`Removing contract ${contractAddress} with no further subscriptions`);
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

const state = initializeState(generateStartingSubscriptions(), subscriptionListToMap);
dumpState(state);

state.list.forEach(subscription => {
  subscribeToContractEvent(state, subscription.contractAddress, onEvent(state));
});

subscribeToControlMessages(state, onSubscribe(state, subscribeToContractEvent), onUnsubscribe(state));
