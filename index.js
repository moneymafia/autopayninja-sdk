const axios = require('axios');

const ethers = require('ethers');

const ABI = require('./contract/abi.json');

const NETWORK = {
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

class AutoPayNinja {
	chainId = null;

	contract = null;

	secondsinaDay = 60;

	// @param chainId: EVM Network ID
	constructor(chainId) {
		this.chainId = chainId;

		const provider = new ethers.providers.JsonRpcProvider(NETWORK[chainId].rpc);

		this.contract = new ethers.Contract(NETWORK[chainId].contract, ABI, provider);
	}

	async totalIds() {
		const data = await this.contract.sub_index();
		return data;
	}

	async subscriptions(_id) {
		const subs = await this.contract.subscriptions(_id);
		const aliveDuration = await this.contract.subsalive(_id);
		const pendingInSec = await this.contract.pending_secs(_id);

		let valid = subs.cost.toString().length > 0;

		return {
			subId: _id.toString(),
			token: subs.token.toString(),
			owner: subs.owner.toString(),
			merchant: subs.merchant.toString(),
			cost: subs.cost.toString(),
			lastpaidInSec: aliveDuration.toString(),
			unpaidInSec: pendingInSec.toString(),
			unpaidInDay: pendingInSec.div(this.secondsinaDay).toString(),
			unpaidCost: (subs.cost * pendingInSec.div(this.secondsinaDay)).toString(),
			valid: valid,
		};
	}

	async canUserPay(_id, _days) {
		const data = await this.contract.canuserpay(_id, _days);
		return data.toString();
	}

	async getUserTokenData(_token, _user) {
		if (ethers.utils.isAddress(_token) && ethers.utils.isAddress(_user)) {
			const datax = await this.contract.balance_user(_user, _token);
			const datap = await this.contract.allowance(_user, _token);
			return { balance: datax.toString(), allowance: datap.toString() };
		}
	}

	async getSubscriptionsByUser(_user) {
		const max = await this.totalIds();
		const users = [];
		const merchants = [];

		for (let index = 0; index < max; index++) {
			const subs = await this.subscriptions(index);
			if (subs.valid) {
				if (subs.owner == _user) {
					users.push(index);
				}
				if (subs.merchant == _user) {
					merchants.push(index);
				}
			}
		}
		return { users, merchants };
	}

	async getSubscriptionLink(_merchant, _token, _cost, _initdays) {
		if (ethers.utils.isAddress(_merchant) && ethers.utils.isAddress(_token)) {
			const initdays = _initdays || 0;
			return `https://autopay.ninja/join?chainId=${this.chainId}&merchant=${_merchant}&token=${_token}&cost=${_cost}&initdays=${initdays}`;
		}
		return null;
	}

	async graphSubscriptions(objs) {
		const data = await axios({
			url: NETWORK[this.chainId].graph,
			method: 'post',
			data: {
				query: `{ inits(${objs}) { id subid token merchant value timestamp} }`,
			},
		}).then((res) => res.data.data.inits);

		return data;
	}

	async graphTransfers(objs) {
		var data = await axios({
			url: NETWORK[this.chainId].graph,
			method: 'post',
			data: {
				query: `{ transfers(${objs}) { id token from to value timestamp } }`,
			},
		}).then((res) => res.data.data.transfers);

		return data;
	}
}

module.exports = { AutoPayNinja, ABI, NETWORK };
