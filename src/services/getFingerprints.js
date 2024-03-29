const { PolicyId } = require("../models/policyId");
const { Wallet } = require("../models/wallet");
const { getMyWalletData } = require("../services/getMyWalletData");

async function getFingerprints(walletAddr) {
  // Get Wallet Data to find the stake address. this is allow anyone to input their receiving or stake address
  const walletData = await getMyWalletData(walletAddr);
  // Get the stake address from walletData. this is the addr used in the database
  const stakeAddr = walletData.addr;

  // Find the Wallets model in the TellMeMyWorth_Users database in Mongo and filter out by the stakeAddr given
  //   const Wallet = mongoose.model("Wallets", walletSchema, "Wallets");

  const wallets = await Wallet.find({ addr: stakeAddr });
  // console.log('/////////////////////////////////////////////////',wallets)

  // Create object to store fingerprints by policyId
  let policyFingerprints = {};
  // Create array of the fingerprints in the wallet searched for
  let walletFingerprints = [];

  let assetQuantity = {};


  // go through each asset in a wallet and save them to the policyFingerprints objects.
  // Clear walletFingerprints if next policy is found
  await wallets[0].tokens.forEach(function (asset) {
    // console.log(asset.fingerprint)
    if (policyFingerprints.hasOwnProperty(asset.policy)) {
      walletFingerprints.push(asset.fingerprint);
      assetData['quantity'] = asset.quantity;
      assetData['assets'] = walletFingerprints;
      assetData['decimals'] = asset.decimals;
      if(assetData.quantity > 1) {console.log('######################',asset.quantity, asset)}
  
      // walletFingerprints.push(asset.quantity);
    } else {
      walletFingerprints = [];    
      assetData = {}
      assetData['quantity'] = asset.quantity;
      assetData['decimals'] = asset.decimals;
  
      walletFingerprints.push(asset.fingerprint);
      assetData['assets'] = walletFingerprints;
      if(assetData.quantity > 1) {console.log('######################',asset['decimals'], asset)}

      // walletFingerprints.push(asset.quantity);
    }

    policyFingerprints[asset.policy] = assetData;
    // console.log(policyFingerprints)
  });

  //   const PolicyId = mongoose.model("Policy_Ids", policyIdSchema, "Policy_Ids");

  for (let individualPolicy of Object.keys(policyFingerprints)) {
    // Find the policyId form the API call to jpg.store in the PolicyIds model
    const policyIdFound = await PolicyId.find({
      policy_id: { $eq: individualPolicy },
    })
      .select({ policy_id: 1, display_name: 1 })
      .limit(1);

    // console.log(policyIdFound)

    if (policyIdFound.length > 0) {
      policyFingerprints[policyIdFound[0].display_name] = policyFingerprints[policyIdFound[0].policy_id];
      delete policyFingerprints[policyIdFound[0].policy_id];
      // console.log(policyFingerprints[policyIdFound[0].display_name])
      // console.log(policyFingerprints[policyIdFound[0].policy_id])
    }
  }
  // console.log('##########################################',policyFingerprints )

  return policyFingerprints;
}

exports.getFingerprints = getFingerprints;
