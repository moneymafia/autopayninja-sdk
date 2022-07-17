const { getlink, calc_subs_month, calc_subs_week, substodays, userpendingtime, subscriptions, canuserpay, usertokenInfo, fetchMyids, totalids } = require("./index")


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

    var a = await fetchMyids("0x000000000000000000000000000000000000dEaD");
    console.log(a)

}

test()