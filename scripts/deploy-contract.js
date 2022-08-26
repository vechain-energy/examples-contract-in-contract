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
