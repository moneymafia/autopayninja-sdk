const axios = require('axios');

const ethers = require('ethers');

const ABI = require('./utils/abi.json');

const NETWORK = require('./utils/network.json');

const token_ABI = require('./utils/token.json');

async function checkAddress(_address) {
	if (ethers.utils.isAddress(_address)) {
		return ethers.utils.getAddress(_address);
	} else {
		return null;
	}
}

async function encodeSubscription(_merchant, _token, _cost, _initdays = '0') {
	var input_merchant = await checkAddress(_merchant);
	var input_token = await checkAddress(_token);

	var obj = JSON.stringify({
		merchant: input_merchant,
		token: input_token,
		cost: _cost,
		initdays: _initdays,
	});

	if (input_merchant && input_token) {
		return btoa(obj);
	}
	return null;
}

async function suggestAllowance(_amount) {
	var data = _amount * 365 * 5;
	return data.toString();
}

class AutoPayNinja {
	chainId = null;

	provider = null;

	contract = null;

	secondsinaDay = 60 * 60 * 24;

	constructor(chainId) {
		this.chainId = chainId;

		this.provider = new ethers.providers.JsonRpcProvider(NETWORK[chainId].rpc);

		this.contract = new ethers.Contract(NETWORK[chainId].contract, ABI, this.provider);
	}

	async getTokenPrice(_address) {
		let root = 'api';
		let address = 'WETH';

		if (_chainId == this.chainId) {
			root = 'polygon.api';
			address = _address;
		}

		if (_chainId == this.chainId) {
			root = 'bsc.api';
			address = _address;
		}

		const response = await axios.get(`https://${root}.0x.org/swap/v1/quote?buyToken=USDT&sellToken=${address}&sellAmount=100000000000000000`);

		return response.data.price;
	}

	async tokenDetails(_token) {
		var input_token = await checkAddress(_token);

		const tokencontract = new ethers.Contract(input_token, token_ABI, this.provider);

		var totalSupply = await tokencontract.totalSupply();
		var symbol = await tokencontract.symbol();
		var name = await tokencontract.name();

		return {
			totalSupply: totalSupply.toString(),
			symbol: symbol.toString(),
			name: name.toString(),
		};
	}

	async getUserTokenData(_token, _user) {
		var input_user = await checkAddress(_user);
		var input_token = await checkAddress(_token);

		if (input_user && input_token) {
			const datax = await this.contract.balance_user(input_user, input_token);
			const datap = await this.contract.allowance(input_user, input_token);

			return { balance: datax.toString(), allowance: datap.toString() };
		}
	}

	async canUserPay(_hash, _days) {
		const data = await this.contract.canuserpay(_hash, _days);
		return data.toString();
	}

	async hash_id(_token, _owner, _merchant, _cost) {
		const data = await this.contract.hash_id(_token, _owner, _merchant, _cost);
		return data.toString();
	}

	async totalIds() {
		const data = await this.contract.storeLength();
		return data - 1;
	}

	async subscriptions(_hash) {
		const subs = await this.contract.subscriptions(_hash);
		const aliveDuration = await this.contract.subsalive(_hash);
		const pendingInSec = await this.contract.pending_secs(_hash);

		let valid = subs.cost.toString().length > 0;

		return {
			hash: subs.hash.toString(),
			token: subs.token.toString(),
			owner: subs.owner.toString(),
			merchant: subs.merchant.toString(),
			cost: subs.cost.toString(),
			timestamp: aliveDuration.toString(),
			unpaidInSec: pendingInSec.toString(),
			unpaidInDay: pendingInSec.div(this.secondsinaDay).toString(),
			unpaidCost: (subs.cost * pendingInSec.div(this.secondsinaDay)).toString(),
			valid: valid,
		};
	}

	async getSubscriptionsByUser(_user) {
		const max = await this.totalIds();
		const users = [];
		const merchants = [];

		for (let index = 0; index < max; index++) {
			const sub_hash = await this.contract.store(index);

			const subs = await this.subscriptions(sub_hash);

			if (subs.valid) {
				if (subs.owner == _user) {
					users.push(subs.hash);
				}
				if (subs.merchant == _user) {
					merchants.push(subs.hash);
				}
			}
		}
		return { users, merchants };
	}

	async getActive(_merchant, _token, _days) {
		const max = await this.totalIds();
		const active = [];

		var input_merchant = await checkAddress(_merchant);
		var input_token = await checkAddress(_token);

		for (let index = 0; index < max; index++) {
			const sub_hash = await this.contract.store(index);

			const subs = await this.subscriptions(sub_hash);

			if (subs.valid && parseInt(subs.unpaidInDay) < _days) {
				if (subs.token == input_token && subs.merchant == input_merchant) {
					active.push(sub_hash);
				}
			}
		}
		return { active: active };
	}

	async graphSubscriptions(objs) {
		const data = await axios({
			url: NETWORK[this.chainId].graph,
			method: 'post',
			data: {
				query: `{ inits(${objs}) {id hash token owner merchant value timestamp} }`,
			},
		}).then((res) => res.data.data.inits);

		return data;
	}

	async graphTransfers(objs) {
		var data = await axios({
			url: NETWORK[this.chainId].graph,
			method: 'post',
			data: {
				query: `{ transfers(${objs}) { id hash token from to value timestamp } }`,
			},
		}).then((res) => res.data.data.transfers);

		return data;
	}
}

module.exports = {
	AutoPayNinja,
	ABI,
	NETWORK,
	checkAddress,
	encodeSubscription,
	suggestAllowance,
};
