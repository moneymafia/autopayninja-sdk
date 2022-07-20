const axios = require("axios");
const abi = require("./contract/abi.json");
const ethers = require("ethers");

const networks = {
  3: {
    contract: "0x15068063F353D946462BCEb9464A8Dce23B9814d",
    graph: "https://api.thegraph.com/subgraphs/name/moneymafia/autopayninja",
    rpc: "https://rpc.ankr.com/eth_ropsten",
  },
  56: {
    contract: "0x15068063F353D946462BCEb9464A8Dce23B9814d",
    graph: "https://api.thegraph.com/subgraphs/name/moneymafia/autopayninja",
    rpc: "https://rpc.ankr.com/eth_ropsten",
  },
  137: {
    contract: "0x15068063F353D946462BCEb9464A8Dce23B9814d",
    graph: "https://api.thegraph.com/subgraphs/name/moneymafia/autopayninja",
    rpc: "https://rpc.ankr.com/eth_ropsten	",
  },
};

class AutoPayNinjaSDK {
  chainId = 3;
  contract = null;
  secondsinaDay = 60;
  constructor({ chainId = 3 }) {
    this.chainId = chainId;
    const provider = new ethers.providers.JsonRpcProvider(
      networks[chainId].rpc
    );
    this.contract = new ethers.Contract(
      networks[chainId].contract,
      abi,
      provider
    );
  }

  async totalids() {
    var data = await this.contract.sub_index();
    return data;
  }

  async subscriptions(_id) {
    var data = await this.contract.subscriptions(_id);
    var datax = await this.contract.subsalive(_id);
    var datay = await this.contract.pending_secs(_id);

    var valid = false;
    if (data.cost.toString() > 0) {
      valid = true;
    } else {
      valid = false;
    }

    //sha256 hash of string
    var hash = ethers.utils.solidityKeccak256(
      ["string"],
      [data.token + data.merchant + data.cost]
    );

    return {
      plan_id: _id.toString(),
      sub_id: hash.toString(),
      token: data.token.toString(),
      owner: data.owner.toString(),
      merchant: data.merchant.toString(),
      cost: data.cost.toString(),
      lastpaid_sec: datax.toString(),
      unpaid_sec: datay.toString(),
      unpaid_day: datay.div(this.secondsinaDay).toString(),
      unpaid_cost: (data.cost * datay.div(this.secondsinaDay)).toString(),
      valid: valid,
    };
  }

  async canuserpay(_id, _days) {
    var data = await this.contract.canuserpay(_id, _days);
    return data.toString();
  }

  async usertokenInfo(_token, _user) {
    if (ethers.utils.isAddress(_token) && ethers.utils.isAddress(_user)) {
      var datax = await this.contract.balance_user(_user, _token);
      var datap = await this.contract.allowance(_user, _token);
      return { balance: datax.toString(), allowance: datap.toString() };
    }
  }

  async fetchMyids(_user) {
    const max = await this.totalids();
    const users = [];
    const merchants = [];

    for (let index = 0; index < max; index++) {
      const datax = await this.subscriptions(index);
      if (datax.valid) {
        if (datax.owner == _user) {
          users.push(index);
        }
        if (datax.merchant == _user) {
          merchants.push(index);
        }
      }
    }
    return { user: users, merchant: merchants };
  }

  async fetchBysubs(_subid) {
    var max = await this.totalids();
    let array = [];
    for (let index = 0; index < max; index++) {
      var datax = await this.subscriptions(index);
      if (datax.valid && datax.sub_id == _subid) {
        array.push(index);
      }
    }
    return { subs: array };
  }

  async getlink(_merchant, _token, _cost, _initdays) {
    if (ethers.utils.isAddress(_merchant) && ethers.utils.isAddress(_token)) {
      var initdays = _initdays || 0;
      return `https://google.com/join?chainId=${this.chainId}&merchant=${_merchant}&token=${_token}&cost=${_cost}&initdays=${initdays}`;
    }
    return null;
  }

  async graphql_subs(objs) {
    var data = await axios({
      url: networks[this.chainId].graph,
      method: "post",
      data: {
        query: `{ inits(${objs}) { id subid token merchant value timestamp} }`,
      },
    }).then((res) => res.data.data.inits);

    return data;
  }

  async graphql_transfers(objs) {
    var data = await axios({
      url: networks[this.chainId].graph,
      method: "post",
      data: {
        query: `{ transfers(${objs}) { id token from to value timestamp } }`,
      },
    }).then((res) => res.data.data.transfers);

    return data;
  }
}

module.exports = AutoPayNinjaSDK;
