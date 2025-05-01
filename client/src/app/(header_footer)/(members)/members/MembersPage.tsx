import React from 'react'
import MembersContainer from '../components/MembersContainer'

export default function Members() {
    return (
        <div className="flex flex-col gap-4">
            <h1 className=" mt-3 flex justify-center items-center font-play font-extrabold text-black text-[clamp(1.5rem,4vw,2rem)]">
            {"Binary Lab"} Members
            </h1>
        < MembersContainer />
        </div>
    )
}