import { permissions, allowedTokens, permitName } from './loginPermit';
import { Permit, SecretNetworkClient } from 'secretjs';
import { BatchDossierResponse, DossierResponse, PermitSignature } from '../interfaces';
import { Snip721GetTokensResponse } from 'secretjs/dist/extensions/snip721/msg/GetTokens';

// const getAllOwnedDossiers = async (
//   client: SecretNetworkClient,
//   address: string,
//   permit: PermitSignature,
// ) => {
//   // query owned token IDs
//   const tokensQuery = {
//     tokens: {
//       owner: address,
//     },
//   };

//   const { token_list } = (await queryPermitNFTContract(
//     client,
//     tokensQuery,
//     permit,
//   )) as Snip721GetTokensResponse;

//   // query NFT metadata
//   const dossierQuery = {
//     batch_nft_dossier: {
//       token_ids: token_list.tokens,
//     },
//   };

//   const response = (await queryPermitNFTContract(
//     client,
//     dossierQuery,
//     permit,
//   )) as BatchDossierResponse;

//   return response.batch_nft_dossier.nft_dossiers;
// };

// const getDossier = async (
//   client: SecretNetworkClient,
//   address: string,
//   permit: PermitSignature,
//   token_id: string,
// ) => {
//   // query NFT metadata
//   const dossierQuery = {
//     nft_dossier: {
//       token_id: token_id,
//     },
//   };

//   const response = (await queryPermitNFTContract(
//     client,
//     dossierQuery,
//     permit,
//   )) as DossierResponse;
//   console.log('doss', response);

//   return response.nft_dossier;
// };

export // WithPermit,
// queryNFTContract,
// queryPermitNFTContract,
// getAllOwnedDossiers,
// getDossier,
 {};
