1) Create the mint authority:
```solana-keygen grind --starts-with bos:1```
2) Make Solana use the generated keypair to sign transactions: ```solana config set --keypair <GENERATED_JSON_file>```
3) Aidrop some sol: ```solana airdrop 2```
4) Make a Token Mint account: ```solana-keygen grind --starts-with mnt:1```
5) Put a Token Mint account at that address: ```spl-token create-token --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb --enable-metadata  mntKokaM6C8AGDwx61ExWe4QrNbV9w5RJBQaTyqF8gL```
6) Use metadata for solana: ```spl-token initialize-metadata mntKokaM6C8AGDwx61ExWe4QrNbV9w5RJBQaTyqF8gL 'Uli' 'ULI' https://raw.githubusercontent.com/ulieth/Solana-Projects/main/project3/metadata.json```
