import { PermitSignature } from '../../interfaces';
import { allowedTokens, permissions, permitName } from '../loginPermit';

export class PermitQuery {
  with_permit: {
    query: any;
    permit: {
      params: {
        permit_name: string;
        allowed_tokens: (string | undefined)[];
        chain_id: string;
        permissions: string[];
      };
      signature: PermitSignature;
    };
  };
  constructor(query: any, signature: PermitSignature) {
    this.with_permit = {
      query,
      permit: {
        params: {
          permit_name: permitName,
          allowed_tokens: allowedTokens,
          chain_id: process.env.REACT_APP_CHAIN_ID,
          permissions: permissions,
        },
        signature,
      },
    };
  }
}
