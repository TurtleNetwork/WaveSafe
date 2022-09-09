/* eslint-disable no-undef */
class DappUtils {
 static async setupDapp(filename, account) {
    const script = compile(file(filename));
    const ssTx = setScript({ script }, accounts[account]);
    await broadcast(ssTx);
    await waitForTx(ssTx.id);
  }

  /**
   * Build an invocation object.
   * @param  {string} dAppToCallAddress 
   * Required
   * @param  {string} functionToCall 
   * Required
   * @param  {string} callSeed
   * Required
   * @param  {string} functionArgsAsArray
   * Optional
   * @param  {string} additionalFeeValue
   * Optional
   * @param  {string} paymentObjectsAsArray
   * Optional
   * @Returns  {invokeScript}
   */
  static buildInvokeScript(dAppToCallAddress, functionToCall, callSeed, functionArgsAsArray, additionalFeeValue, paymentObjectsAsArray) {
    return invokeScript(
      {
        version: 1,
        dApp: dAppToCallAddress,
        payment: paymentObjectsAsArray ? paymentObjectsAsArray : [],
        call: {
          function: functionToCall,
          args: functionArgsAsArray ? functionArgsAsArray : [],
        },
        additionalFee: additionalFeeValue ? additionalFeeValue : 0,
      },
      callSeed
    );
  }

  /**
   * Send a transaction in a broadcast.
   * @param  {string} transaction 
   * @Returns  {Promise}
   * A Promise object containing transaction info.
   */
  static async broadcastAndWaitForResponse(transaction) {
    const promises = (await Promise.all([
      broadcast(transaction).catch(console.log()),
      waitForTx(transaction.id, { timeout: 60_000 })
    ]));

    // Return value can be ignored when not needed.
    return promises[1];
  }

  /**
   * Send a transaction in a broadcast and expect to get an error in response.
   * @param  {string} transaction 
   * A transaction
   * @param  {string} errorMessage 
   * An error message
   * @param  {boolean} customMessage 
   * A boolean deciding to include the default error message prefix.
   */
  static async broadcastAndRejected(transaction, errorMessage, customMessage) {
    if (!customMessage) {
      await expect(broadcast(transaction)).rejectedWith("Error while executing account-script: " + errorMessage);
    } else {
      await expect(broadcast(transaction)).rejectedWith(errorMessage);
    }
  }
}

module.exports = DappUtils;
