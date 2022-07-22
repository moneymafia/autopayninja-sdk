const { AutoPayNinja, getTokenPrice, getSubscriptionLink, suggestAllowance } = require('./index');

const sdk = new AutoPayNinja(3);

async function test() {
	// Smart Contract Fetch
	var a = await sdk.subscriptions('0x3641f0010d27fda41cf04df7f792a19dc7f7976f7ee36feda87e6ced5a8e384b');
	console.log(a);

	var a = await sdk.canUserPay('0x3641f0010d27fda41cf04df7f792a19dc7f7976f7ee36feda87e6ced5a8e384b', 4);
	console.log(a);

	var a = await sdk.getUserTokenData('0x55349E0B114d305f94Cc1cbb2f574e7B5bEcDBd9', '0x23Ed8Bbed4FD61d25189CA921448fE15F1B04301');
	console.log(a);

	// RPC Lookup - Slow - get active Subs for user/merchant
	var a = await sdk.getSubscriptionsByUser('0x23Ed8Bbed4FD61d25189CA921448fE15F1B04301');
	console.log(a);

	// RPC Lookup - Slow - Get active Users for merchant
	var a = await sdk.getActive('0x000000000000000000000000000000000000dead', '0x55349E0B114d305f94Cc1cbb2f574e7B5bEcDBd9', 6000);
	console.log(a);
}

async function test2() {
	// Faster Lookup for Entries
	var a = await sdk.graphSubscriptions('first: 5');
	console.log(a);

	var a = await sdk.graphTransfers('first: 5');
	console.log(a);

	// Faster Lookup Using Graph

	var a = await sdk.graphSubscriptions(`where: {merchant: "0x000000000000000000000000000000000000dead"}`);
	console.log(a);

	var a = await sdk.graphTransfers(`where: {from: "0x23ed8bbed4fd61d25189ca921448fe15f1b04301"}`);
	console.log(a);
}

async function test3() {
	// Get Shareble Sub Link
	var a = await getSubscriptionLink('0x8b41e67D6968327664Cf9313b136A0B076000214', '0x8b41e67D6968327664Cf9313b136A0B076000214', '1');
	console.log(a);

	var a = await suggestAllowance('100');
	console.log(a);
}

async function test4() {
	//gets token details
	var a = await sdk.tokenDetails('0x55349e0b114d305f94cc1cbb2f574e7b5becdbd9');
	console.log(a);

	//gets token price in dollar
	var a = await getTokenPrice('0x55349e0b114d305f94cc1cbb2f574e7b5becdbd9', 3);
	console.log(a);
}

test();
