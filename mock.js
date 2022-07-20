const {AutoPayNinjaSDK, ABI} = require("./index");

async function test() {
  const autoPaySdk = new AutoPayNinjaSDK(3);

  var a = await autoPaySdk.getSubscriptionLink(
    "0x8b41e67D6968327664Cf9313b136A0B076000214",
    "0x8b41e67D6968327664Cf9313b136A0B076000214",
    "1"
  );
  console.log(a);

  var a = await autoPaySdk.subscriptions(0);
  console.log(a);

  var a = await autoPaySdk.canUserPay(0, 4);
  console.log(a);

  var a = await autoPaySdk.getUserTokenData(
    "0x55349E0B114d305f94Cc1cbb2f574e7B5bEcDBd9",
    "0x23Ed8Bbed4FD61d25189CA921448fE15F1B04301"
  );
  console.log(a);

  var a = await autoPaySdk.getSubscriptionsByUser(
    "0x23Ed8Bbed4FD61d25189CA921448fE15F1B04301"
  );
  console.log(a);

  var a = await autoPaySdk.getAllSubsciptionsById(
    "0xaf270cd42722ecf59e347d7b0bdef4eb1d36cd1adc1477af33d5b73112f4d59b"
  );
  console.log(a);

  var a = await autoPaySdk.graphSubscriptions("first: 5");
  console.log(a);

  var a = await autoPaySdk.graphTransfers("first: 5");
  console.log(a);
}

test();
