const abi = require('./contract/abi.json')

const ethers = require('ethers')

const provide = new ethers.providers.EtherscanProvider('ropsten')

const contract_work = new ethers.Contract("0x8b41e67D6968327664Cf9313b136A0B076000214", abi, provide)

async function totalids() {
    var data = await contract_work.planIndex();

    return data
}

async function userpendingtime(_id) {
    var data = await contract_work.user_pending_secs(_id);

    return { "seconds": data.toString(), "days": data.div(60).toString() }
}

async function subscriptions(_id) {
    var data = await contract_work.subscriptions(_id);
    var datax = await contract_work.subsalive(_id);

    var valid = false;
    if (data.cost.toString() > 0) {
        valid = true;
    } else { valid = false; }


    return { "id": _id.toString(), "token": data.token.toString(), "owner": data.owner.toString(), "merchant": data.merchant.toString(), "cost": data.cost.toString(), "lastpaid": datax.toString(), "valid": valid }
}


async function canuserpay(_id, _days) {
    var data = await contract_work.canuserpay(_id, _days);
    return data.toString()
}


async function usertokenInfo(_token, _user) {
    var datax = await contract_work.balance_user(_user, _token);
    var datap = await contract_work.allowance(_user, _token);

    return { "balance": datax.toString(), "allowance": datap.toString() }
}


async function fetchMyids(_user) {
    var max = await totalids();

    let array_u = [];

    let array_m = [];

    for (let index = 0; index < max; index++) {
        var datax = await subscriptions(index);

        if (datax.valid) {
            if (datax.owner == _user) {
                array_u.push(datax);
            }
            if (datax.merchant == _user) {
                array_m.push(datax);
            }

        }

    }

    return { "user": array_u, "merchant": array_m }
}

async function substodays(_id) {
    var datax = await subscriptions(_id);
    return { "day": (datax.cost * 1).toString(), "week": (datax.cost * 7).toString(), "month": (datax.cost * 30).toString() }
}

async function calc_subs_month(_cost) {
    var daily_cost = _cost / 30;

    return daily_cost
}

async function calc_subs_week(_cost) {
    var daily_cost = _cost / 7;

    return daily_cost
}

async function getlink(_merchant, _token, _cost, _initdays) {

    if (ethers.utils.isAddress(_merchant) && ethers.utils.isAddress(_token)) {
        return `https://google.com/join?merchant=${_merchant}&token=${_token}&cost=${_cost}&initdays=${_initdays}`;
    }
    return null;

}


async function test() {
    var a = await getlink("0x8b41e67D6968327664Cf9313b136A0B076000214", "0x8b41e67D6968327664Cf9313b136A0B076000214", "1", "1");
    console.log(a)

    var a = await calc_subs_month(15);
    console.log(a)

    var a = await calc_subs_week(14);
    console.log(a)

    var a = await substodays(0);
    console.log(a)

    var a = await userpendingtime(0);
    console.log(a)

    var a = await subscriptions(0);
    console.log(a)

    var a = await canuserpay(0, 4);
    console.log(a)

    var a = await usertokenInfo("0x55349E0B114d305f94Cc1cbb2f574e7B5bEcDBd9", "0x23Ed8Bbed4FD61d25189CA921448fE15F1B04301");
    console.log(a)

    var a = await fetchMyids("0x23Ed8Bbed4FD61d25189CA921448fE15F1B04301");
    console.log(a)

    var a = await fetchMyids("0x06C3879882D06002d5582fC71d1150F60b1e8568");
    console.log(a)

}

test()