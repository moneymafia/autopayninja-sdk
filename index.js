let networkID = 3;

const networks = {
	3: {
		contract: '0x15068063F353D946462BCEb9464A8Dce23B9814d',
		graph: 'https://api.thegraph.com/subgraphs/name/moneymafia/autopayninja',
		rpc: 'https://rpc.ankr.com/eth_ropsten',
	},
	56: {
		contract: '0x15068063F353D946462BCEb9464A8Dce23B9814d',
		graph: 'https://api.thegraph.com/subgraphs/name/moneymafia/autopayninja',
		rpc: 'https://rpc.ankr.com/eth_ropsten',
	},
	137: {
		contract: '0x15068063F353D946462BCEb9464A8Dce23B9814d',
		graph: 'https://api.thegraph.com/subgraphs/name/moneymafia/autopayninja',
		rpc: 'https://rpc.ankr.com/eth_ropsten	',
	},
};

const axios = require('axios');

const abi = require('./contract/abi.json');

const ethers = require('ethers');

const provider = new ethers.providers.JsonRpcProvider(networks[networkID].rpc);

const contract = new ethers.Contract(networks[networkID].contract, abi, provider);

const secondsinaDay = 60;

async function totalids() {
	var data = await contract.sub_index();

	return data;
}

async function subscriptions(_id) {
	var data = await contract.subscriptions(_id);
	var datax = await contract.subsalive(_id);
	var datay = await contract.pending_secs(_id);

	var valid = false;
	if (data.cost.toString() > 0) {
		valid = true;
	} else {
		valid = false;
	}

	//sha256 hash of string
	var hash = ethers.utils.solidityKeccak256(['string'], [data.token + data.merchant + data.cost]);

	return {
		plan_id: _id.toString(),
		sub_id: hash.toString(),
		token: data.token.toString(),
		owner: data.owner.toString(),
		merchant: data.merchant.toString(),
		cost: data.cost.toString(),
		lastpaid_sec: datax.toString(),
		unpaid_sec: datay.toString(),
		unpaid_day: datay.div(secondsinaDay).toString(),
		unpaid_cost: (data.cost * datay.div(secondsinaDay)).toString(),
		valid: valid,
	};
}

async function canuserpay(_id, _days) {
	var data = await contract.canuserpay(_id, _days);
	return data.toString();
}

async function usertokenInfo(_token, _user) {
	if (ethers.utils.isAddress(_token) && ethers.utils.isAddress(_user)) {
		var datax = await contract.balance_user(_user, _token);
		var datap = await contract.allowance(_user, _token);

		return { balance: datax.toString(), allowance: datap.toString() };
	}
}

async function fetchMyids(_user) {
	var max = await totalids();

	let array_u = [];

	let array_m = [];

	for (let index = 0; index < max; index++) {
		var datax = await subscriptions(index);

		if (datax.valid) {
			if (datax.owner == _user) {
				array_u.push(index);
			}
			if (datax.merchant == _user) {
				array_m.push(index);
			}
		}
	}

	return { user: array_u, merchant: array_m };
}

async function fetchBysubs(_subid) {
	var max = await totalids();

	let array = [];

	for (let index = 0; index < max; index++) {
		var datax = await subscriptions(index);

		if (datax.valid && datax.sub_id == _subid) {
			array.push(index);
		}
	}

	return { subs: array };
}

async function getlink(_merchant, _token, _cost, _initdays) {
	if (ethers.utils.isAddress(_merchant) && ethers.utils.isAddress(_token)) {
		var initdays = _initdays || 0;

		return `https://google.com/join?networkId=${networkID}&merchant=${_merchant}&token=${_token}&cost=${_cost}&initdays=${initdays}`;
	}
	return null;
}

async function graphql_subs(objs) {
	var data = await axios({
		url: networks[networkID].graph,
		method: 'post',
		data: {
			query: `{ inits(${objs}) { id subid token merchant value timestamp} }`,
		},
	}).then((res) => res.data.data.inits);

	return data;
}

async function graphql_transfers(objs) {
	var data = await axios({
		url: networks[networkID].graph,
		method: 'post',
		data: {
			query: `{ transfers(${objs}) { id token from to value timestamp } }`,
		},
	}).then((res) => res.data.data.transfers);

	return data;
}

module.exports = { getlink, subscriptions, canuserpay, usertokenInfo, fetchMyids, fetchBysubs, totalids, abi, graphql_subs, graphql_transfers };
