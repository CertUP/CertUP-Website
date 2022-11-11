import { SecretNetworkClient } from 'secretjs';
import { PermitSignature, QueryResponse } from '../interfaces';
import { IssuerDataResponse } from '../interfaces/manager';
import { PermitQuery } from './queries';

let Querier: SecretNetworkClient;

const ensureQuerier = async (): Promise<void> => {
  if (!Querier)
    Querier = await SecretNetworkClient.create({
      grpcWebUrl: process.env.REACT_APP_GRPC_URL,
      chainId: process.env.REACT_APP_CHAIN_ID,
    });
  return;
};

export const checkError = (queryResponse: any) => {
  if (typeof queryResponse === 'string' || queryResponse instanceof String)
    queryResponse = JSON.parse(queryResponse as string) as IssuerDataResponse;

  if (queryResponse.parse_err || queryResponse.generic_err) {
    if (queryResponse.generic_err?.msg.includes('not a verified issuer')) return;

    console.error(queryResponse.parse_err || queryResponse.generic_err);
    if (queryResponse.parse_err) {
      throw new Error(queryResponse.parse_err.msg || queryResponse.parse_err);
    } else if (queryResponse.generic_err) {
      throw new Error(queryResponse.generic_err.msg || queryResponse.generic_err);
    } else {
      throw new Error(JSON.stringify(queryResponse));
    }
  }
};

export const queryWrapper = async (
  query: any,
  contract: string,
  hash: string,
  checkErrors = true,
): Promise<QueryResponse> => {
  try {
    await ensureQuerier();
    if (!Querier) throw new Error('Querier Client not available.');

    let response = (await Querier.query.compute.queryContract({
      contractAddress: contract,
      codeHash: hash,
      query: query,
    })) as QueryResponse | string; // wtf secret.js

    if (typeof response === 'string' || response instanceof String)
      response = JSON.parse(response as string) as QueryResponse;

    // console.log('Query:', query);
    // console.log('Response:', response);

    if (checkErrors) checkError(response);
    return response;
  } catch (error: any) {
    console.error(error);
    if (
      error.toString().includes('Network Error') ||
      error.toString().includes('503') ||
      error.toString().includes('Response closed without headers')
    ) {
      throw 'Failed to query network. The node may be experiencing issues.';
    } else {
      throw error;
    }
  }
};

export const queryNFTContract = async ({
  query,
  checkErrors,
  signature,
}: {
  query: object;
  checkErrors?: boolean;
  signature?: PermitSignature;
}) => {
  if (signature) {
    query = new PermitQuery(query, signature);
  }
  // query = {
  //   with_permit: {
  //     query: query,
  //     permit: {
  //       params: {
  //         permit_name: permitName,
  //         allowed_tokens: allowedTokens,
  //         chain_id: process.env.REACT_APP_CHAIN_ID,
  //         permissions: permissions,
  //       },
  //       signature: QueryPermit,
  //     },
  //   },
  // };

  const response = await queryWrapper(
    query,
    process.env.REACT_APP_NFT_ADDR,
    process.env.REACT_APP_NFT_HASH,
    checkErrors,
  );
  return response;
};

export const queryManagerContract = async ({
  query,
  checkErrors,
  signature,
}: {
  query: object;
  checkErrors?: boolean;
  signature?: PermitSignature;
}) => {
  if (signature) {
    query = new PermitQuery(query, signature);
  }
  // query = {
  //   with_permit: {
  //     query: query,
  //     permit: {
  //       params: {
  //         permit_name: permitName,
  //         allowed_tokens: allowedTokens,
  //         chain_id: process.env.REACT_APP_CHAIN_ID,
  //         permissions: permissions,
  //       },
  //       signature: QueryPermit,
  //     },
  //   },
  // };

  const response = await queryWrapper(
    query,
    process.env.REACT_APP_MANAGER_ADDR,
    process.env.REACT_APP_MANAGER_HASH,
    checkErrors,
  );
  return response;
};

export const queryOldManagerContract = async ({
  query,
  checkErrors,
  signature,
}: {
  query: object;
  checkErrors?: boolean;
  signature?: PermitSignature;
}) => {
  if (signature) {
    query = new PermitQuery(query, signature);
  }

  const response = await queryWrapper(
    query,
    process.env.REACT_APP_OLD_MANAGER_ADDR,
    process.env.REACT_APP_OLD_MANAGER_HASH,
    checkErrors,
  );
  return response;
};
