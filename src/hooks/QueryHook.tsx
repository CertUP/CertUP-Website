import { Snip721GetTokensResponse } from 'secretjs/dist/extensions/snip721/msg/GetTokens';
import { useWallet } from '../contexts';
import {
  BatchDossierResponse,
  DossierResponse,
  NftDossier,
  TokenApprovals,
  TokenApprovalsResponse,
} from '../interfaces/721';
import {
  RemainingCertsResponse,
  IssuerDataResponse,
  PubIssuerData,
  GetIssuerResponse,
  CertPriceResponse,
  ListProjectsResponse,
  ProjectToken,
  ProjectDataResponse,
  Issuer,
} from '../interfaces/manager';
import { RemainingCertsQueryMsg } from '../utils/queries';
import { checkError, queryManagerContract, queryNFTContract } from '../utils/queryWrapper';

export default function useQuery() {
  const { Address, QueryPermit, Querier } = useWallet();

  const queryCredits = async () => {
    if (!QueryPermit) throw new Error('QueryPermit not available.');

    const query = new RemainingCertsQueryMsg(Address);

    const response: RemainingCertsResponse | undefined = await queryManagerContract({
      query,
      signature: QueryPermit,
    });
    return parseInt(response?.remaining_certs?.certs || '0', 10);
  };

  const queryIssuerData = async (): Promise<Issuer> => {
    if (!QueryPermit) throw new Error('QueryPermit not available.');

    const query = {
      issuer_data: {
        viewer: {
          address: Address,
        },
      },
    };

    const response = (await queryManagerContract({
      query,
      signature: QueryPermit,
    })) as IssuerDataResponse;
    return response?.issuer_data.issuer;
  };

  const queryPubIssuerData = async (issuerId: string): Promise<PubIssuerData> => {
    const query = {
      get_issuer: {
        issuer_id: issuerId,
      },
    };

    const response = (await queryManagerContract({ query })) as GetIssuerResponse;
    return response?.get_issuer;
  };

  const queryCertPrice = async (): Promise<number> => {
    const query = {
      display_cost: {},
    };

    const response = (await queryManagerContract({ query })) as CertPriceResponse;
    return parseInt(response?.display_cost.cost_data.amount, 10);
    //return parseInt(response?.cert_price.pay_data.amount, 10);
  };

  const queryProjects = async () => {
    if (!QueryPermit) throw new Error('QueryPermit not available.');

    const query = {
      list_projects: {},
    };

    const response = (await queryManagerContract({
      query,
      signature: QueryPermit,
    })) as ListProjectsResponse;
    return response?.list_projects?.data_list;
  };

  const queryProjectData = async (projectId: string): Promise<ProjectToken[]> => {
    if (!QueryPermit) throw new Error('QueryPermit not available.');

    const query = {
      project_contents: {
        project_id: projectId,
        viewer: Address,
      },
    };

    const response = (await queryManagerContract({
      query,
      signature: QueryPermit,
    })) as ProjectDataResponse;
    console.log(response);
    checkError(response);

    return response?.project_contents.data_list;
  };

  const getOwnedCerts = async () => {
    if (!QueryPermit) throw new Error('QueryPermit not available.');

    // query owned token IDs
    const tokenQuery = {
      tokens: {
        owner: Address,
      },
    };

    const { token_list } = (await queryNFTContract({
      query: tokenQuery,
      signature: QueryPermit,
    })) as Snip721GetTokensResponse;
    if (!token_list.tokens.length) return [];

    // query NFT metadata
    const dossiersQuery = {
      batch_nft_dossier: {
        token_ids: token_list.tokens,
      },
    };

    const response = (await queryNFTContract({
      query: dossiersQuery,
      signature: QueryPermit,
    })) as BatchDossierResponse;
    return response.batch_nft_dossier.nft_dossiers;
  };

  const getCertPub = async (token_id: string) => {
    // query NFT metadata
    const query = {
      nft_dossier: {
        token_id: token_id,
      },
    };

    const response = (await queryNFTContract({ query })) as DossierResponse;

    return response.nft_dossier;
  };

  const getCert = async (token_id: string) => {
    if (!QueryPermit) throw new Error('QueryPermit not available.');

    // query NFT metadata
    const query = {
      nft_dossier: {
        token_id: token_id,
      },
    };

    const response = (await queryNFTContract({
      query,
      signature: QueryPermit,
    })) as DossierResponse;

    return response.nft_dossier;
  };

  const getCertAccessCode = async (token_id: string, access_code: string) => {
    // query NFT metadata
    const query = {
      nft_dossier: {
        token_id,
        access_code,
      },
    };

    const response = (await queryNFTContract({ query })) as DossierResponse;

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
    const query = {
      token_approvals: {
        token_id: token_id,
        include_expired: true,
      },
    };

    const response = (await queryNFTContract({
      query,
      signature: QueryPermit,
    })) as TokenApprovalsResponse;

    return response.token_approvals;
  };

  const queryNFTDossier = async (token_id: string): Promise<NftDossier> => {
    if (!QueryPermit) throw new Error('QueryPermit not available.');

    // query NFT metadata
    const query = {
      nft_dossier: {
        token_id: token_id,
      },
    };

    const response = await queryNFTContract({ query, signature: QueryPermit });
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    return response.nft_dossier;
  };

  return {
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
