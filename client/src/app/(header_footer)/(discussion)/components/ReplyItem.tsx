import { useState } from 'react'
import { HiChevronDown, HiChevronUp } from 'react-icons/hi'
import { Button } from '@/components/ui/button'
import EditReply from './EditReply'
import { Trash } from 'lucide-react'
import ReactionBar from './ReactionBar'
import { PermissionConfig } from '@/config/permissions'
import ProfilePicture from '@/components/profilePicture/ProfilePicture'

export const ReplyItem = ({ reply, postId, currentMemberId, onReply, confirmDeleteReply, userPermission }:{ reply: any, postId: number, currentMemberId: number, onReply: (id: number, content: string) => void, confirmDeleteReply: (reply: any) => void, userPermission: number}) => {
  const [isReplying, setIsReplying] = useState(false)
  const [replyContent, setReplyContent] = useState('')
  const [showChildren, setShowChildren] = useState(false)

  const handleReply = () => {
    if (!replyContent.trim()) return
    onReply(reply.id, replyContent)
    setReplyContent('')
    setIsReplying(false)
  }

  return (
    <div className="mt-4 pl-4 border-l border-muted">
      <div className="flex gap-x-2 items-start">
        <ProfilePicture 
            user_id={reply.member.user.id}
            profilePic={reply.member.user.profilePic}
            name={reply.member.user.displayName}
            size={10} 
        />
        <div className="flex-1">
          <div className="font-semibold text-sm">{reply.member.user.displayName}</div>
          <div className="text-xs text-muted-foreground">{new Date(reply.createdAt).toLocaleString('en-GB')}</div>
          
          <div className='flex justify-between items-start'>
           <p className="text-sm mt-1">{reply.content}</p>
            {(reply.memberId === currentMemberId || userPermission >= PermissionConfig.MODIFY_ALL_POSTS_REPLIES) &&
            <div className='flex space-x-4'>
              <EditReply reply={reply} />
              <Trash onClick={() => confirmDeleteReply(reply)} className='w-5 h-5 text-muted-foreground' />
            </div>}
          </div>
          
          <div className="flex items-center mt-2 space-x-2">
            <ReactionBar type='reply' id={ reply.id } currentUserId={ currentMemberId } />

            <Button
              variant="outline"
              size="sm"
              className="text-xs text-muted-foreground"
              onClick={ () => setIsReplying(!isReplying) }>
              { isReplying ? 'Cancel' : 'Reply' }
            </Button>
          </div>

          {isReplying && 
            <div className="mt-2 space-y-2">
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                className="w-full p-2 border rounded-sm text-sm"
                placeholder="Write a reply..."/>
                  <Button size="sm" onClick={handleReply}>
                    Post Reply
                  </Button>
            </div>
          }

          {reply.children && reply.children.length > 0 && 
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground mt-2 flex items-center gap-1"
              onClick={() => setShowChildren(!showChildren)}>
                {showChildren ? <HiChevronUp className="w-4 h-4" /> : <HiChevronDown className="w-4 h-4" />}
                {showChildren ? 'Hide Replies' : 'Show Replies'}
            </Button>
          }

          {showChildren &&
            reply.children?.map((child: any) => (
              <ReplyItem
                key={ child.id }
                reply={ child }
                postId={ postId }
                currentMemberId={ currentMemberId }
                onReply={ onReply }
                confirmDeleteReply={ confirmDeleteReply }
                userPermission={ userPermission }/>
            ))}
        </div>
      </div>
    </div>
  )
}
