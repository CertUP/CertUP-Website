import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import {
  Coin,
  MsgExecuteContract,
  SecretNetworkClient,
  Snip20Querier,
  Tx,
  TxResultCode,
} from 'secretjs';
import { Snip721GetTokensResponse } from 'secretjs/dist/extensions/snip721/msg/GetTokens';
import { useWallet } from '../contexts';
import {
  BatchDossierResponse,
  DossierResponse,
  PreloadData,
  RemainingCertsResponse,
} from '../interfaces';
import { permissions, allowedTokens, permitName } from '../utils/loginPermit';
import { ToastProps } from '../utils/toastHelper';

export default function useExecute() {
  const { Client, Address, QueryPermit, queryCredits, ProcessingTx, setProcessingTx } = useWallet();
  const querier = useRef<SecretNetworkClient>();

  useEffect(() => {
    const run = async () => {
      querier.current = await SecretNetworkClient.create({
        grpcWebUrl: process.env.REACT_APP_GRPC_URL as string,
        chainId: process.env.REACT_APP_CHAIN_ID as string,
      });
    };
    run();
  });

  const parseError = (tx: Tx) => {
    if (!tx.code) return;
    console.log('Failed TX', tx);
    console.error(tx.rawLog);

    switch (tx.code) {
      /** ErrInternal should never be exposed, but we reserve this code for non-specified errors */
      case TxResultCode.ErrInternal:
        throw new Error('Node Internal Error Occured');

      /** ErrTxDecode is returned if we cannot parse a transaction */
      case TxResultCode.ErrTxDecode:
        throw new Error('Unable to Decode Transaction');

      /** ErrInvalidSequence is used the sequence number (nonce) is incorrect for the signature */
      case TxResultCode.ErrInvalidSequence:
        throw new Error(
          'Executed Out of Order. You may have a transaction pending or the system may be overloaded.',
        );

      /** ErrUnauthorized is used whenever a request without sufficient authorization is handled. */
      case TxResultCode.ErrUnauthorized:
        throw new Error('Transaction Unauthorized');

      /** ErrInsufficientFunds is used when the account cannot pay requested amount. */
      case TxResultCode.ErrInsufficientFunds:
        //check if SCRT was sent
        if (tx.tx.body.messages.find((msg) => msg.value.sent_funds.length > 0)) {
          console.log('TX TODO Check this and make a better error', tx);
          throw new Error('Insufficent Funds');
        }

        // If not, only fees were trying to be paid
        throw new Error('Insufficent Funds for Transaction Fees');

      /** ErrUnknownRequest to doc */
      case TxResultCode.ErrUnknownRequest:
        throw new Error(tx.rawLog);

      /** ErrInvalidAddress to doc */
      case TxResultCode.ErrInvalidAddress:
        throw new Error(tx.rawLog);

      /** ErrInvalidPubKey to doc */
      case TxResultCode.ErrInvalidPubKey:
        throw new Error(tx.rawLog);

      /** ErrUnknownAddress to doc */
      case TxResultCode.ErrUnknownAddress:
        throw new Error(tx.rawLog);

      /** ErrInvalidCoins to doc */
      case TxResultCode.ErrInvalidCoins:
        throw new Error(tx.rawLog);

      /** ErrOutOfGas to doc */
      case TxResultCode.ErrOutOfGas:
        throw new Error(`Exceeded gas limit.\nGas Limit: ${tx.gasWanted}\nGas Used: ${tx.gasUsed}`);

      /** ErrMemoTooLarge to doc */
      case TxResultCode.ErrMemoTooLarge:
        throw new Error('Memo too Long');

      /** ErrInsufficientFee to doc */
      case TxResultCode.ErrInsufficientFee:
        // const feeProvided = parseInt(tx.tx.authInfo.fee?.amount[0].amount || '0') / 10e5;
        console.log('TX TODO Check this and make a better error', tx);
        throw new Error('Insufficent fees');

      /** ErrTooManySignatures to doc */
      case TxResultCode.ErrTooManySignatures:
        throw new Error(tx.rawLog);

      /** ErrNoSignatures to doc */
      case TxResultCode.ErrNoSignatures:
        throw new Error('Transaction was not signed');

      /** ErrJSONMarshal defines an ABCI typed JSON marshalling error */
      case TxResultCode.ErrJSONMarshal:
        throw new Error(tx.rawLog);

      /** ErrJSONUnmarshal defines an ABCI typed JSON unmarshalling error */
      case TxResultCode.ErrJSONUnmarshal:
        throw new Error(tx.rawLog);

      /** ErrInvalidRequest defines an ABCI typed error where the request contains invalid data. */
      case TxResultCode.ErrInvalidRequest:
        throw new Error(tx.rawLog);

      /** ErrTxInMempoolCache defines an ABCI typed error where a tx already exists in the mempool. */
      case TxResultCode.ErrTxInMempoolCache:
        throw new Error(tx.rawLog);

      /** ErrMempoolIsFull defines an ABCI typed error where the mempool is full. */
      case TxResultCode.ErrMempoolIsFull:
        throw new Error(tx.rawLog);

      /** ErrTxTooLarge defines an ABCI typed error where tx is too large. */
      case TxResultCode.ErrTxTooLarge:
        throw new Error(tx.rawLog);

      /** ErrKeyNotFound defines an error when the key doesn't exist */
      case TxResultCode.ErrKeyNotFound:
        throw new Error(tx.rawLog);

      /** ErrWrongPassword defines an error when the key password is invalid. */
      case TxResultCode.ErrWrongPassword:
        throw new Error(tx.rawLog);

      /** ErrorInvalidSigner defines an error when the tx intended signer does not match the given signer. */
      case TxResultCode.ErrorInvalidSigner:
        throw new Error(tx.rawLog);

      /** ErrorInvalidGasAdjustment defines an error for an invalid gas adjustment */
      case TxResultCode.ErrorInvalidGasAdjustment:
        throw new Error(tx.rawLog);

      /** ErrInvalidHeight defines an error for an invalid height */
      case TxResultCode.ErrInvalidHeight:
        throw new Error(tx.rawLog);

      /** ErrInvalidVersion defines a general error for an invalid version */
      case TxResultCode.ErrInvalidVersion:
        throw new Error(tx.rawLog);

      /** ErrInvalidChainID defines an error when the chain-id is invalid. */
      case TxResultCode.ErrInvalidChainID:
        throw new Error(tx.rawLog);

      /** ErrInvalidType defines an error an invalid type. */
      case TxResultCode.ErrInvalidType:
        throw new Error(tx.rawLog);

      /** ErrTxTimeoutHeight defines an error for when a tx is rejected out due to an explicitly set timeout height. */
      case TxResultCode.ErrTxTimeoutHeight:
        throw new Error(tx.rawLog);

      /** ErrUnknownExtensionOptions defines an error for unknown extension options. */
      case TxResultCode.ErrUnknownExtensionOptions:
        throw new Error(tx.rawLog);

      /** ErrWrongSequence defines an error where the account sequence defined in the signer info doesn't match the account's actual sequence number. */
      case TxResultCode.ErrWrongSequence:
        throw new Error(tx.rawLog);

      /** ErrPackAny defines an error when packing a protobuf message to Any fails. */
      case TxResultCode.ErrPackAny:
        throw new Error(tx.rawLog);

      /** ErrUnpackAny defines an error when unpacking a protobuf message from Any fails. */
      case TxResultCode.ErrUnpackAny:
        throw new Error(tx.rawLog);

      /** ErrLogic defines an internal logic error, e.g. an invariant or assertion that is violated. It is a programmer error, not a user-facing error. */
      case TxResultCode.ErrLogic:
        throw new Error(tx.rawLog);

      /** ErrConflict defines a conflict error, e.g. when two goroutines try to access the same resource and one of them fails. */
      case TxResultCode.ErrConflict:
        throw new Error(tx.rawLog);

      /** ErrNotSupported is returned when we call a branch of a code which is currently not supported. */
      case TxResultCode.ErrNotSupported:
        throw new Error(tx.rawLog);

      /** ErrNotFound defines an error when requested entity doesn't exist in the state. */
      case TxResultCode.ErrNotFound:
        throw new Error(tx.rawLog);

      /** ErrIO should be used to wrap internal errors caused by external operation. Examples: not DB domain error, file writing etc... */
      case TxResultCode.ErrIO:
        throw new Error(tx.rawLog);

      /** ErrAppConfig defines an error occurred if min-gas-prices field in BaseConfig is empty. */
      case TxResultCode.ErrAppConfig:
        throw new Error(tx.rawLog);

      /** ErrPanic is only set when we recover from a panic, so we know to redact potentially sensitive system info. */
      case TxResultCode.ErrPanic:
        throw new Error('Node Panicked');
    }
  };

  const paySSCRT = async (numCerts: number): Promise<Tx> => {
    if (!Client) throw new Error('Client not available.');
    if (!QueryPermit) throw new Error('QueryPermit not available.');

    const price = 3; // uSSCRT
    const total: string = (numCerts * price).toString();
    // const total2: Coin = { }

    const addCertsMsg = {
      add_certs: {
        purchased_certs: numCerts.toString(),
      },
    };

    const response = await Client.tx.snip20.send(
      {
        contractAddress: process.env.REACT_APP_SNIP20_ADDR,
        codeHash: process.env.REACT_APP_SNIP20_HASH,
        sender: Address,
        msg: {
          send: {
            recipient: process.env.REACT_APP_MANAGER_ADDR,
            amount: total,
            msg: btoa(JSON.stringify(addCertsMsg)),
          },
        },
      },
      {
        gasLimit: 45000,
        gasPriceInFeeDenom: parseFloat(process.env.REACT_APP_GAS_PRICE || '0.25'),
      },
    );
    parseError(response);
    queryCredits();
    return response;
  };

  const preloadCerts = async (data: PreloadData[], toast?: any) => {
    if (!Client) throw new Error('Client not available.');
    if (!QueryPermit) throw new Error('QueryPermit not available.');
    const preloadMsg = {
      pre_load: {
        new_data: data,
      },
    };

    //todo: extimate gas based on number of participants
    const response = await executeManager(preloadMsg, 55000, toast);
    queryCredits();
    return response;
  };

  const executeManager = async (msg: any, gas = 50000, toastRef?: any) => {
    if (!Client) throw new Error('Client not available.');
    if (!QueryPermit) throw new Error('QueryPermit not available.');
    if (toastRef) toast.update(toastRef, { render: 'Processing Transaction...', isLoading: true });
    else toastRef = toast.loading('Processing Transaction...');
    try {
      setProcessingTx(true);

      const response = await Client.tx.compute.executeContract(
        {
          contractAddress: process.env.REACT_APP_MANAGER_ADDR,
          codeHash: process.env.REACT_APP_MANAGER_HASH,
          sender: Address,
          msg: msg,
        },
        {
          gasLimit: 45000,
          gasPriceInFeeDenom: parseFloat(process.env.REACT_APP_GAS_PRICE || '0.25'),
        },
      );
      parseError(response);
      setProcessingTx(false);
      if (toastRef) toast.update(toastRef, new ToastProps('Transaction Succeeded', 'success'));
      return response;
    } catch (err: any) {
      setProcessingTx(false);
      toast.update(toastRef, new ToastProps(err.toString(), 'error'));
      throw err;
    }
  };

  return { paySSCRT, preloadCerts };
}
