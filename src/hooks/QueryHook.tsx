import { useState, useEffect, useRef } from 'react';
import { Permit, SecretNetworkClient, Snip20Querier } from 'secretjs';
import { Snip721GetTokensResponse } from 'secretjs/dist/extensions/snip721/msg/GetTokens';
import { useWallet } from '../contexts';
import {
  BatchDossierResponse,
  DossierResponse,
  PermitSignature,
  RemainingCertsResponse,
} from '../interfaces';
import { permissions, allowedTokens, permitName } from '../utils/loginPermit';

export class WithPermit {
  query: object;
  permit: Permit;
  constructor(query: object, signature: PermitSignature) {
    this.query = query || {};
    this.permit = {
      params: {
        permit_name: permitName,
        allowed_tokens: allowedTokens,
        chain_id: process.env.REACT_APP_CHAIN_ID as string,
        permissions: permissions,
      },
      signature: signature,
    };
  }
}

const checkError = (queryResponse: any) => {
  if (queryResponse.parse_err || queryResponse.generic_err) {
    console.error(queryResponse.parse_err || queryResponse.generic_err);
    throw new Error(
      queryResponse.parse_err.msg || queryResponse.generic_err.msg || queryResponse.parse_err
        ? JSON.stringify(queryResponse.parse_err)
        : undefined || queryResponse.generic_err
        ? JSON.stringify(queryResponse.generic_err)
        : undefined || JSON.stringify(queryResponse),
    );
  }
};

export default function useQuery() {
  const { Address, QueryPermit } = useWallet();
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

  const queryCredits = async () => {
    if (!querier.current) throw new Error('Client not available.');
    if (!QueryPermit) throw new Error('QueryPermit not available.');

    const query = {
      with_permit: {
        query: {
          remaining_certs: {
            viewer: {
              address: Address,
            },
          },
        },
        permit: {
          params: {
            permit_name: permitName,
            allowed_tokens: allowedTokens,
            chain_id: process.env.REACT_APP_CHAIN_ID,
            permissions: permissions,
          },
          signature: QueryPermit,
        },
      },
    };

    const response: RemainingCertsResponse | undefined =
      await querier.current.query.compute.queryContract({
        contractAddress: process.env.REACT_APP_MANAGER_ADDR as string,
        codeHash: process.env.REACT_APP_MANAGER_HASH as string,
        query: query,
      });
    if (!response || response.parse_error || response.generic_error)
      throw new Error((response.parse_error || response.generic_error || '').toString());
    //setRemainingCerts(parseInt(response.remaining_certs.certs || '0', 10));
    return parseInt(response.remaining_certs?.certs || '0', 10);
  };

  const getOwnedCerts = async () => {
    if (!querier.current) throw new Error('Querier not available.');
    if (!QueryPermit) throw new Error('QueryPermit not available.');

    // query owned token IDs
    const tokensQuery = {
      tokens: {
        owner: Address,
      },
    };

    const { token_list } = (await queryPermitNFTContract(tokensQuery)) as Snip721GetTokensResponse;
    if (!token_list.tokens.length) return [];

    // query NFT metadata
    const dossierQuery = {
      batch_nft_dossier: {
        token_ids: token_list.tokens,
      },
    };

    const response = (await queryPermitNFTContract(dossierQuery)) as BatchDossierResponse;

    return response.batch_nft_dossier.nft_dossiers;
  };

  const getCert = async (token_id: string) => {
    if (!querier.current) throw new Error('Querier not available.');
    if (!QueryPermit) throw new Error('QueryPermit not available.');

    // query NFT metadata
    const dossierQuery = {
      nft_dossier: {
        token_id: token_id,
      },
    };

    const response = (await queryPermitNFTContract(dossierQuery)) as DossierResponse;

    return response.nft_dossier;
  };

  const getSSCRTBalance = async () => {
    if (!querier.current) throw new Error('Querier not available.');
    if (!QueryPermit) throw new Error('QueryPermit not available.');

    //get view key
    const vkey = await window.keplr?.getSecret20ViewingKey(
      process.env.REACT_APP_CHAIN_ID as string,
      process.env.REACT_APP_SSCRT_ADDR as string,
    );
    console.log(vkey);

    const response = await querier.current.query.snip20.getBalance({
      contract: {
        address: process.env.REACT_APP_SNIP20_ADDR as string,
        codeHash: process.env.REACT_APP_SNIP20_HASH as string,
      },
      address: Address,
      auth: {
        key: vkey,
      },
    });
    checkError(response);
    return parseInt(response.balance?.amount || '0', 10) / 10e5;
  };

  const getSCRTBalance = async (): Promise<number> => {
    if (!querier.current) throw new Error('Querier not available.');

    const response = await querier.current.query.bank.balance({
      address: Address,
      denom: 'uscrt',
    });
    checkError(response);
    return parseInt(response.balance?.amount || '0', 10) / 10e5;
  };

  const queryNFTContract = async (query: object) => {
    if (!querier.current) throw new Error('Querier not available.');

    const response = await querier.current.query.compute.queryContract({
      contractAddress: process.env.REACT_APP_NFT_ADDR as string,
      codeHash: process.env.REACT_APP_NFT_HASH as string,
      query: query,
    });
    checkError(response);
    return response;
  };

  const queryPermitNFTContract = async (query: object) => {
    const permitQuery = {
      with_permit: {
        query: query,
        permit: {
          params: {
            permit_name: permitName,
            allowed_tokens: allowedTokens,
            chain_id: process.env.REACT_APP_CHAIN_ID,
            permissions: permissions,
          },
          signature: QueryPermit,
        },
      },
    };
    //console.log('wrapped permit query', permitQuery);

    return await queryNFTContract(permitQuery);

    // return await querier.current.query.compute.queryContract({
    //   contractAddress: process.env.REACT_APP_NFT_ADDR as string,
    //   codeHash: process.env.REACT_APP_NFT_HASH as string,
    //   query: permitQuery,
    // });
  };

  return {
    queryCredits,
    getOwnedCerts,
    getCert,
    getSSCRTBalance,
    getSCRTBalance,
    queryNFTContract,
    queryPermitNFTContract,
  };
}
