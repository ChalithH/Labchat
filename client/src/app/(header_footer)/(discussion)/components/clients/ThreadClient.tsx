import ThreadAuthorGroup from '@/components/discussion/ThreadAuthorGroup'
import { Button } from '@/components/ui/button'
import { PostType } from '@/types/post.type'
import { ReplyType } from '@/types/reply.type'
import { UserType } from '@/types/User.type'
import ResolveRoleName from '@/lib/resolve_role_name.util'


type ThreadClientProps = {
    post: PostType,
    replies: ReplyType[],
    replyUsers: UserType[],
    author: UserType,
    authorRole: string,
    user: UserType,
    userRole: string
}

const ThreadClient = async ({ post, replies, replyUsers, author, authorRole, user, userRole }: ThreadClientProps) => {
    return (
        <main className="m-auto w-[90dvw] barlow-font flex flex-col gap-3">
            <h1 className="text-3xl font-bold play-font">{ post.title }</h1>

            <div className="flex justify-between items-center">
                <ThreadAuthorGroup role={ authorRole } name={ author.displayName } size={ 48 } />
                
                <div className="text-right text-sm">
                    <p>Created { post.createdAt }</p>
                    <p>Last activity { post.updatedAt }</p>
                </div>
            </div>

            <div className="p-4 rounded-3xl bg-blue-50">
                <p>{ post.content }</p>
            </div>

            <div className="p-4 barlow-font rounded-3xl bg-blue-50 flex flex-col gap-4 my-8">
                <textarea 
                    className="bg-white p-4 w-[100%] rounded-2xl"
                    placeholder="Type a comment" />
                
                <div className="w-[100%] flex justify-between items-center">
                    <div>
                        <ThreadAuthorGroup role={ userRole } name={ user.displayName } size={ 42 } />
                    </div>

                    <Button variant="outline">Post Reply</Button>
                </div>
            </div>

            
            { replies.length > 0 && 
                <div className='flex justify-between pb-[24px]'>
                    <h1 className="play-font w-[90dvw] m-auto text-3xl font-bold">Replies</h1>
                    <img 
                        className="rotate-270"
                        src="/play_arrow_filled_black.svg" 
                        alt="Drop down button to see replies" />
                </div>
            }

            { replies.map(async (reply, index) => {
                const replyUser = replyUsers[index]

                return (
                <div key={ reply.id } className="p-4 barlow-font rounded-3xl bg-blue-50 flex flex-col gap-4">
                    <div className="flex justify-between items-start">
                    <ThreadAuthorGroup 
                        role={ await ResolveRoleName(replyUser.roleId) }
                        name={ replyUser.displayName } 
                        size={ 42 } 
                    />
                    <p className="text-sm">Posted { reply.createdAt }</p>
                    </div>
                    <p>{ reply.content }</p>
                </div>
                )
            }) }
        </main>
    )
}

export default ThreadClient