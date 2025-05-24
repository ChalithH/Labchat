import React from 'react'
import LabsContainer from '../components/LabsContainer'

export default function Admin() {
    return (
        <div className="flex flex-col gap-4">
            <h1 className=" mt-3 flex justify-center items-center font-play font-extrabold text-black text-[clamp(1.5rem,4vw,2rem)]">
            Admin Dashboard
            </h1>
            <LabsContainer />
        </div>
    )
}