class DappUtils {
 static async setupDapp(filename, account) {
    const script = compile(file(filename));
    const ssTx = setScript({ script }, accounts[account]);
    await broadcast(ssTx);
    await waitForTx(ssTx.id);
  }
}

module.exports = DappUtils;
