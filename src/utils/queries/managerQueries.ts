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
    issuer?: string;
  };
  constructor({ viewer, key, issuer }: { viewer: string; key?: string; issuer?: string }) {
    this.issuer_data = {
      viewer,
      key,
      issuer,
    };
  }
}

export class ListIssuersQueryMsg {
  public list_issuers: {
    start_page: number;
    page_size: number;
    viewer: string;
    key?: string;
  };
  constructor({
    start_page = 0,
    page_size = 200,
    viewer,
    key,
  }: {
    start_page?: number;
    page_size?: number;
    viewer: string;
    key?: string;
  }) {
    this.list_issuers = {
      start_page,
      page_size,
      viewer,
      key,
    };
  }
}
