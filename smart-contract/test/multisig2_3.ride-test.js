const accountUtils = require("./utils/account.utils");
const DappUtils = require("./utils/dapp.utils");

let dapp;
const user2 = "bla die bloe dua dop^pozre";
const user3 = "6465456 qkfishfihfiu";

describe("multisig2_3 test suite", async function () {
  before(async function () {
    this.timeout(0);

    await accountUtils.defineAccounts({
      dapp: 0.1,
      user2: 0.1,
      user3: 0.1,
    });

    await DappUtils.setupDapp("multisig2_3.ride", "dapp");
    dapp = address(accounts.dapp);
    console.log(accounts.dapp);
    console.log(dapp);
  });

  describe("try to do tx", () => {
    it("transfer is not allowed", async function () {
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
  });
});