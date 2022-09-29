import { useState, useEffect, useRef } from 'react';
import { Permit, SecretNetworkClient, Snip20Querier } from 'secretjs';
import { Snip721GetTokensResponse } from 'secretjs/dist/extensions/snip721/msg/GetTokens';
import { useWallet } from '../contexts';
import { PermitSignature, QueryResponse } from '../interfaces';
import { BatchDossierResponse, DossierResponse, NftDossier } from '../interfaces/721';
import {
  RemainingCertsResponse,
  IssuerData,
  IssuerDataResponse,
  PubIssuerData,
  GetIssuerResponse,
  CertPriceResponse,
  ListProjectsResponse,
  ProjectToken,
  ProjectDataResponse,
  Issuer,
} from '../interfaces/manager';
import { permissions, allowedTokens, permitName } from '../utils/loginPermit';

interface TokenApprovalsResponse {
  token_approvals: TokenApprovals;
}

export interface TokenApprovals {
  owner_is_public: boolean;
  public_ownership_expiration: Snip721Expiration;
  private_metadata_is_public: boolean;
  private_metadata_is_public_expiration: Snip721Expiration;
  token_approvals: Snip721Approval[];
}

export interface Snip721Approval {
  address: string;
  view_owner_expiration: Snip721Expiration;
  view_private_metadata_expiration: Snip721Expiration;
  transfer_expiration: Snip721Expiration;
}

enum Snip721Expiration {
  'never',
  TimeExpiration,
  HeightExpiration,
}

interface TimeExpiration {
  at_time: number;
}
interface HeightExpiration {
  at_height: number;
}

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

export const queryWithClient = async (
  query: any,
  contract: string,
  hash: string,
  client: SecretNetworkClient,
  checkErrors = true,
): Promise<QueryResponse> => {
  let response = (await client.query.compute.queryContract({
    contractAddress: contract,
    codeHash: hash,
    query: query,
  })) as QueryResponse | string; // wtf secret.js

  if (typeof response === 'string' || response instanceof String)
    response = JSON.parse(response as string) as QueryResponse;

  console.log('Query:', query);
  console.log('Response:', response);
  if (checkErrors) checkError(response);
  return response;
};

