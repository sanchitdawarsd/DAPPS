var defaultUpline = "TKRefiBNvYQ8CcUZ78ksjLhMS2ZJTkTFSD";

var cbrate = 0;

function getFormattedDate(date) {
    let hour = ('0' + date.getUTCHours()).slice(-2);
    let minute = ('0' + date.getUTCMinutes()).slice(-2);
    let day = ('0' + date.getUTCDate()).slice(-2);
    let month = ('0' + (date.getUTCMonth() + 1)).slice(-2);
    let year = date.getUTCFullYear();
    return hour + ':' + minute + ' ' + day + '.' + month + '.' + year
}

function validatebrowser() {

    const loadWatcher = setInterval(() => {
        if (window.tronWeb && window.tronWeb.ready) {

            document.getElementById("wltdata").style.display = "block";
            document.getElementById("rfid").style.display = "inline";

            //document.getElementById("tdeposit").value = 100;

            var dat = document.getElementById("tdeposit").value.length;

            console.log(dat)

            if (dat > 30) {
                document.getElementById("tdeposit").value = 100;
            }


            tronWeb: window.tronWeb
            console.log("Tronweb Available");
            console.log("Address : " + window.tronWeb.defaultAddress.base58);

            var addrs = window.tronWeb.defaultAddress.base58;

            if (addrs.length > 0) {
                document.getElementById("reflnk").innerHTML = "https://www.xtron.plus/index.aspx?ref=" + addrs;

                document.getElementById("tref").value = "https://www.xtron.plus/index.aspx?ref=" + addrs;

                document.getElementById("ttrwlt").value = addrs;
            } else {
                document.getElementById("ttrwlt").value = "Please connect your tron wallet.";

                document.getElementById("reflnk").innerHTML = "-";
            }

            let instance = window.tronWeb.contract(abi, address);


            instance.getContractBalanceRate().call().then(function(result) {

                document.getElementById("cbalrate").innerHTML = "+" + ((result - 15) / 10) + "%"

                cbrate = result;

            });

            instance.getUserPercentRate(addrs).call().then(function(result) {
                document.getElementById("usrrate").innerHTML = "+" + (result / 10) + "%";

                document.getElementById("holdbonus").innerHTML = "+" + ((result - cbrate) / 10) + "%";
            });

            instance.getUserTotalEarned(addrs).call().then(function(result) {
                document.getElementById("usrdiv").innerHTML = result / 1000000;
            });


            //TOTAL
            instance.getUserTotalReferralBonus(addrs).call().then(result => document.getElementById("refbonus").innerHTML = result / 1000000);

            instance.getUserAvailable(addrs).call().then(result => document.getElementById("usrav").innerHTML = result / 1000000);

            instance.getUserAmountOfDeposits(addrs).call().then(result => document.getElementById("totaldp").innerHTML = result);

            instance.getUserTotalDeposits(addrs).call().then(result => document.getElementById("totaldpval").innerHTML = result / 1000000);

            instance.getUserTotalWithdrawn(addrs).call().then(result => document.getElementById("totalw").innerHTML = result / 1000000);

            instance.getUserTotalDeposits(addrs).call().then(function(result) {
                if (result > 0) {
                    var datadate = 0;

                    instance.getUserCheckpoint(addrs).call().then(function getdate(result) {
                        datadate = tronWeb.toDecimal(result[2]);
                        document.getElementById("usrchkpnt").innerHTML = getFormattedDate(new Date(result * 1000));
                    });
                } else {
                    document.getElementById("usrchkpnt").innerHTML = "---";
                }
            });




            instance.getUserDownlineCount(addrs).call().then(function getdata(result) {
                document.getElementById("lone").innerHTML = result[0];
                document.getElementById("ltwo").innerHTML = result[1];
                document.getElementById("lthree").innerHTML = result[2];
                document.getElementById("lfour").innerHTML = result[3];
                document.getElementById("lfive").innerHTML = result[4];
                document.getElementById("lsix").innerHTML = result[5];
                document.getElementById("lsvn").innerHTML = result[6];
            });



            const urlP = new URLSearchParams(window.location.search);
            var myUpl = urlP.get('ref');

            if (myUpl == null) {
                console.log("No ref present in url");

                instance.getUserReferrer(addrs).call().then(function(result) {

                    var gotref = tronWeb.address.fromHex(result);

                    //console.log("returned ref : " + gotref);

                    if (gotref != "T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb") {
                        //console.log("Empty ref returned Wwb | set to default");
                        document.getElementById("upline").innerHTML = gotref;
                    } else {
                        //console.log("Valid ref returned");
                        document.getElementById("upline").innerHTML = defaultUpline;
                    }
                });
            } else {
                if (!tronWeb.isAddress(myUpl) || myUpl == addrs) {
                    document.getElementById("upline").innerHTML = defaultUpline;
                } else {
                    instance.getUserTotalDeposits(myUpl).call().then(
                        function(result) {

                            if (result > 0) {
                                //console.log("Valid upline | exist " + myUpl);
                                document.getElementById("upline").innerHTML = myUpl;
                            } else { //console.log("INValid upline | Not exist " + myUpl);
                                document.getElementById("upline").innerHTML = defaultUpline;
                            }
                        });
                }
            }

            ////clearInterval(loadWatcher);
        } else {
            console.log("Tronweb Unavailable");

            document.getElementById("wltdata").style.display = "none";

            document.getElementById("rfid").style.display = "none";

            document.getElementById("ttrwlt").value = "Please connect your tron wallet.";

            document.getElementById("tdeposit").value = "Please connect your tron wallet.";

            document.getElementById("reflnk").innerHTML = "-";



        }
    }, 3000);
}


