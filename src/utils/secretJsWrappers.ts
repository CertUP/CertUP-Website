import { permissions, allowedTokens, permitName } from './loginPermit';
import { Permit, SecretNetworkClient } from 'secretjs';
import { BatchDossierResponse, DossierResponse, PermitSignature } from '../interfaces';
import { Snip721GetTokensResponse } from 'secretjs/dist/extensions/snip721/msg/GetTokens';

class WithPermit {
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

const queryCertupContract = async (client: SecretNetworkClient, query: object) => {
  return await client?.query.compute.queryContract({
    contractAddress: process.env.REACT_APP_CONTRACT_ADDR as string,
    codeHash: process.env.REACT_APP_CONTRACT_HASH as string,
    query: query,
  });
};

const queryPermitCertupContract = async (
  client: SecretNetworkClient,
  query: object,
  permit: PermitSignature,
) => {
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
        signature: permit,
      },
    },
  };
  //console.log('wrapped permit query', permitQuery);

  return await client?.query.compute.queryContract({
    contractAddress: process.env.REACT_APP_CONTRACT_ADDR as string,
    codeHash: process.env.REACT_APP_CONTRACT_HASH as string,
    query: permitQuery,
  });
};

const getAllOwnedDossiers = async (
  client: SecretNetworkClient,
  address: string,
  permit: PermitSignature,
) => {
  // query owned token IDs
  const tokensQuery = {
    tokens: {
      owner: address,
    },
  };

  const { token_list } = (await queryPermitCertupContract(
    client,
    tokensQuery,
    permit,
  )) as Snip721GetTokensResponse;

  // query NFT metadata
  const dossierQuery = {
    batch_nft_dossier: {
      token_ids: token_list.tokens,
    },
  };

  const response = (await queryPermitCertupContract(
    client,
    dossierQuery,
    permit,
  )) as BatchDossierResponse;

  return response.batch_nft_dossier.nft_dossiers;
};

const getDossier = async (
  client: SecretNetworkClient,
  address: string,
  permit: PermitSignature,
  token_id: string,
) => {
  // query NFT metadata
  const dossierQuery = {
    nft_dossier: {
      token_id: token_id,
    },
  };

  const response = (await queryPermitCertupContract(
    client,
    dossierQuery,
    permit,
  )) as DossierResponse;
  console.log('doss', response);

  return response.nft_dossier;
};

export {
  WithPermit,
  queryCertupContract,
  queryPermitCertupContract,
  getAllOwnedDossiers,
  getDossier,
};
