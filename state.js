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

const initializeState = ({ subscriptionListToMap }) => subscriptions => {
  return {
    byAddress: subscriptionListToMap(subscriptions),
    list: subscriptions,
    allContracts: () => subscriptions.reduce((acc, s) => ([...acc, s.contractAddress]), []),
    allAccounts: () => subscriptions.reduce((acc, s) => ([...acc, ...Object.keys(s.accounts)]), [])
  };
};

module.exports = {
  initializeState: initializeState({ subscriptionListToMap }),
  dumpState
};
