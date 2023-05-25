const { networkConfig, developmentChains } = require("../helper-hardhat-config")
const { network, deployments } = require("hardhat")
const { verify } = require("../utils/verify")
require("dotenv").config()
module.exports = async (hre) => {
    const { deploy, log } = hre.deployments
    const { deployer } = await hre.getNamedAccounts()
    const chainId = network.config.chainId

    // const ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    let ethUsdPriceFeedAddress
    if (chainId == 31337) {
        const ethUsAggregator = await deployments.get("MockV3Aggregator")
        ethUsdPriceFeedAddress = ethUsAggregator.address
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    }

    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: [ethUsdPriceFeedAddress],
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })

    log(`FundMe deployed at ${fundMe.address}`)

    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        await verify(fundMe.address, [ethUsdPriceFeedAddress])
    }
}

module.exports.tags = ["all", "fundme"]
