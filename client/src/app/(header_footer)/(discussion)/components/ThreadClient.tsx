import React from 'react'

import { TEST_DATA, FIRST_USER_DATA } from '@/app/testdata'

import Navigation from './Navigation'
import ThreadAuthorGroup from '@/components/discussion/ThreadAuthorGroup'
import { Button } from '@/components/ui/button'


const ThreadClient = async ({ post, params }:{ post: any, params: { id: string } }) => {
    const { id } = await params
    const thread_id = parseInt(id, 10)

    const matching_thread = TEST_DATA.flatMap(topic => topic.threads)
        .find(thread => thread.id === thread_id);
        
    if (!matching_thread)
        return <p>Not found</p>
    
    return (
        <main className="m-auto w-[90dvw] barlow-font flex flex-col gap-3">
            <Navigation />
            <h1 className="text-3xl font-bold play-font">{ matching_thread.title }</h1>

            <div className="flex justify-between items-center">
                <ThreadAuthorGroup role={ FIRST_USER_DATA.title } name={ FIRST_USER_DATA.name } size={ 48 } />
                
                <div className="text-right text-sm">
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
                        <ThreadAuthorGroup role={ FIRST_USER_DATA.title } name={ FIRST_USER_DATA.name } size={ 42 } />
                    </div>

                    {/* <button className="rounded-xl bg-sky-600 p-2 px-4 text-white">Post Reply</button> */}
                    <Button variant="outline">Post Reply</Button>
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
                    
                    <div className="flex justify-between items-start">
                        <ThreadAuthorGroup role={ FIRST_USER_DATA.title } name={ FIRST_USER_DATA.name } size={ 42 } />
                        <p className="text-sm">Posted { reply.post_Date }</p>
                    </div>

                    <p>{ reply.content }</p>
                </div>
            ) }
        </main>
    )
}

export default ThreadClient