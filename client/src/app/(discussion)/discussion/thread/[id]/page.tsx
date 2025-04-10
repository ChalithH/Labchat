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
        <section className="m-auto w-[90dvw] barlow-font flex flex-col gap-3">
            <Navigation />
            <h1 className="text-3xl font-bold play-font">{ matching_thread.title }</h1>

            <div className="flex justify-between items-center">
                <ThreadAuthorGroup role={ USER_DATA.title } name={ USER_DATA.name } />
                
                <div className="text-right">
                    <p>Posted { matching_thread.post_date }</p>
                    <p>Last activity { matching_thread.last_activity }</p>
                </div>
            </div>

            <div className="p-4 rounded-3xl bg-blue-50">
                <p>{ matching_thread.content }</p>
            </div>

            <div className="p-4 barlow-font rounded-3xl bg-blue-50 flex flex-col gap-4 my-8">
                <textarea 
                    className="bg-white p-4 w-[100%] rounded-2xl"
                    placeholder="Type a comment" />
                
                <div className="w-[100%] flex justify-between items-center">
                    <div>
                        <ThreadAuthorGroup role={ USER_DATA.title } name={ USER_DATA.name } />
                    </div>

                    <button className="rounded-xl bg-sky-600 p-2 px-4 text-white">Post Reply</button>
                </div>
            </div>

            <div className='flex justify-between pb-[24px]'>
                <h1 className="play-font w-[90dvw] m-auto text-3xl font-bold">Replies</h1>
                <img 
					className="rotate-270"
					src="/play_arrow_filled_black.svg" 
					alt="Drop down button to see replies" />
            </div>

            { matching_thread.replies.map( reply =>
                <div key={ reply.id }
                    className="p-4 barlow-font rounded-3xl bg-blue-50 flex flex-col gap-4">
                    
                    <div className="flex justify-between items-center">
                        <ThreadAuthorGroup role={ USER_DATA.title } name={ USER_DATA.name } />
                        <p>Posted { reply.post_Date }</p>
                    </div>

                    <p>{ reply.content }</p>
                </div>
            ) }
            
        </section>
    )
}

export default DiscussionThread