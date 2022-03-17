var crypto = require("crypto");

/* eslint-disable no-undef */
const accountUtils = require("./utils/account.utils");
const DappUtils = require("./utils/dapp.utils");

let dapp;
const user2 = "bla die bloe dua dop^pozre";
const user3 = "6465456 qkfishfihfiu";

describe("multisig2_3 test suite", async function () {
  before(async function () {
    this.timeout(0);

    await accountUtils.defineAccounts({
      dapp: 5,
      user2: 0.1,
      user3: 0.1,
      dapp2: 0.1,
    });

    await DappUtils.setupDapp("multisig2_3.ride", "dapp");
    dapp = address(accounts.dapp);
    console.log(accounts.dapp);
    console.log(dapp);

    await DappUtils.setupDapp("dapp_used_in_test.ride", "dapp2");
    dapp2 = address(accounts.dapp2);
    console.log(accounts.dapp2);
    console.log(dapp2);
  });

  describe("data tx is allowed by 1 signer", () => {
    it("First user", async function () {
      const dataTx = data(
        {
          data: [{ key: "test1", value: "test" }],
          additionalFee: 400000,
        },
        accounts.dapp
      );
      dataTx["proofs"] = [];
      const SignedTx = signTx(dataTx);
      await broadcast(SignedTx);
      await waitForTx(SignedTx.id);
    });
    it("Second user", async function () {
      const dataTx = data(
        {
          data: [{ key: "test2", value: "test" }],
          additionalFee: 400000,
        },
        accounts.dapp
      );
      dataTx["proofs"] = [];
      const SignedTx = signTx(dataTx, user2);
      await broadcast(SignedTx);
      await waitForTx(SignedTx.id);
    });
    it("Third user", async function () {
      const dataTx = data(
        {
          data: [{ key: "test3", value: "test" }],
          additionalFee: 400000,
        },
        accounts.dapp
      );
      dataTx["proofs"] = [];
      const SignedTx = signTx(dataTx, user3);
      await broadcast(SignedTx);
      await waitForTx(SignedTx.id);
    });
  });
  describe("data tx is allowed by 2 signer", () => {
    it("2 users sign", async function () {
      const dataTx = data(
        {
          data: [{ key: "test2sig", value: "test" }],
          additionalFee: 400000,
        },
        accounts.dapp
      );
      dataTx["proofs"] = [];
      let SignedTx = signTx(dataTx, user2);
      SignedTx = signTx(SignedTx, user3);
      await broadcast(SignedTx);
      await waitForTx(SignedTx.id);
    });
  });
  describe("data tx is allowed by 3 signer", () => {
    it("3 users sign", async function () {
      const dataTx = data(
        {
          data: [{ key: "test3sig", value: "test" }],
          additionalFee: 400000,
        },
        accounts.dapp
      );
      dataTx["proofs"] = [];
      let SignedTx = signTx(dataTx);
      SignedTx = signTx(SignedTx, user2);
      SignedTx = signTx(SignedTx, user3);
      await broadcast(SignedTx);
      await waitForTx(SignedTx.id);
    });
  });

  describe("try to do tx", () => {
    it("transfer is not allowed by 1/3", async function () {
      const txTransfer = transfer(
        {
          amount: 1,
          recipient: address(user2),
          additionalFee: 400000,
        },
        accounts.dapp
      );
      await expect(broadcast(txTransfer)).rejectedWith(
        "Transaction is not allowed by account-script"
      );
    });
    it("transfer is allowed with 2/3", async function () {
      const txTransfer = transfer(
        {
          amount: 1,
          recipient: address(user2),
          additionalFee: 400000,
        },
        accounts.dapp
      );
      txTransfer["proofs"] = [];
      let SignedTx = signTx(txTransfer, user2);
      SignedTx = signTx(SignedTx, user3);
      await broadcast(SignedTx);
      await waitForTx(SignedTx.id);
    });
    it("issue is not allowed by 1/3", async function () {
      const txTransfer = issue(
        {
          name: "test",
          description: "test",
          decimals: 2,
          quantity: 10,
          reissuable: true,
          script: "base64:AQa3b8tH",
          additionalFee: 400000,
        },
        accounts.dapp
      );
      await expect(broadcast(txTransfer)).rejectedWith(
        "Transaction is not allowed by account-script"
      );
    });
    let asssetIdTx = "";
    it("issue is allowed by 2/3", async function () {
      const txTransfer = issue(
        {
          name: "test",
          description: "test",
          decimals: 2,
          quantity: 10,
          reissuable: true,
          script: "base64:AQa3b8tH",
          additionalFee: 400000,
        },
        accounts.dapp
      );
      asssetIdTx = txTransfer["id"];
      txTransfer["proofs"] = [];
      let SignedTx = signTx(txTransfer, user2);
      SignedTx = signTx(SignedTx, user3);
      await broadcast(SignedTx).catch((e) => console.log(e));
      await waitForTx(SignedTx.id);
    });

    it("reissue is not allowed by 1/3", async function () {
      const txTransfer = reissue(
        {
          assetId: asssetIdTx,
          quantity: 11,
          reissuable: true,
          additionalFee: 400000,
        },
        accounts.dapp
      );
      await expect(broadcast(txTransfer)).rejectedWith(
        "Transaction is not allowed by account-script"
      );
    });

    it("reissue is allowed by 2/3", async function () {
      const txTransfer = reissue(
        {
          assetId: asssetIdTx,
          quantity: 11,
          reissuable: true,
          additionalFee: 400000,
        },
        accounts.dapp
      );
      txTransfer["proofs"] = [];
      let SignedTx = signTx(txTransfer, user2);
      SignedTx = signTx(SignedTx, user3);
      await broadcast(SignedTx).catch((e) => console.log(e));
      await waitForTx(SignedTx.id);
    });

    it("burn is not allowed by 1/3", async function () {
      const txTransfer = burn(
        {
          assetId: asssetIdTx,
          amount: 1,
          additionalFee: 800000,
        },
        accounts.dapp
      );
      await expect(broadcast(txTransfer)).rejectedWith(
        "Transaction is not allowed by account-script"
      );
    });

    it("burn is allowed by 2/3", async function () {
      const txTransfer = burn(
        {
          assetId: asssetIdTx,
          amount: 1,
          additionalFee: 800000,
        },
        accounts.dapp
      );
      txTransfer["proofs"] = [];
      let SignedTx = signTx(txTransfer, user2);
      SignedTx = signTx(SignedTx, user3);
      await broadcast(SignedTx).catch((e) => console.log(e));
      await waitForTx(SignedTx.id);
    });
    it("setassetscript is not allowed by 1/3", async function () {
      const txTransfer = setAssetScript(
        {
          assetId: asssetIdTx,
          script: "base64:AQa3b8tH",
          additionalFee: 800000,
        },
        accounts.dapp
      );
      await expect(broadcast(txTransfer)).rejectedWith(
        "Transaction is not allowed by account-script"
      );
    });

    it("setassetscript is allowed by 2/3", async function () {
      const txTransfer = setAssetScript(
        {
          assetId: asssetIdTx,
          script: "base64:AQa3b8tH",
          additionalFee: 800000,
        },
        accounts.dapp
      );
      txTransfer["proofs"] = [];
      let SignedTx = signTx(txTransfer, user2);
      SignedTx = signTx(SignedTx, user3);
      await broadcast(SignedTx).catch((e) => console.log(e));
      await waitForTx(SignedTx.id);
    });

    it("issue is allowed by 2/3, create asset to sponsor", async function () {
      const txTransfer = issue(
        {
          name: "test",
          description: "test",
          decimals: 2,
          quantity: 10,
          reissuable: true,
          script: null,
          additionalFee: 400000,
        },
        accounts.dapp
      );
      asssetIdTx = txTransfer["id"];
      txTransfer["proofs"] = [];
      let SignedTx = signTx(txTransfer, user2);
      SignedTx = signTx(SignedTx, user3);
      await broadcast(SignedTx).catch((e) => console.log(e));
      await waitForTx(SignedTx.id);
    });

    it("sponsorship is not allowed by 1/3", async function () {
      const txTransfer = sponsorship(
        {
          assetId: asssetIdTx,
          minSponsoredAssetFee: 1,
          additionalFee: 800000,
        },
        accounts.dapp
      );
      await expect(broadcast(txTransfer)).rejectedWith(
        "Transaction is not allowed by account-script"
      );
    });

    it("sponsorship is allowed by 2/3", async function () {
      const txTransfer = sponsorship(
        {
          assetId: asssetIdTx,
          minSponsoredAssetFee: 1,
          additionalFee: 800000,
        },
        accounts.dapp
      );
      txTransfer["proofs"] = [];
      let SignedTx = signTx(txTransfer, user2);
      SignedTx = signTx(SignedTx, user3);
      await broadcast(SignedTx).catch((e) => console.log(e));
      await waitForTx(SignedTx.id);
    });

    it("lease is not allowed by 1/3", async function () {
      const txTransfer = lease(
        {
          amount: 1,
          recipient: "3N4XePZG7AcqehJCnUH4J7uUqpqAn3uc7XU",
          additionalFee: 400000,
        },
        accounts.dapp
      );
      await expect(broadcast(txTransfer)).rejectedWith(
        "Transaction is not allowed by account-script"
      );
    });

    let leaseTx = "";
    it("lease is allowed by 2/3", async function () {
      const txTransfer = lease(
        {
          amount: 1,
          recipient: "3N4XePZG7AcqehJCnUH4J7uUqpqAn3uc7XU",
          additionalFee: 400000,
        },
        accounts.dapp
      );
      leaseTx = txTransfer["id"];
      txTransfer["proofs"] = [];
      let SignedTx = signTx(txTransfer, user2);
      SignedTx = signTx(SignedTx, user3);
      await broadcast(SignedTx).catch((e) => console.log(e));
      await waitForTx(SignedTx.id);
    });

    it("cancelLease is not allowed by 1/3", async function () {
      const txTransfer = cancelLease(
        {
          leaseId: leaseTx,
          additionalFee: 400000,
        },
        accounts.dapp
      );
      await expect(broadcast(txTransfer)).rejectedWith(
        "Transaction is not allowed by account-script"
      );
    });

    it("cancelLease is allowed by 2/3", async function () {
      const txTransfer = cancelLease(
        {
          leaseId: leaseTx,
          additionalFee: 400000,
        },
        accounts.dapp
      );
      txTransfer["proofs"] = [];
      let SignedTx = signTx(txTransfer, user2);
      SignedTx = signTx(SignedTx, user3);
      await broadcast(SignedTx).catch((e) => console.log(e));
      await waitForTx(SignedTx.id);
    });

    it("massTransfer is not allowed by 1/3", async function () {
      const txTransfer = massTransfer(
        {
          transfers: [
            { recipient: "3N4XePZG7AcqehJCnUH4J7uUqpqAn3uc7XU", amount: 1 },
          ],
          additionalFee: 400000,
        },
        accounts.dapp
      );
      await expect(broadcast(txTransfer)).rejectedWith(
        "Transaction is not allowed by account-script"
      );
    });

    it("massTransfer is allowed by 2/3", async function () {
      const txTransfer = massTransfer(
        {
          transfers: [
            { recipient: "3N4XePZG7AcqehJCnUH4J7uUqpqAn3uc7XU", amount: 1 },
          ],
          additionalFee: 400000,
        },
        accounts.dapp
      );
      txTransfer["proofs"] = [];
      let SignedTx = signTx(txTransfer, user2);
      SignedTx = signTx(SignedTx, user3);
      await broadcast(SignedTx).catch((e) => console.log(e));
      await waitForTx(SignedTx.id);
    });

    it("invokescript is not allowed by 1/3", async function () {
      const txTransfer = invokeScript(
        {
          version: 1,
          dApp: dapp2,
          call: {
            function: "deposit",
            args: [],
          },
          payment: [{ assetId: null, amount: 1 }],
          additionalFee: 400000,
        },
        accounts.dapp
      );
      await expect(broadcast(txTransfer)).rejectedWith(
        "Transaction is not allowed by account-script"
      );
    });

    it("invokescript is allowed by 2/3", async function () {
      const txTransfer = invokeScript(
        {
          version: 1,
          dApp: dapp2,
          call: {
            function: "deposit",
            args: [],
          },
          payment: [{ assetId: null, amount: 1 }],
          additionalFee: 400000,
        },
        accounts.dapp
      );
      txTransfer["proofs"] = [];
      let SignedTx = signTx(txTransfer, user2);
      SignedTx = signTx(SignedTx, user3);
      await broadcast(SignedTx).catch((e) => console.log(e));
      await waitForTx(SignedTx.id);
    });

    it("setScript is not allowed by 1/3", async function () {
      const script = compile(file("dapp_used_in_test.ride"));
      const txTransfer = setScript(
        {
          script: script,
          additionalFee: 400000,
        },
        accounts.dapp
      );
      await expect(broadcast(txTransfer)).rejectedWith(
        "Transaction is not allowed by account-script"
      );
    });

    it("setScript is allowed by 2/3", async function () {
      const script = compile(file("dapp_used_in_test.ride"));
      const txTransfer = setScript(
        {
          script: script,
          additionalFee: 400000,
        },
        accounts.dapp
      );
      txTransfer["proofs"] = [];
      let SignedTx = signTx(txTransfer, user2);
      SignedTx = signTx(SignedTx, user3);
      await broadcast(SignedTx).catch((e) => console.log(e));
      await waitForTx(SignedTx.id);
    });
  });
});
