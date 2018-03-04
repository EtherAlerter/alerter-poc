const logger = scope => {
  return {
    info: m => {
      console.log(`${scope}: ${m}`);
    },
    error: m => {
      console.error(`${scope}: ${m}`);
    }
  };
};

module.exports = {
  logger
};