async function awaitTx(tx) {

    const loadWatcher = setInterval(() => {

        tronWeb.trx.getTransactionInfo(tx).then(result => {
            if (result.blockNumber > 0) {
                console.log("Got Fecthed Block Number");

                clearInterval(loadWatcher);
            }

        }).catch(function(error) {
            console.log("Not Confirmed yet : Errored " + error)
        });
    }, 2000);


}

async function trysend() {

    if (window.tronWeb && window.tronWeb.ready) {
        console.log("Yes, catch it:", window.tronWeb.defaultAddress.base58);

        var addrs = window.tronWeb.defaultAddress.base58;

        let instance = await window.tronWeb.contract(abi, address);

        var setdefaultUpline = "TKRefiBNvYQ8CcUZ78ksjLhMS2ZJTkTFSD";

        //Validate upline
        var urlP = new URLSearchParams(window.location.search);
        var myUpl = urlP.get('ref');

        if (myUpl == null) {
            await instance.getUserReferrer(addrs).call().then(function(result) {

                var gotref = tronWeb.address.fromHex(result);

                if (gotref != "T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb") {

                    document.getElementById("upline").innerHTML = gotref;

                    myUpl = gotref;
                } else {
                    document.getElementById("upline").innerHTML = setdefaultUpline;
                    myUpl = setdefaultUpline;

                }
            });
        } else {
            if (!tronWeb.isAddress(myUpl) || myUpl == addrs) {
                document.getElementById("upline").innerHTML = setdefaultUpline;
                myUpl = setdefaultUpline;
            } else {
                await instance.getUserTotalDeposits(myUpl).call().then(
                    function(result) {
                        if (result > 0) {
                            document.getElementById("upline").innerHTML = myUpl;
                        } else {
                            document.getElementById("upline").innerHTML = setdefaultUpline;
                            myUpl = setdefaultUpline;
                        }
                    });
            }
        }

        var amount = Math.trunc(document.getElementById("tdeposit").value);

        if (amount >= 100) {
            try {
                var amtinvest = tronWeb.toSun(amount);

                await instance.invest(myUpl).send({
                    callValue: amtinvest
                }).then(function(tx) {
                    console.log("Transaction was successfully sent. Wait confirming.. ", tx);

                    validatebrowser();

                    $("#showstats")[0].click();
                    //this.awaitTx(tx).then(function(data){
                    //    validatebrowser();
                    //});
                }).catch(function(error) {
                    console.log("in catch Errored " + error)
                });
            } catch (error) {}
        } else {
            alert("Minimum investment amount 100 trx");
        }
    } else {
        console.log("Connect to tron wallet");
        alert('Please connect your tron wallet / tron browser extension.');
    }
}

async function rqwithdraw() {

    if (window.tronWeb && window.tronWeb.ready) {
        console.log("Yes, catch it:", window.tronWeb.defaultAddress.base58);

        try {
            let instance = await window.tronWeb.contract(abi, address);

            await instance.withdraw().send({
                callValue: 0
            }).then(function(tx) {
                console.log("Transaction was successfully sent. Wait confirming.. ", tx);

                validatebrowser();

                //this.awaitTx(tx).then(function(data){
                //    validatebrowser();
                //});

            }).catch(function(error) {
                console.log("Errored " + error)
                //alert("Errored " + error);
            });
        } catch (error) {}

    } else {}
}