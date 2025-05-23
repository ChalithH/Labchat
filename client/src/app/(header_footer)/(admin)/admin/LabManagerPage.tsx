import React from 'react'
import UniqueLab from '../components/UniqueLab'

export default function Admin() {
    const labName = "Binary Lab"

    return (
        <div className="flex flex-col gap-4">
            <h1 className=" mt-3 flex justify-center items-center font-play font-extrabold text-black text-[clamp(1.5rem,4vw,2rem)]">
            {labName} Dashboard
            </h1>
            <UniqueLab />
        </div>
    )
}