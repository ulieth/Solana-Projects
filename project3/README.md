1) Create the min-authority:
```solana-keygen grind --starts-with bos:1```
2) Make Solana use that keypair to sign transactions: ```solana config set --keypair <json file>```
3) Aidrop some sol
4) Make a Token Mint: ```solana-keygen grind --starts-with mnt:1```
5) Put a Token Mint at that address ```spl-token create-token --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb --enable-metadata  mntkLkQfD6ijFVyvZVX4ptEYTYfVtynFu4ykfJke82k.json```
