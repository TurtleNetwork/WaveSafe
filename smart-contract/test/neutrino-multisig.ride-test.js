const accountUtils = require("./utils/account.utils");
const DappUtils = require("./utils/dapp.utils");

const user_signer2 = "bla die bloe dua dop^pozre";
const user_signer3 = "6465456 qkfishfihfiu";
const MULTISIG_ERROR_MESSAGE = "Transaction is not allowed by account-script";
const WAVES_DECIMAL_MULTIPLIER = 1e8;

/* eslint-disable no-undef */
describe("multisig2_3 - complete flow", () => {
    before(async () => {
        const accountRecords = {
            user_multisig2_3: 16.2,
            user_signer2: 0.1,
            user_signer3: 0.1
        }

        await accountUtils.defineAccounts(accountRecords);
        await DappUtils.setupDapp("multisig2_3.ride", "user_multisig2_3");
    });

    describe("Buy NSBT", () => {
        const NSBT_DAPP = "3N5NAftzfcw3gAt8nc35bNr9UdPTVgC81fd";
        const paymentObjects = [
            {
                assetId: null,
                amount: 10 * WAVES_DECIMAL_MULTIPLIER
            }
        ];

        it("should not buy NSBT when the transaction is only signed by 1 account", async () => {
            const invoke = DappUtils.buildInvokeScript(NSBT_DAPP, "buyNsbt", accounts.user_multisig2_3, undefined, 400_000, paymentObjects);
            invoke["proofs"] = [];

            await DappUtils.broadcastAndRejected(invoke, MULTISIG_ERROR_MESSAGE, true);
        });

        it("should buy NSBT when the transaction is signed by 2 or more accounts", async () => {
            let invoke = DappUtils.buildInvokeScript(NSBT_DAPP, "buyNsbt", accounts.user_multisig2_3, undefined, 400_000, paymentObjects);
            invoke["proofs"] = [];
            invoke = signTx(invoke, user_signer2);
            invoke = signTx(invoke, user_signer3);

            await DappUtils.broadcastAndWaitForResponse(invoke);
        });
    });

    describe("Buy SURF", () => {
        const SURF_DAPP = "3N5NAftzfcw3gAt8nc35bNr9UdPTVgC81fd";
        const functionArgs = [
            {
                "type": "integer",
                "value": 500_000
            },
            {
                "type": "integer",
                "value": 1_000_000
            },
            {
                "type": "boolean",
                "value": false
            }
        ];
        const paymentObjects = [
            {
                assetId: null,
                amount: 5 * WAVES_DECIMAL_MULTIPLIER
            }
        ];

        it("should not buy SURF when the transaction is only signed by 1 account", async () => {
            const invoke = DappUtils.buildInvokeScript(SURF_DAPP, "buySurf", accounts.user_multisig2_3, functionArgs, 400_000, paymentObjects);
            invoke["proofs"] = [];

            await DappUtils.broadcastAndRejected(invoke, MULTISIG_ERROR_MESSAGE, true);
        });

        it("should buy SURF when the transaction is signed by 2 or more accounts", async () => {
            let invoke = DappUtils.buildInvokeScript(SURF_DAPP, "buySurf", accounts.user_multisig2_3, functionArgs, 400_000, paymentObjects);
            invoke["proofs"] = [];
            invoke = signTx(invoke, user_signer2);
            invoke = signTx(invoke, user_signer3);

            await DappUtils.broadcastAndWaitForResponse(invoke);
        });
    });

    describe("Stake NSBT", () => {
        const NSBT_DAPP = "3MuGfNhF98CNBCfthhoJEo6SYUv7zTgkK4J";
        const NSBT_ASSET_ID = 'F3iaxzruFeKujfVfYSZEkejpjh67wmRfPCRHiNmWKp3Z';
        const paymentObjects = [
            {
                assetId: NSBT_ASSET_ID,
                amount: 1 * WAVES_DECIMAL_MULTIPLIER
            }
        ];

        it("should not stake NSBT when the transaction is only signed by 1 account", async () => {
            const invoke = DappUtils.buildInvokeScript(NSBT_DAPP, "stake", accounts.user_multisig2_3, undefined, 400_000, paymentObjects);
            invoke["proofs"] = [];

            await DappUtils.broadcastAndRejected(invoke, MULTISIG_ERROR_MESSAGE, true);
        });

        it("should stake NSBT when the transaction is signed by 2 or more accounts", async () => {
            let invoke = DappUtils.buildInvokeScript(NSBT_DAPP, "stake", accounts.user_multisig2_3, undefined, 400_000, paymentObjects);
            invoke["proofs"] = [];
            invoke = signTx(invoke, user_signer2);
            invoke = signTx(invoke, user_signer3);

            await DappUtils.broadcastAndWaitForResponse(invoke);
        });
    });

    // It is only possible to buy USDN via Neutrino after staking NSBT, hence this happens after the staking.
    describe("Buy USDN", () => {
        const USDN_DAPP = "3N9be2mwrA52WJho6DiesZkk4351GvpnWuj";
        const paymentObjects = [
            {
                assetId: null,
                amount: 1 * WAVES_DECIMAL_MULTIPLIER
            }
        ];

        it("should not buy USDN when the transaction is only signed by 1 account", async () => {
            const invoke = DappUtils.buildInvokeScript(USDN_DAPP, "swapWavesToNeutrino", accounts.user_multisig2_3, undefined, 400_000, paymentObjects);
            invoke["proofs"] = [];

            await DappUtils.broadcastAndRejected(invoke, MULTISIG_ERROR_MESSAGE, true);
        });

        it("should buy USDN when the transaction is signed by 2 or more accounts", async () => {
            let invoke = DappUtils.buildInvokeScript(USDN_DAPP, "swapWavesToNeutrino", accounts.user_multisig2_3, undefined, 400_000, paymentObjects);
            invoke["proofs"] = [];
            invoke = signTx(invoke, user_signer2);
            invoke = signTx(invoke, user_signer3);

            await DappUtils.broadcastAndWaitForResponse(invoke);
        });
    });

    describe("Stake SURF", () => {
        const SURF_DAPP = "3N5yarEiTQccnnuerogYT3BxM5Zc5bRgDZy";
        const SURF_ASSET_ID = 'Dj3PZAFCNWNWJADbySvfYn9RC6siptNteuStkKQpatoo';
        const paymentObjects = [
            {
                assetId: SURF_ASSET_ID,
                amount: 1 * WAVES_DECIMAL_MULTIPLIER
            }
        ];

        it("should not stake SURF when the transaction is only signed by 1 account", async () => {
            const invoke = DappUtils.buildInvokeScript(SURF_DAPP, "stake", accounts.user_multisig2_3, undefined, 400_000, paymentObjects);
            invoke["proofs"] = [];

            await DappUtils.broadcastAndRejected(invoke, MULTISIG_ERROR_MESSAGE, true);
        });

        it("should stake SURF when the transaction is signed by 2 or more accounts", async () => {
            let invoke = DappUtils.buildInvokeScript(SURF_DAPP, "stake", accounts.user_multisig2_3, undefined, 400_000, paymentObjects);
            invoke["proofs"] = [];
            invoke = signTx(invoke, user_signer2);
            invoke = signTx(invoke, user_signer3);

            await DappUtils.broadcastAndWaitForResponse(invoke);
        });
    });
});
