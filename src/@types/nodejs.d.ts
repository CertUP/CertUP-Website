declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test';
    REACT_APP_GRPC_URL: string;
    REACT_APP_CHAIN_ID: string;

    REACT_APP_NFT_ADDR: string;
    REACT_APP_NFT_HASH: string;

    REACT_APP_MANAGER_ADDR: string;
    REACT_APP_MANAGER_HASH: string;

    REACT_APP_OLD_MANAGER_ADDR: string;
    REACT_APP_OLD_MANAGER_HASH: string;

    REACT_APP_SNIP20_ADDR: string;
    REACT_APP_SNIP20_HASH: string;

    REACT_APP_BACKEND: string;

    REACT_APP_EXPLORER_URL: string;
  }
}
