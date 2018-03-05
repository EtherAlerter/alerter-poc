import { logger } from './log';

const log = logger('NOTIFY');

const notify = ({ log }) => (contractAddress, account, subscriptionInfo) => {
  log.info(`${contractAddress}[${account}]`);
  log.info(JSON.stringify(subscriptionInfo));
};

module.exports = {
  notify: notify({ log })
};
