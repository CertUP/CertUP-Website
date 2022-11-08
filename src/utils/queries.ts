import { PermitSignature } from '../interfaces';
import { allowedTokens, permissions, permitName } from './loginPermit';

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

export class RemainingCertsQueryMsg {
  public remaining_certs: {
    viewer: string;
    key?: string;
  };
  constructor(viewer: string, key?: string) {
    this.remaining_certs = {
      viewer,
      key,
    };
  }
}

export class IssuerDataQueryMsg {
  public issuer_data: {
    viewer: string;
    key?: string;
    address?: string;
  };
  constructor(viewer: string, key?: string, address?: string) {
    this.issuer_data = {
      viewer,
      key,
      address,
    };
  }
}
