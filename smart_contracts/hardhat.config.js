//https://eth-ropsten.alchemyapi.io/v2/b_MhJmbyX7cfri-pYFuOvEO91h_F5Ggu

require('@nomiclabs/hardhat-waffle');

module.exports = {
  solidity: '0.8.0',
  networks: {
    ropsten: {
      url: 'https://eth-ropsten.alchemyapi.io/v2/b_MhJmbyX7cfri-pYFuOvEO91h_F5Ggu',
      accounts: ['a12dc0991d55e12c71c7b1aecec2d965a8c3569c818ad75b1c3968fd30776f0b']
    }
  }
}