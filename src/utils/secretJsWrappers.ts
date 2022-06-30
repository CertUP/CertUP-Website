import { permissions, allowedTokens, permitName } from './loginPermit';
import { Permit, SecretNetworkClient } from 'secretjs';
import { PermitSignature } from '../interfaces';

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
  console.log('wrapped permit query', permitQuery);

  return await client?.query.compute.queryContract({
    contractAddress: process.env.REACT_APP_CONTRACT_ADDR as string,
    codeHash: process.env.REACT_APP_CONTRACT_HASH as string,
    query: permitQuery,
  });
};

export { WithPermit, queryCertupContract, queryPermitCertupContract };
