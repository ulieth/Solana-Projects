'use client'

import { Keypair, PublicKey } from '@solana/web3.js'
import { useMemo, useState } from 'react'
import { useTokenvestingProgram, useTokenvestingProgramAccount } from './tokenvesting-data-access'
import { useWallet } from '@solana/wallet-adapter-react'

export function TokenvestingCreate() {
  const { createVestingAccount } = useTokenvestingProgram()

  const [company, setCompany] = useState('');
  const [mint, setMint] = useState('');
  const {publicKey} = useWallet();


  const isFormValid = company.length > 0 && mint.length > 0 && publicKey;
  const handleSumbit = () => {
    if (isFormValid && publicKey) {
      createVestingAccount.mutateAsync({companyName: company, mint: mint})
    }
  };
  if (!publicKey) {
    return <p>Connect your wallet</p>;
  }


  return (
    <div>
      <input
        type="text"
        placeholder="Company name"
        className="input input-bordered w-full max-w-xs"
        value={company}
        onChange={(e) => setCompany(e.target.value)}
      />
      <input
        type="text"
        placeholder="Mint address"
        className="input input-bordered w-full max-w-xs"
        value={mint}
        onChange={(e) => setMint(e.target.value)}
      />
      <button
      className="btn btn-xs lg:btn-md btn-primary"
      onClick={handleSumbit}
      disabled={createVestingAccount.isPending || !isFormValid}
      >
      Create New Vesting Account {createVestingAccount.isPending && '...'}
      </button>

    </div>







  )
}

export function TokenvestingList() {
  const { accounts, getProgramAccount } = useTokenvestingProgram()

  if (getProgramAccount.isLoading) {
    return <span className="loading loading-spinner loading-lg"></span>
  }
  if (!getProgramAccount.data?.value) {
    return (
      <div className="alert alert-info flex justify-center">
        <span>Program account not found. Make sure you have deployed the program and are on the correct cluster.</span>
      </div>
    )
  }
  return (
    <div className={'space-y-6'}>
      {accounts.isLoading ? (
        <span className="loading loading-spinner loading-lg"></span>
      ) : accounts.data?.length ? (
        <div className="grid md:grid-cols-2 gap-4">
          {accounts.data?.map((account) => (
            <TokenvestingCard key={account.publicKey.toString()} account={account.publicKey} />
          ))}
        </div>
      ) : (
        <div className="text-center">
          <h2 className={'text-2xl'}>No accounts</h2>
          No accounts found. Create one above to get started.
        </div>
      )}
    </div>
  )
}

function TokenvestingCard({ account }: { account: PublicKey }) {
  const { accountQuery, createEmployeeVesting} = useTokenvestingProgramAccount({
    account,
  })

  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [cliffTime, setCliffTime] = useState(0);
  const [beneficiary, setBeneficiary] = useState('');

  const companyName = useMemo(() => accountQuery.data?.companyName, [accountQuery.data?.companyName]);


  return accountQuery.isLoading ? (
    <span className="loading loading-spinner loading-lg"></span>
  ) : (
    <div className="card card-bordered border-base-300 border-4 text-neutral-content">
      <div className="card-body items-center text-center">
        <div className="space-y-6">
          <h2 className="card-title justify-center text-3xl cursor-pointer" onClick={() => accountQuery.refetch()}>
            {companyName}
          </h2>
          <div className="card-actions justify-around">

            <input
              type="text"
              placeholder="Start time"
              className="input input-bordered w-full max-w-xs"
              value={startTime || ''}
              onChange={(e) => setStartTime(parseInt(e.target.value))}
            />
            <input
              type="text"
              placeholder="End time"
              className="input input-bordered w-full max-w-xs"
              value={endTime || ''}
              onChange={(e) => setEndTime(parseInt(e.target.value))}
            />
             <input
              type="text"
              placeholder="Total Allocation"
              className="input input-bordered w-full max-w-xs"
              value={totalAmount || ''}
              onChange={(e) => setTotalAmount(parseInt(e.target.value))}
            />
            <input
              type="text"
              placeholder="Cliff Time"
              className="input input-bordered w-full max-w-xs"
              value={cliffTime || ''}
              onChange={(e) => setCliffTime(parseInt(e.target.value))}
            />
              <input
              type="text"
              placeholder="Beneficiary Address"
              className="input input-bordered w-full max-w-xs"
              value={beneficiary}
              onChange={(e) => setBeneficiary(e.target.value)}
            />

            <button
              className="btn btn-xs lg:btn-md btn-outline"
              onClick={() => createEmployeeVesting.mutateAsync({
                startTime,
                endTime,
                totalAmount,
                cliffTime,
                beneficiary
              })}
              disabled={createEmployeeVesting.isPending}
            >
              Create Employee Vesting Account
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
