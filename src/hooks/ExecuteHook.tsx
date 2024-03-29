import { useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { MsgExecuteContract, SecretNetworkClient, Tx, TxResultCode } from 'secretjs';
import { useWallet } from '../contexts';
import { useIssuer } from '../contexts/IssuerContext';
import { useNft } from '../contexts/NftContext';
import { ComputeTx, ComputeResultCode } from '../interfaces';
import { PreLoad } from '../interfaces/manager';
import { ToastProps } from '../utils/toastHelper';

export default function useExecute() {
  const { Client, Address, QueryPermit, ProcessingTx, setProcessingTx, DummyWallet } = useWallet();
  const { refreshIssuer } = useIssuer();

  const { refreshDossiers } = useNft();
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

  const parseComputeError = (tx: ComputeTx) => {
    if (!tx.code) return;

    const errorMsg = tx.jsonLog?.generic_err?.msg || tx.jsonLog?.parse_err?.msg || tx.rawLog;

    switch (tx.code) {
      case ComputeResultCode.ErrExecuteFailed:
        throw new Error(`Execute contract failed: ${errorMsg}`);

      // ErrQueryFailed error for rust smart query contract failure
      case ComputeResultCode.ErrQueryFailed:
        throw new Error(`Query contract failed: ${errorMsg}`);

      // ErrAccountExists error for a contract account that already exists
      case ComputeResultCode.ErrAccountExists:
        throw new Error(`Experienced account already exists error: ${errorMsg}`);

      // ErrGasLimit error for out of gas
      case ComputeResultCode.ErrGasLimit:
        throw new Error(`Exceeded gas limit.\nGas Limit: ${tx.gasWanted}\nGas Used: ${tx.gasUsed}`);

      // ErrNotFound error for an entry not found in the store
      case ComputeResultCode.ErrNotFound:
        throw new Error(`Contract not found: ${errorMsg}`);

      // ErrInvalidMsg error when we cannot process the error returned from the contract
      case ComputeResultCode.ErrInvalidMsg:
        throw new Error(`Experienced invalid message error: ${errorMsg}`);

      // ErrEmpty error for empty content
      case ComputeResultCode.ErrEmpty:
        throw new Error(`Empty Contract: ${errorMsg}`);

      // ErrLimit error for content that exceeds a limit
      case ComputeResultCode.ErrLimit:
        throw new Error(`Experienced Limit Exceeded error: ${errorMsg}`);

      // ErrInvalid error for content that is invalid in this context
      case ComputeResultCode.ErrInvalid:
        throw new Error(`Invalid context: ${errorMsg}`);

      // ErrDuplicate error for content that exsists
      case ComputeResultCode.ErrDuplicate:
        throw new Error(`Duplicate content: ${errorMsg}`);

      // ErrSigFailed error for wasm code that has already been uploaded or failed
      case ComputeResultCode.ErrSigFailed:
        throw new Error(`Experienced Sig Failed error: ${errorMsg}`);

      // case TxResultCode.ErrInsufficientFunds:
      //   //check if SCRT was sent
      //   if (tx.tx.body.messages.find((msg) => msg.value.sent_funds.length > 0)) {
      //     console.log('TX TODO Check this and make a better error', tx);
      //     throw new Error('Insufficent Funds');
      //   }

      //   // If not, only fees were trying to be paid
      //   throw new Error('Insufficent Funds for Transaction Fees');
    }
  };

  const parseError = (tx: ComputeTx) => {
    if (!tx.code) return;
    console.log('Failed TX', tx);
    console.error(tx.rawLog);
    if (/*tx.codespace === 'compute' || */ tx.rawLog.includes('contract')) parseComputeError(tx);
    else parseCosmosError(tx);
  };

  const parseCosmosError = (tx: ComputeTx) => {
    if (!tx.code) return;

    switch (tx.code) {
      /** ErrInternal should never be exposed, but we reserve this code for non-specified errors */
      case TxResultCode.ErrInternal:
        throw new Error('Node Internal Error Occured');

      /** ErrTxDecode is returned if we cannot parse a transaction */
      case TxResultCode.ErrTxDecode:
        throw new Error('Unable to Decode Transaction');

      /** ErrInvalidSequence is used the sequence number (nonce) is incorrect for the signature */
      case TxResultCode.ErrInvalidSequence:
        throw new Error('Executed Out of Order. You may have a transaction pending or the system may be overloaded.');

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
        throw new Error('Insufficent fees. Select a higher gas price.');

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

  interface RegisterProps {
    name?: string;
    website?: string;
    logo_img_url?: string;
    toastRef?: any;
  }
  const registerIssuer = async ({ name, website, logo_img_url, toastRef }: RegisterProps): Promise<ComputeTx> => {
    if (!Client) throw new Error('Client not available.');
    if (!QueryPermit) throw new Error('QueryPermit not available.');

    // const price = 3; // uSSCRT
    // const total: string = (numCerts * price).toString();

    const msg = {
      quick_register_issuer: {
        new_issuer: {
          addr: Address,
          name,
          website,
          logo_img_url,
        },
      },
    };

    const response = await executeManager(msg, 175000, toastRef);

    refreshIssuer();
    return response as ComputeTx;
  };

  const editProfile = async ({ name, website, logo_img_url, toastRef }: RegisterProps): Promise<ComputeTx> => {
    if (!Client) throw new Error('Client not available.');
    if (!QueryPermit) throw new Error('QueryPermit not available.');

    const editMsg = {
      edit_issuer: {
        issuer_params: {
          addr: Address,
          name,
          website,
          logo_img_url,
        },
      },
    };

    const response = await executeManager(editMsg, 135_000, toastRef);

    refreshIssuer();
    return response as ComputeTx;
  };

  interface EditIssuerProps extends RegisterProps {
    issuer: string;
    verified?: boolean;
    verified_name?: string;
  }

  const editIssuer = async ({
    name,
    website,
    logo_img_url,
    verified,
    verified_name,
    toastRef,
  }: EditIssuerProps): Promise<ComputeTx> => {
    if (!Client) throw new Error('Client not available.');

    const editMsg = {
      admin_edit_issuer: {
        issuer_params: {
          addr: Address,
          name,
          website,
          logo_img_url,
          verified,
          verified_name,
        },
      },
    };

    const response = await executeManager(editMsg, 155_000, toastRef);

    return response as ComputeTx;
  };

  const addCerts = async ({
    issuer,
    num_certs,
    toastRef,
  }: {
    issuer: string;
    num_certs: number;
    toastRef?: any;
  }): Promise<ComputeTx> => {
    if (!Client) throw new Error('Client not available.');

    const editMsg = {
      admin_add_certs: {
        issuer,
        certs: num_certs.toString(),
      },
    };

    const response = await executeManager(editMsg, 155_000, toastRef);

    return response as ComputeTx;
  };

  const paySSCRT = async ({
    numCerts,
    amount,
    toastRef,
    coupon,
  }: {
    numCerts: number;
    amount: string;
    toastRef: any;
    coupon?: string;
  }): Promise<ComputeTx> => {
    if (!Client) throw new Error('Client not available.');
    if (!QueryPermit) throw new Error('QueryPermit not available.');

    // const price = 3; // uSSCRT
    // const total: string = (numCerts * price).toString();

    const addCertsMsg = {
      add_certs: {
        purchased_certs: numCerts.toString(),
        coupon_code: coupon,
      },
    };

    const sendMsg = {
      send: {
        recipient: process.env.REACT_APP_MANAGER_ADDR,
        amount: amount,
        msg: btoa(JSON.stringify(addCertsMsg)),
      },
    };

    const response = await executeToken(sendMsg, 500000, toastRef);

    // const response = await Client.tx.snip20.send(
    //   {
    //     contractAddress: process.env.REACT_APP_SNIP20_ADDR,
    //     codeHash: process.env.REACT_APP_SNIP20_HASH,
    //     sender: Address,
    //     msg: sendMsg,
    //   {
    //     gasLimit: 100000,
    //     gasPriceInFeeDenom: parseFloat(process.env.REACT_APP_GAS_PRICE || '0.25'),
    //   },
    // );

    refreshIssuer();
    return response as ComputeTx;
  };

  const paySCRT = async ({
    numCerts,
    amount,
    coupon,
  }: {
    numCerts: number;
    amount: string;
    coupon?: string;
  }): Promise<ComputeTx> => {
    if (!Client) throw new Error('Client not available.');
    if (!QueryPermit) throw new Error('QueryPermit not available.');

    // const price = 3; // uSSCRT
    // const total: string = (numCerts * price).toString();

    const depositMsg = new MsgExecuteContract({
      sender: Address,
      contractAddress: process.env.REACT_APP_SNIP20_ADDR,
      codeHash: process.env.REACT_APP_SNIP20_HASH,
      msg: {
        deposit: {},
      },
      sentFunds: [
        {
          denom: 'uscrt',
          amount: amount,
        },
      ],
    });

    const addCertsMsg = {
      add_certs: {
        purchased_certs: numCerts.toString(),
        coupon_code: coupon,
      },
    };

    const sendMsg = new MsgExecuteContract({
      sender: Address,
      contractAddress: process.env.REACT_APP_SNIP20_ADDR,
      codeHash: process.env.REACT_APP_SNIP20_HASH,
      msg: {
        send: {
          recipient: process.env.REACT_APP_MANAGER_ADDR,
          amount: amount,
          msg: btoa(JSON.stringify(addCertsMsg)),
        },
      },
    });

    const response = await Client.tx.broadcast([depositMsg, sendMsg], {
      gasLimit: 1_500_000,
      gasPriceInFeeDenom: parseFloat(process.env.REACT_APP_GAS_PRICE || '0.25'),
    });

    // const response = await Client.tx.snip20.send(
    //   {
    //     contractAddress: process.env.REACT_APP_SNIP20_ADDR,
    //     codeHash: process.env.REACT_APP_SNIP20_HASH,
    //     sender: Address,
    //     msg: {
    //       send: {
    //         recipient: process.env.REACT_APP_MANAGER_ADDR,
    //         amount: amount,
    //         msg: btoa(JSON.stringify(addCertsMsg)),
    //       },
    //     },
    //   },
    //   {
    //     gasLimit: 100000,
    //     gasPriceInFeeDenom: parseFloat(process.env.REACT_APP_GAS_PRICE || '0.25'),
    //   },
    // );
    parseError(response as ComputeTx);
    refreshIssuer();
    return response as ComputeTx;
  };

  interface PreloadProps {
    data: PreLoad[];
    project_id: string;
    toast?: any;
  }

  const preloadCerts = async ({ data, project_id, toast }: PreloadProps) => {
    if (!Client) throw new Error('Client not available.');

    const preloadMsg = {
      pre_load: {
        project_id,
        new_data: data,
      },
    };

    // const simulationGas = await simulateManager(preloadMsg);
    // console.log('Sim result', simulationGas);

    const gas = 100_000 + 35_000 * data.length;

    const response = await executeManager(preloadMsg, gas, toast);
    console.log('Preload Used', response.gasUsed, 'gas.');
    refreshIssuer();
    return response;
  };

  const claimCert = async (claim_code: string, toast: any) => {
    if (!Client) throw new Error('Client not available.');

    const mintMsg = {
      mint_cert: {
        cert_key: claim_code,
        recipient: Address,
      },
    };

    // const simulationGas = await simulateManager(mintMsg);
    // console.log('Sim result', simulationGas);

    const response = await executeManager(mintMsg, 100_000, toast);
    console.log('Mint used', response.gasUsed, 'gas.');
    refreshDossiers();
    return response;
  };

  const executeManager = async (msg: any, gas = 50000, toastRef?: any) => {
    try {
      const response = await execute({
        msg,
        gas,
        toastRef,
        contract: process.env.REACT_APP_MANAGER_ADDR,
        hash: process.env.REACT_APP_MANAGER_HASH,
      });
      return response;
    } catch (err: any) {
      setProcessingTx(false);
      toast.update(toastRef, new ToastProps(err.toString(), 'error'));
      throw err;
    }
  };

  const simulateManager = async (msg: any) => {
    if (!DummyWallet) throw new Error('Client not available.');

    try {
      const response = await DummyWallet.client.tx.compute.executeContract.simulate({
        contractAddress: process.env.REACT_APP_MANAGER_ADDR,
        codeHash: process.env.REACT_APP_MANAGER_HASH,
        sender: DummyWallet.address,
        msg: msg,
      });
      parseError(response as ComputeTx);

      if (!response) throw new Error('Transaction Simulation failed to return a response.'); //todo handle this

      console.log('Simulation Used:', response.gasInfo?.gasUsed);

      //return gas used with some overhead
      const gasLimit = Math.floor(
        parseInt(response.gasInfo?.gasUsed || '500000', 10) *
          parseFloat(process.env.REACT_APP_SIM_MULTIPLIER || '1.08'),
      );
      console.log('Recommended Limit:', gasLimit);
      return gasLimit;
    } catch (err: any) {
      console.error('TX Simulation Error', err);
      // throw err;
      return 0;
    }
  };

  interface ExecuteProps {
    msg: any;
    gas: number;
    toastRef?: any;
    contract: string;
    hash: string;
    isRetry?: boolean;
  }

  const execute = async ({
    msg,
    gas = 75000,
    toastRef,
    contract,
    hash,
    isRetry = false,
  }: ExecuteProps): Promise<ComputeTx> => {
    if (!Client) throw new Error('Client not available.');

    if (toastRef) toast.update(toastRef, { render: 'Processing Transaction...', isLoading: true });
    else toastRef = toast.loading('Processing Transaction...');
    try {
      setProcessingTx(true);

      let response: Tx | ComputeTx = await Client.tx.compute.executeContract(
        {
          contractAddress: contract,
          codeHash: hash,
          sender: Address,
          msg: msg,
        },
        {
          gasLimit: gas,
          gasPriceInFeeDenom: parseFloat(process.env.REACT_APP_GAS_PRICE || '0.25'),
        },
      );
      console.log('Gas Limit:', response.gasWanted);
      console.log('Gas Used:', response.gasUsed);
      if (response.rawLog.includes('Out of gas') && !isRetry) {
        if (toastRef) {
          toast.update(
            toastRef,
            new ToastProps('Transaction Failed: Out of Gas. Trying again with more gas.', 'error', 10000),
          );
          toastRef = undefined;
        }

        response = await execute({
          msg,
          gas: gas * 1.25, //todo set to 1.25 once gas problem is fixed
          //toastRef,
          contract,
          hash,
          isRetry: true,
        });
      }
      parseError(response as ComputeTx);
      setProcessingTx(false);
      if (toastRef) toast.update(toastRef, new ToastProps('Transaction Succeeded', 'success'));
      return response;
    } catch (err: any) {
      let errorMsg;
      if (err.toString().includes(`account ${Address} not found`)) {
        errorMsg = `Address is not active. Send some SCRT there to activate.`;
      } else {
        errorMsg = err.toString();
      }
      setProcessingTx(false);
      toast.update(toastRef, new ToastProps(errorMsg, 'error'));
      throw new Error(errorMsg);
    }
  };

  const executeNft = async (msg: any, gas = 75000, toastRef?: any) => {
    // if (!Client) throw new Error('Client not available.');

    // if (toastRef) toast.update(toastRef, { render: 'Processing Transaction...', isLoading: true });
    // else toastRef = toast.loading('Processing Transaction...');
    try {
      // setProcessingTx(true);

      // const response = await Client.tx.compute.executeContract(
      //   {
      //     contractAddress: process.env.REACT_APP_NFT_ADDR,
      //     codeHash: process.env.REACT_APP_NFT_HASH,
      //     sender: Address,
      //     msg: msg,
      //   },
      //   {
      //     gasLimit: gas,
      //     gasPriceInFeeDenom: parseFloat(process.env.REACT_APP_GAS_PRICE || '0.25'),
      //   },
      // );
      // console.log('Gas Limit:', response.gasWanted);
      // console.log('Gas Used:', response.gasUsed);
      // parseError(response as ComputeTx);
      // setProcessingTx(false);
      // if (toastRef) toast.update(toastRef, new ToastProps('Transaction Succeeded', 'success'));

      const response = await execute({
        msg,
        gas,
        toastRef,
        contract: process.env.REACT_APP_NFT_ADDR,
        hash: process.env.REACT_APP_NFT_HASH,
      });
      return response;
    } catch (err: any) {
      setProcessingTx(false);
      toast.update(toastRef, new ToastProps(err.toString(), 'error'));
      throw err;
    }
  };

  const executeToken = async (msg: any, gas = 50000, toastRef?: any) => {
    if (!Client) throw new Error('Client not available.');

    if (toastRef) toast.update(toastRef, { render: 'Processing Transaction...', isLoading: true });
    else toastRef = toast.loading('Processing Transaction...');
    try {
      setProcessingTx(true);

      const response = await Client.tx.compute.executeContract(
        {
          contractAddress: process.env.REACT_APP_SNIP20_ADDR,
          codeHash: process.env.REACT_APP_SNIP20_HASH,
          sender: Address,
          msg: msg,
        },
        {
          gasLimit: gas,
          gasPriceInFeeDenom: parseFloat(process.env.REACT_APP_GAS_PRICE || '0.25'),
        },
      );
      setProcessingTx(false);

      parseError(response as ComputeTx);

      if (toastRef) toast.update(toastRef, new ToastProps('Transaction Succeeded', 'success'));
      return response;
    } catch (err: any) {
      setProcessingTx(false);
      toast.update(toastRef, new ToastProps(err.toString(), 'error'));
      throw err;
    }
  };

  const approveAccessGlobal = async (tokenId: string, toastRef?: any) => {
    if (!Client) throw new Error('Client not available.');

    const approveMsg = {
      set_global_approval: {
        token_id: tokenId,
        view_private_metadata: 'approve_token',
      },
    };

    const response = await executeNft(approveMsg, 150000, toastRef);
    return response;
  };

  const revokeAccessGlobal = async (tokenId: string, toastRef?: any) => {
    if (!Client) throw new Error('Client not available.');

    const approveMsg = {
      set_global_approval: {
        token_id: tokenId,
        view_private_metadata: 'revoke_token',
      },
    };

    const response = await executeNft(approveMsg, 150000, toastRef);
    return response;
  };

  interface allowAccessRequest {
    tokenId: string;
    address: string;
    toastRef?: any;
  }

  const allowAddressAccess = async ({ tokenId, address, toastRef }: allowAccessRequest) => {
    const approveMsg = {
      set_whitelisted_approval: {
        token_id: tokenId,
        address: address,
        view_private_metadata: 'approve_token',
      },
    };

    const response = await executeNft(approveMsg, 200000, toastRef);
    return response;
  };

  const removeAddressAccess = async ({ tokenId, address, toastRef }: allowAccessRequest) => {
    const removeMsg = {
      set_whitelisted_approval: {
        token_id: tokenId,
        address: address,
        view_private_metadata: 'none',
        view_owner: 'none',
        transfer: 'none',
      },
    };

    const response = await executeNft(removeMsg, 200000, toastRef);
    return response;
  };

  interface generateAccessCodeProps {
    tokenId: string;
    code?: string;
    toastRef?: any;
  }

  interface revokeAccessCodeProps {
    tokenId: string;
    code: string;
    toastRef?: any;
  }

  const generateAccessCode = async ({ tokenId, code, toastRef }: generateAccessCodeProps) => {
    const approveMsg = {
      set_code_approval: {
        token_id: tokenId,
        code: code,
        view_private_metadata: 'approve_token',
      },
    };

    const response = await executeNft(approveMsg, 150_000, toastRef);
    return response;
  };

  const removeAccessCode = async ({ tokenId, code, toastRef }: revokeAccessCodeProps) => {
    const removeMsg = {
      set_code_approval: {
        token_id: tokenId,
        code: code,
        view_private_metadata: 'none',
        view_owner: 'none',
        transfer: 'none',
      },
    };

    const response = await executeNft(removeMsg, 150_000, toastRef);
    return response;
  };

  return {
    paySSCRT,
    paySCRT,
    preloadCerts,
    generateAccessCode,
    removeAccessCode,
    allowAddressAccess,
    removeAddressAccess,
    approveAccessGlobal,
    revokeAccessGlobal,
    claimCert,
    registerIssuer,
    editProfile,
    editIssuer,
    addCerts,
  };
}
