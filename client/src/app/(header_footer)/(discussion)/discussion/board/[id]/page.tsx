import React from 'react'

import setUsersLastViewed from '@/lib/set_last_viewed'
import getUserFromSessionServer from '@/lib/get_user_server'
import { redirect } from 'next/navigation'
import { LabProvider } from '@/contexts/lab-context'
import BoardClient from '../../../components/clients/BoardClient'

type Params = Promise<{ id: number }>

const DiscussionBoard = async (props: { params: Params }) => {
    const params = await props.params
    const id = params.id

    setUsersLastViewed(`/discussion/board/${id}`)
    
    const user = await getUserFromSessionServer()
    if (!user) {
        redirect('/home')
    }

    const currentLabId = user.lastViewedLabId || 1

    return (
        <LabProvider initialLabId={currentLabId}>
            <BoardClient params={{ id: `${id}` }} />
        </LabProvider>
    )
}

export default DiscussionBoard 