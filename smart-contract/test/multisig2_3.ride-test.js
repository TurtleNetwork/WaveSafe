const accountUtils = require("./utils/account.utils");
const DappUtils = require("./utils/dapp.utils");

let dapp;
let randomUserAddress;

describe("multisig2_3 test suite", async function () {
  before(async function () {
    this.timeout(0);

    await accountUtils.defineAccounts({
      dapp: 0.1,
      randomUser: 0.1,
    });

    await DappUtils.setupDapp("multisig2_3.ride", "dapp");
    randomUserAddress = address(accounts.randomUser);
    dapp = address(accounts.dapp);
  });

  describe("test", () => {
    it("test", async function () {
      const txTransfer = transfer(
        {
          amount: 1,
          recipient: randomUserAddress,
          additionalFee: 400000,
        },
        accounts.dapp
      );
      await expect(broadcast(txTransfer)).rejectedWith(
        "Transaction is not allowed by account-script"
      );
    });
  });
});
