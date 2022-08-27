# Setup

Install dependencies:

```shell
yarn init -y
yarn add --dev hardhat @nomiclabs/hardhat-waffle @nomiclabs/hardhat-ethers @vechain.energy/hardhat-thor @openzeppelin/contracts hardhat-jest-plugin nodemon
```

manually add `hardhat.config.js`:
```js
require("@nomiclabs/hardhat-waffle");
require('@vechain.energy/hardhat-thor')
require("hardhat-jest-plugin")

module.exports = {
  solidity: "0.8.4",
  networks: {
    vechain: {
      url: 'https://testnet.veblocks.net',
      privateKey: "0x80b97e2ecfab8b1c78100c418328e8a88624e3d19928ec791a8a51cdcf01f16f",
      delegateUrl: 'https://sponsor-testnet.vechain.energy/by/90'
    }
  }
};
```

init jest tests:
```shell
$ npx jest --init

The following questions will help Jest to create a suitable configuration for your project

✔ Would you like to use Jest when running "test" script in "package.json"? … no
✔ Would you like to use Typescript for the configuration file? … no
✔ Choose the test environment that will be used for testing › node
✔ Do you want Jest to add coverage reports? … no
✔ Which provider should be used to instrument code for coverage? › v8
✔ Automatically clear mock calls, instances and results before every test? … yes

📝  Configuration file created at /jest.config.js
```

add deploy helper script to `scripts/deploy-contract.js`:
```js
const hre = require('hardhat')

async function main () {
  // get contract names to deploy
  const contractNames = process.argv.slice(2)

  if (!contractNames.length) {
    throw new Error('No contract names for deployment given')
  }

  for (const contractName of contractNames) {
    console.log(`[${contractName}] Deploying Contract `)

    // get contract to deploy
    const Contract = await hre.thor.getContractFactory(contractName)

    // deploy and wait for result
    const deployedContract = await Contract.deploy()
    await deployedContract.deployed()

    console.log(`[${contractName}] Transaction Id: ${deployedContract.deployTransaction.hash}`)
    console.log(`[${contractName}] Contract is now available at ${deployedContract.address}\n`)
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })

```

add helper commands to `package.json`:
```json
  "scripts": { 
    "build": "hardhat compile",
    "test": "hardhat test:jest",
    "test:watch": "nodemon -e sol --exec 'hardhat test:jest --watch'",
    "deploy": "node scripts/deploy-contract.js"
  }
```

# Content

```shell
contracts
├── Factory.sol
├── Factory.test.js
└── NFT.sol
```

# Commands

* `yarn build` to compile contract
* `yarn test` to run tests
* `yarn test:watch` to run tests again when something changes
* `yarn deploy Factory` to deploy Factory contract


# Example

## Deploy

```shell
$ yarn deploy Factory
yarn run v1.22.17
$ node scripts/deploy-contract.js Factory
[Factory] Deploying Contract 
[Factory] Transaction Id: 0xb816a783fd68d89153a5e9910ae8a1e4c294e1c56874dddf6cf44e9e541750d0
[Factory] Contract is now available at 0x23E128ADE86FAcF027453b8631Fa18A322A25E7B
```

## Test

Test `createContract("NFT Contract", "Symbol")` via vechain.energy API:

```shell
$ curl -X POST https://sponsor-testnet.vechain.energy/by/115/transaction \
  -H "X-API-Key: gqxao258sg.65fdb6ea8d8f634080fb65322f3170fed920b7dc4adc3f805ec023de07b27282" \
  -H "Content-Type: application/json" \
  -d '{"clauses": [ "0x23E128ADE86FAcF027453b8631Fa18A322A25E7B.createContract(string NFT Contract, string Symbol)" ]}'

{"id":"0xee209e969c7019837854805db8b070a1e4817e0963dbbcb4865dee387c488402","url":"https://vethor-node-test.vechaindev.com/transactions/0xee209e969c7019837854805db8b070a1e4817e0963dbbcb4865dee387c488402?pending=true"}
```

Read created contracts owned by the deployer address via vechain.energy API using `listContractsFor(0x00a4e31340ca8565c65e047f050145094b0fbb8d)`:

```shell
$ curl https://call.api.vechain.energy/test/0x23E128ADE86FAcF027453b8631Fa18A322A25E7B/listContractsFor%20(address%200x00a4e31340ca8565c65e047f050145094b0fbb8d)%20returns(address[]) -s | jq
```

```json
[
  "0xf76953d55A7fdf81602Dc4f6b0116b93723C62Cc"
]
```

Read transaction details:
```shell
$ curl https://vethor-node-test.vechaindev.com/transactions/0xee209e969c7019837854805db8b070a1e4817e0963dbbcb4865dee387c488402/receipt -s | jq
```

```json
{
  "gasUsed": 2110069,
  "gasPayer": "0x95a11309b38ba0d5c4c7ff93ea4a43fa9e420c52",
  "paid": "0x1b7d20dfb95c4a4b5",
  "reward": "0x83f23765135497cf",
  "reverted": false,
  "meta": {
    "blockID": "0x00c89dd8fd2d28d4ac0cd3106af9be215c978b83979d329d9c5a0db21188dc54",
    "blockNumber": 13147608,
    "blockTimestamp": 1661507430,
    "txID": "0xee209e969c7019837854805db8b070a1e4817e0963dbbcb4865dee387c488402",
    "txOrigin": "0x00a4e31340ca8565c65e047f050145094b0fbb8d"
  },
  "outputs": [
    {
      "contractAddress": null,
      "events": [
        {
          "address": "0xf76953d55a7fdf81602dc4f6b0116b93723c62cc",
          "topics": [
            "0xb35bf4274d4295009f1ec66ed3f579db287889444366c03d3a695539372e8951"
          ],
          "data": "0x00000000000000000000000023e128ade86facf027453b8631fa18a322a25e7b"
        },
        {
          "address": "0xf76953d55a7fdf81602dc4f6b0116b93723c62cc",
          "topics": [
            "0x8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0",
            "0x0000000000000000000000000000000000000000000000000000000000000000",
            "0x00000000000000000000000023e128ade86facf027453b8631fa18a322a25e7b"
          ],
          "data": "0x"
        },
        {
          "address": "0x23e128ade86facf027453b8631fa18a322a25e7b",
          "topics": [
            "0x2d49c67975aadd2d389580b368cfff5b49965b0bd5da33c144922ce01e7a4d7b"
          ],
          "data": "0x00000000000000000000000000a4e31340ca8565c65e047f050145094b0fbb8d000000000000000000000000f76953d55a7fdf81602dc4f6b0116b93723c62cc"
        },
        {
          "address": "0xf76953d55a7fdf81602dc4f6b0116b93723c62cc",
          "topics": [
            "0x8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0",
            "0x00000000000000000000000023e128ade86facf027453b8631fa18a322a25e7b",
            "0x00000000000000000000000000a4e31340ca8565c65e047f050145094b0fbb8d"
          ],
          "data": "0x"
        }
      ],
      "transfers": []
    }
  ]
}
```


## Result

* Transaction: https://explore-testnet.vechain.org/transactions/0xee209e969c7019837854805db8b070a1e4817e0963dbbcb4865dee387c488402#info
* By Factory deployed contract: https://explore-testnet.vechain.org/accounts/0xf76953d55a7fdf81602dc4f6b0116b93723c62cc/
