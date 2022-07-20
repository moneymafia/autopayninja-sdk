const AutoPaySdk = require("./index");

async function test() {
  const autoPaySdk = new AutoPaySdk({ chainId: 3 });

  var a = await autoPaySdk.getlink(
    "0x8b41e67D6968327664Cf9313b136A0B076000214",
    "0x8b41e67D6968327664Cf9313b136A0B076000214",
    "1"
  );
  console.log(a);

  var a = await autoPaySdk.subscriptions(0);
  console.log(a);

  var a = await autoPaySdk.canuserpay(0, 4);
  console.log(a);

  var a = await autoPaySdk.usertokenInfo(
    "0x55349E0B114d305f94Cc1cbb2f574e7B5bEcDBd9",
    "0x23Ed8Bbed4FD61d25189CA921448fE15F1B04301"
  );
  console.log(a);

  var a = await autoPaySdk.fetchMyids(
    "0x23Ed8Bbed4FD61d25189CA921448fE15F1B04301"
  );
  console.log(a);

  var a = await autoPaySdk.fetchBysubs(
    "0xaf270cd42722ecf59e347d7b0bdef4eb1d36cd1adc1477af33d5b73112f4d59b"
  );
  console.log(a);

  var a = await autoPaySdk.graphql_subs("first: 5");
  console.log(a);

  var a = await autoPaySdk.graphql_transfers("first: 5");
  console.log(a);
}

test();
