const { ethers } = require('hardhat')
const { BigNumber } = ethers

const contracts = {}
let owner
let user1
let user2

beforeEach(async function () {
  [owner, user1, user2] = await ethers.getSigners()
})


describe('Factory', () => {
  it('maps new contracts to the owner', async () => {
    const Factory = await ethers.getContractFactory('Factory')
    contractInstance = await Factory.deploy()

    const transaction = await contractInstance.connect(user1).createContract("Some Name", "TTT")
    const { events } = await transaction.wait()
    const { contractAddress } = events.find(({ event }) => event === 'ContractCreated').args
    const list = await contractInstance.listContractsFor(user1.address)
    expect(list).toEqual([contractAddress])
  })

  it('lists only senders contracts', async () => {
    const Factory = await ethers.getContractFactory('Factory')
    contractInstance = await Factory.deploy()
    
    const contractAddress1 = await deployNewContract('name', 'symbol', user1)
    const contractAddress2 = await deployNewContract('name', 'symbol', user2)
    const list1 = await contractInstance.listContractsFor(user1.address)
    expect(list1).toEqual([contractAddress1])

    const list2 = await contractInstance.listContractsFor(user2.address)
    expect(list2).toEqual([contractAddress2])
  })

  it('provides a list of all created contracts', async () => {
    const Factory = await ethers.getContractFactory('Factory')
    contractInstance = await Factory.deploy()

    const contractAddress1 = await deployNewContract('name', 'symbol', user1)
    const contractAddress2 = await deployNewContract('name', 'symbol', user2)
    const list = await contractInstance.listContracts()
    expect(list).toEqual([contractAddress1, contractAddress2])
  })

  it('interacts with a given contract', async () => {
    const Factory = await ethers.getContractFactory('Factory')
    contractInstance = await Factory.deploy()

    const contractAddress = await deployNewContract('name', 'symbol', user2)

    const owner = await contractInstance.currentOwnerOf(contractAddress)
    expect(owner).toEqual(user2.address)
  })

  describe('NFT', () => {
    it('creates the new contract with correct name', async () => {
      const name = `${Math.random()}`
      const Factory = await ethers.getContractFactory('Factory')
      contractInstance = await Factory.deploy()

      const contractAddress = await deployNewContract(name, 'symbol')

      const nft = await ethers.getContractAt('NFT', contractAddress)
      const contractName = await nft.name()
      expect(contractName).toEqual(name)
    })

    it('creates the new contract with correct symbol', async () => {
      const symbol = `${Math.random()}`
      const Factory = await ethers.getContractFactory('Factory')
      contractInstance = await Factory.deploy()

      const contractAddress = await deployNewContract('name', symbol)

      const nft = await ethers.getContractAt('NFT', contractAddress)
      const contractSymbol = await nft.symbol()
      expect(contractSymbol).toEqual(symbol)
    })


    it('sets owner of new contracts to caller', async () => {
      const Factory = await ethers.getContractFactory('Factory')
      contractInstance = await Factory.deploy()

      const contractAddress = await deployNewContract('name', 'symbol', user2)

      const nft = await ethers.getContractAt('NFT', contractAddress)
      const owner = await nft.owner()
      expect(owner).toEqual(user2.address)
    })

  })

})

async function deployNewContract(name, symbol, user = owner) {
  const transaction = await contractInstance.connect(user).createContract(name, symbol)
  const { events } = await transaction.wait()
  const { contractAddress } = events.find(({ event }) => event === 'ContractCreated').args
  return contractAddress
}