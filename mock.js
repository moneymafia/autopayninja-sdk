const { AutoPayNinja, ABI, NETWORK } = require('./index');

const sdk = new AutoPayNinja(3);

async function test() {
	// Smart Contract Fetch
	var a = await sdk.subscriptions(0);
	console.log(a);

	var a = await sdk.canUserPay(0, 4);
	console.log(a);

	var a = await sdk.getUserTokenData('0x55349E0B114d305f94Cc1cbb2f574e7B5bEcDBd9', '0x23Ed8Bbed4FD61d25189CA921448fE15F1B04301');
	console.log(a);

	// RPC Lookup - Super Slow
	var a = await sdk.getSubscriptionsByUser('0x23Ed8Bbed4FD61d25189CA921448fE15F1B04301');
	console.log(a);

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

	// Get Shareble Sub Link
	var a = await sdk.getSubscriptionLink('0x8b41e67D6968327664Cf9313b136A0B076000214', '0x8b41e67D6968327664Cf9313b136A0B076000214', '1');
	console.log(a);
}

async function test2() {
	var a = await sdk.suggestAllowance('100');
	console.log(a);
}

test2();
