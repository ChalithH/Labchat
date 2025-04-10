import React from 'react'
import { useState } from 'react'

import { TEST_DATA, USER_DATA } from '../../../testdata'

import Navigation from '../../../components/Navigation'
import ThreadAuthorGroup from '../../../components/ThreadAuthorGroup'


const DiscussionThread = ({ params }:{ params: { id: string } }): React.ReactNode => {
    const thread_id = parseInt(params.id, 10);

    const matching_thread = TEST_DATA.flatMap(topic => topic.threads)
        .find(thread => thread.id === thread_id);
        
    if (!matching_thread)
        return <p>Not found</p>
    
    return (
        <section className="m-auto w-[90dvw] flex flex-col gap-3">
            <Navigation />
            <h1 className="text-3xl font-bold play-font">{ matching_thread.title }</h1>

            <div>
                <ThreadAuthorGroup role={ USER_DATA.title } name={ USER_DATA.name } />
            </div>

            <div className="p-4 rounded-3xl bg-blue-50">
                <p>{ matching_thread.content }</p>
            </div>

            <div className="p-4 barlow-font rounded-3xl bg-blue-50 flex flex-col gap-4">
                <textarea 
                    className="bg-white p-4 w-[100%] rounded-2xl"
                    placeholder="Type a comment" />
                
                <div className="w-[100%] flex justify-between items-center">
                    <div className="">
                        <ThreadAuthorGroup role={ USER_DATA.title } name={ USER_DATA.name } />
                    </div>

                    <button className="rounded-xl bg-sky-600 p-2 px-4 text-white">Post Reply</button>
                </div>
            </div>
        </section>
    )
}

export default DiscussionThread