export default function useQuery() {
  const { Address, QueryPermit, Querier } = useWallet();

  const queryWrapper = async (
    query: any,
    contract: string,
    hash: string,
    checkErrors = true,
  ): Promise<QueryResponse> => {
    try {
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

  const queryNFTContract = async (query: object, withPermit = false) => {
    if (withPermit)
      query = {
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

    const response = await queryWrapper(
      query,
      process.env.REACT_APP_NFT_ADDR,
      process.env.REACT_APP_NFT_HASH,
    );
    return response;
  };

  const queryManagerContract = async (query: object, withPermit = false, checkErrors = true) => {
    if (withPermit)
      query = {
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

    const response = await queryWrapper(
      query,
      process.env.REACT_APP_MANAGER_ADDR,
      process.env.REACT_APP_MANAGER_HASH,
      checkErrors,
    );
    return response;
  };

  const queryCredits = async () => {
    if (!QueryPermit) throw new Error('QueryPermit not available.');

    const query = {
      remaining_certs: {
        viewer: {
          address: Address,
        },
      },
    };

    const response: RemainingCertsResponse | undefined = await queryManagerContract(query, true);
    return parseInt(response?.remaining_certs?.certs || '0', 10);
  };

  const queryIssuerData = async (): Promise<Issuer> => {
    if (!Querier) throw new Error('Client not available.');
    if (!QueryPermit) throw new Error('QueryPermit not available.');

    const query = {
      issuer_data: {
        viewer: {
          address: Address,
        },
      },
    };

    const response = (await queryManagerContract(query, true)) as IssuerDataResponse;
    return response?.issuer_data.issuer;
  };

  const queryPubIssuerData = async (issuerId: string): Promise<PubIssuerData> => {
    if (!Querier) throw new Error('Client not available.');

    const query = {
      get_issuer: {
        issuer_id: issuerId,
      },
    };

    const response = (await queryManagerContract(query)) as GetIssuerResponse;
    return response?.get_issuer;
  };

  const queryCertPrice = async (): Promise<number> => {
    if (!Querier) throw new Error('Client not available.');

    const query = {
      display_cost: {},
    };

    const response = (await queryManagerContract(query)) as CertPriceResponse;
    return parseInt(response?.display_cost.cost_data.amount, 10);
    //return parseInt(response?.cert_price.pay_data.amount, 10);
  };

  const queryProjects = async () => {
    if (!Querier) throw new Error('Client not available.');
    if (!QueryPermit) throw new Error('QueryPermit not available.');

    const query = {
      list_projects: {},
    };

    const response = (await queryManagerContract(query, true)) as ListProjectsResponse;
    return response?.list_projects?.data_list;
  };

  const queryProjectData = async (projectId: string): Promise<ProjectToken[]> => {
    if (!Querier) throw new Error('Client not available.');
    if (!QueryPermit) throw new Error('QueryPermit not available.');

    const query = {
      project_contents: {
        project_id: projectId,
        viewer: Address,
      },
    };

    const response = (await queryManagerContract(query, true)) as ProjectDataResponse;
    console.log(response);
    checkError(response);

    return response?.project_contents.data_list;
  };

  const getOwnedCerts = async () => {
    if (!QueryPermit) throw new Error('QueryPermit not available.');

    // query owned token IDs
    const tokensQuery = {
      tokens: {
        owner: Address,
      },
    };

    const { token_list } = (await queryNFTContract(tokensQuery, true)) as Snip721GetTokensResponse;
    if (!token_list.tokens.length) return [];

    // query NFT metadata
    const dossierQuery = {
      batch_nft_dossier: {
        token_ids: token_list.tokens,
      },
    };

    const response = (await queryNFTContract(dossierQuery, true)) as BatchDossierResponse;
    return response.batch_nft_dossier.nft_dossiers;
  };

  const getCertPub = async (token_id: string) => {
    // query NFT metadata
    const dossierQuery = {
      nft_dossier: {
        token_id: token_id,
      },
    };

    const response = (await queryNFTContract(dossierQuery)) as DossierResponse;

    return response.nft_dossier;
  };

  const getCert = async (token_id: string) => {
    if (!QueryPermit) throw new Error('QueryPermit not available.');

    // query NFT metadata
    const dossierQuery = {
      nft_dossier: {
        token_id: token_id,
      },
    };

    const response = (await queryNFTContract(dossierQuery, true)) as DossierResponse;

    return response.nft_dossier;
  };

  const getCertAccessCode = async (token_id: string, access_code: string) => {
    // query NFT metadata
    const dossierQuery = {
      nft_dossier: {
        token_id,
        access_code,
      },
    };

    const response = (await queryNFTContract(dossierQuery)) as DossierResponse;

    return response.nft_dossier;
  };

  const getViewKey = async (address: string) => {
    if (!window.keplr) throw new Error('Keplr not available.');

    //get view key
    const vkey = await window.keplr.getSecret20ViewingKey(
      process.env.REACT_APP_CHAIN_ID as string,
      address,
    );
    return vkey;
  };

  const getSSCRTBalance = async () => {
    if (!Querier) throw new Error('Querier Client not available.');

    console.log('Snip20 Address', process.env.REACT_APP_SNIP20_ADDR);
    //get view key
    const vkey = await getViewKey(process.env.REACT_APP_SNIP20_ADDR as string);
    console.log(vkey);

    if (!vkey) return 0;
    // todo convert this to use the wrapper
    const response = await Querier.query.snip20.getBalance({
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
    if (!Querier) throw new Error('Querier not available.');

    const response = await Querier.query.bank.balance({
      address: Address,
      denom: 'uscrt',
    });
    checkError(response);
    return parseInt(response.balance?.amount || '0', 10) / 10e5;
  };

  const queryNFTWhitelist = async (token_id: string): Promise<TokenApprovals> => {
    if (!QueryPermit) throw new Error('QueryPermit not available.');

    // query NFT metadata
    const approvalQuery = {
      token_approvals: {
        token_id: token_id,
        include_expired: true,
      },
    };

    const response = (await queryNFTContract(approvalQuery, true)) as TokenApprovalsResponse;

    return response.token_approvals;
  };

  const queryNFTDossier = async (token_id: string): Promise<NftDossier> => {
    if (!QueryPermit) throw new Error('QueryPermit not available.');

    // query NFT metadata
    const approvalQuery = {
      nft_dossier: {
        token_id: token_id,
      },
    };

    const response = await queryNFTContract(approvalQuery, true);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    return response.nft_dossier;
  };

  return {
    queryNFTContract,
    queryManagerContract,
    queryCredits,
    queryIssuerData,
    getOwnedCerts,
    getCert,
    getSSCRTBalance,
    getSCRTBalance,
    queryProjects,
    queryProjectData,
    queryNFTWhitelist,
    queryNFTDossier,
    getCertAccessCode,
    queryPubIssuerData,
    getCertPub,
    queryCertPrice,
  };
}
